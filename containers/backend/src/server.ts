import {v4 as uuidv4} from 'uuid';
import * as k8s from '@kubernetes/client-node';
import {WebSocketServer} from "ws";
import http from "http";
import prometheusClient from "prom-client";
import {BackendOven, MessageType, Oven, Pizza, PodInfo, State} from "./types";

const PORT = parseInt(process.env.PORT || "1234", 10);

const SECONDS_TILL_QUEUE_ITERATION = 5;

const kubeConfig = new k8s.KubeConfig();
kubeConfig.loadFromDefault()
const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

const collectDefaultMetrics = prometheusClient.collectDefaultMetrics;
const prometheusRegistry = new prometheusClient.Registry();

const prometheusQueueLengthGauge = new prometheusClient.Gauge({ name: 'queue_length', help: 'queue_length_help' });
const prometheusUnusedCapacity = new prometheusClient.Gauge({ name: 'unused_capacity', help: 'unused_capacity_help' });

collectDefaultMetrics({ register: prometheusRegistry });
prometheusRegistry.registerMetric(prometheusQueueLengthGauge);
prometheusRegistry.registerMetric(prometheusUnusedCapacity);

async function updateOvensFromPods() {
    let pods: k8s.V1Pod[] = [];

    try {
        const res = await k8sApi.listNamespacedPod({ namespace: process.env.NAMESPACE || "default" });
        pods = res.items;
    } catch (err) {
        console.error("Error occurred whilst getting pods from k8s:", err);
        return;
    }

    const updatedPods: PodInfo[] = [];

    for(let pod of pods.filter(pod => pod.metadata?.labels?.app === "oven")) {
        console.log("IP: ", pod.status?.podIP);

        console.log(JSON.stringify(pod));
        
        let data;

        try {
            data = await fetch(`http://${pod.status?.podIP}:8080/PizzaOven/status`).then(res => res.json());
        } catch(error) {
            console.log(`Error: Oven '${pod.status?.podIP}' is unresponsive, skipping.`);
            continue;
        }
        
        const { ovenId, pizzas, ...otherProperties } = data as BackendOven;
        console.log("received data from oven", data);

        let ovenAlreadyExists = false;
        
        const formattedPizzas = pizzas.map(detailedPizza => ({ ...detailedPizza.pizza, secondsLeft: detailedPizza.secondsLeft }));

        state.ovens = state.ovens.map(oven => {
            if(oven.id.toLowerCase().trim() !== ovenId.toLowerCase().trim()) {
                return oven;
            }

            ovenAlreadyExists = true;

            const updatedOven: Oven = {
                ...oven,
                ...otherProperties,
                isRunning: oven.isRunning,
                pizzas: formattedPizzas,
            };

            return updatedOven;
        })

        if(!ovenAlreadyExists) {
            state.ovens.push({
                ...otherProperties,
                isRunning: true,
                pizzas: formattedPizzas,
                id: ovenId
            });
        }

        updatedPods.push({
            ip: pod.status?.podIP,
            ovenId: ovenId,
            name: pod.metadata?.name,
            creationTimestamp: pod.metadata?.creationTimestamp,
            status: pod.status?.containerStatuses
        })
    }

    state.metrics.pods = updatedPods;

    console.log(updatedPods);
    
    console.log("Updated ovens from server-side!");

    /* update prometheus metrics */
    const totalCapacity: number = state.ovens.map(oven => oven.capacity).reduce((accumulator, currentValue) => accumulator + currentValue);
    const currentLoad: number = state.ovens.map(oven => oven.currentLoad).reduce((accumulator, currentValue) => accumulator + currentValue);
    console.log("Total capacity:", totalCapacity, "Current Load:", currentLoad);

    prometheusQueueLengthGauge.set(state.queue.length);
    prometheusUnusedCapacity.set(totalCapacity - currentLoad);

    sendUpdateToAll();
}

async function addPizzaToQueue(description: string) {
    const pizza: Pizza = {description: description, id: uuidv4(), secondsLeft: 90, createdAt: new Date().toISOString() };
    state.queue.push(pizza);
    sendUpdateToAll();

    return true;
}

async function removePizzaFromOven(id: string) {
    let matchingOven = state.ovens.find(oven => {
        let hasPizza = !!oven.pizzas.find(pizza => pizza.id === id);

        console.log("has oven pizza?", oven.id, oven.pizzas, hasPizza);
        return hasPizza;
    });
    
    if(!matchingOven) {
        console.log(`Could not remove pizza with id ${id} because no matching oven exists.`);
        return;
    }

    const ovenPod = getOvenPodById(matchingOven.id);
    
    if(!ovenPod) {
        console.log(`Pod for oven ${matchingOven.id} does not exist.`);
        return;
    }

    await fetch(`http://${ovenPod.ip}:8080/PizzaOven/remove/${id}`, {
        method: "DELETE",
    }).then(res => {
        if(res.status === 200) {
            console.log("pizza was successfully removed");
        } else {
            throw new Error(`Could not remove pizza: ${res.status}, ${res.statusText}`);
        }
    }).catch(error => console.log(error));

    sendUpdateToAll();
}

async function scaleUpOvens() {
    console.log("Advice: scaling up and creating new oven pod ...");
}

function getOvenPodById(id: string) {
    return state.metrics.pods.find(pod => pod.ovenId === id);
}

async function processQueue() {
    if(state.timeTillNextQueueUpdate !== 0) {
        state.timeTillNextQueueUpdate -= 1;
        return;
    }

    state.timeTillNextQueueUpdate = SECONDS_TILL_QUEUE_ITERATION;

    if (state.queue.length === 0) {
        return;
    }

    // Detect when all ovens are full and call a function
    const allOvensFull = state.ovens.length > 0 && state.ovens.every(oven => oven.pizzas.length >= oven.capacity || oven.status === "Shutdown");

    if (allOvensFull) {
        console.log("All ovens are full!");
        scaleUpOvens();
    }
    
    for (const oven of state.ovens) {
        let availableSlots = oven.capacity - oven.pizzas.length;

        if(oven.status === "Shutdown") {
            console.log(`Oven ${oven.id} is already shutting down, availableSlots = 0, currently ${oven.pizzas.length}/${oven.capacity} pizzas`);
            availableSlots = 0;
        }

        if (availableSlots <= 0) continue;
      
        let queueIndex = 0;
      
        while (availableSlots > 0 && queueIndex < state.queue.length) {
          const currentOven = getOvenPodById(oven.id);
          if (!currentOven) break;
      
          const pizza = state.queue[queueIndex];
          if (!pizza) break;
      
          console.log(
            "calling add pizza request for oven",
            currentOven.ovenId,
            "with pod name",
            currentOven.name,
            "and ip",
            currentOven.ip
          );
      
          let success = false;
          try {
            const res = await fetch(`http://${currentOven.ip}:8080/PizzaOven/add`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description: pizza.description })
            });
      
            if (res.status !== 202) {
              throw new Error(`Could not add pizza to pod: ${res.status}, ${res.statusText}`);
            }
      
            console.log("pizza was successfully added");
            success = true;
          } catch (err) {
            console.error(err);
          }
      
          if (success) {
            state.queue.splice(queueIndex, 1);
            availableSlots--;
            continue; // next pizza now at the same index
          }
      
          queueIndex++; // try next pizza in queue
        }
    }

    clients.forEach(ws => {
        ws.send(JSON.stringify({
            type: MessageType.NOTIFY,
            message: `Warteschlange wird abgearbeitet ...`
        }));
    })

    sendUpdateToAll();
}

const clients = new Set<WebSocket>();

let state: State = {
    metrics: {
        pods: [] // some information about pods (id, cpu/memory)
        // pizza queue duration length
    },
    timeTillNextQueueUpdate: SECONDS_TILL_QUEUE_ITERATION,
    ovens: [],
    queue: []
};

const sendUpdate = (ws: WebSocket) => {
    const payload = JSON.stringify(state);
    ws.send(JSON.stringify({type: MessageType.UPDATE, state: payload}));
}

const sendUpdateToAll = () => {
    clients.forEach(ws => {
        sendUpdate(ws);
    })
}

// update every second
setInterval(updateOvensFromPods, 1000);

// send updates every second
setInterval(() => {
    processQueue();
    sendUpdateToAll();
}, 1000);

const httpServer = http.createServer(async (req, res) => {
    if (req.url === '/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(state));
    } else if(req.url === '/metrics' && req.method === 'GET') {
        const result = await prometheusRegistry.metrics();
        res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
        res.end(result);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
  });
  
httpServer.listen(PORT, () => {
    console.log(`HTTP Server listening on port ${PORT}`);
});

const wss = new WebSocketServer({ server: httpServer });

updateOvensFromPods();

wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);

    // Immediately send the full current state
    sendUpdate(ws);
    

    ws.addEventListener("message", async (message) => {
        try {
            const {type, ...otherData} = JSON.parse(message.data);

            console.log("Received message:", type);

            switch (type) {
                case MessageType.ADD_PIZZA:
                    console.log("Creating new pizza");
                    const success = await addPizzaToQueue(otherData.description);

                    if (success) {
                        ws.send(JSON.stringify({
                            type: MessageType.NOTIFY,
                            message: `Pizza '${otherData.description ?? 'undefiniert'}' wurde in die Warteschlange gelegt!`
                        }));
                    }
                    break;
                case MessageType.REMOVE_PIZZA:
                    const pizzaId = otherData.id;
                    
                    removePizzaFromOven(pizzaId);
                    ws.send(JSON.stringify({
                        type: MessageType.NOTIFY,
                        message: `Pizza wurde entfernt.`
                    }));
                    break;
                default:
                    console.log("Received unknown message type", type);
            }
        } catch (error) {
            console.log("Could not parse message: ", error);
        }
    });

    // Basic keep-alive / cleanup
    ws.addEventListener('close', () => {
        console.log(`Client disconnected`);
        clients.delete(ws)
    });

    ws.addEventListener('error', (error) => {
        console.log("Websocket error:", error);
        clients.delete(ws)
    });
});

console.log(`Server listening on port ${PORT}`); 