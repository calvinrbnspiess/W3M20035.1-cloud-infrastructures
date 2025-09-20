import {v4 as uuidv4} from 'uuid';
import * as k8s from '@kubernetes/client-node';
import {WebSocketServer} from "ws";
import {BackendOven, MessageType, Oven, Pizza, PodInfo, State} from "./types";

const PORT = parseInt(process.env.PORT || "1234", 10);

const SECONDS_TILL_QUEUE_ITERATION = 5;

const kubeConfig = new k8s.KubeConfig();
kubeConfig.loadFromDefault()
const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

async function updateOvensFromPods() {
    let pods: k8s.V1Pod[] = [];

    try {
        const res = await k8sApi.listNamespacedPod({ namespace: process.env.NAMESPACE || "default" });
        pods = res.items;
    } catch (err) {
        console.error("Error occurred whilst getting pods from k8s:", err);
    }

    const updatedPods: PodInfo[] = [];

    for(let pod of pods.filter(pod => pod.metadata?.labels?.app === "oven")) {
        console.log("IP: ", pod.status?.podIP);

        console.log(JSON.stringify(pod));

        const data = await fetch(`http://${pod.status?.podIP}:8080/PizzaOven/status`).then(res => res.json());
        
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

    sendUpdateToAll();
}

async function addPizzaToQueue(description: string) {
    const pizza: Pizza = {description: description, id: uuidv4(), secondsLeft: 90, createdAt: new Date().toISOString() };
    state.queue.push(pizza);
    sendUpdateToAll();

    return true;
}

async function removePizzaFromOven(id: string) {
    let matchingOven = state.ovens.find(oven => oven.pizzas.find(pizza => pizza.id !== id));
    
    if(!matchingOven) {
        console.log(`Could not remove pizza with id ${id} because no matching oven exists.`);
        return;
    }

    const ovenPod = getOvenPodById(matchingOven.id);
    
    if(!ovenPod) {
        console.log(`Pod for oven ${matchingOven.id} does not exist.`);
        return;
    }

    await fetch(`http://${ovenPod.ip}:8080/PizzaOven/remove`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id
        })
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
    console.log("Scaling up and creating new oven pod ...");
    // TODO
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
    const allOvensFull = state.ovens.length > 0 && state.ovens.every(oven => oven.pizzas.length >= oven.capacity);

    if (allOvensFull) {
        console.log("All ovens are full!");
        scaleUpOvens();
    }
    
    // iterate ovens, skip full ovens, put pizzas into ovens as long as there is space
    for (const oven of state.ovens) {
        while(oven.pizzas.length < oven.capacity) {
            const pizza = state.queue.shift();
            if (!pizza) {
                break;
            }
    
            const currentOven = getOvenPodById(oven.id);

            if(!currentOven) {
                continue;
            }

            console.log("calling add pizza request for oven ", currentOven?.ovenId, "with pod name", currentOven?.name, "and ip", currentOven?.ip);

            await fetch(`http://${currentOven.ip}:8080/PizzaOven/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    description: pizza.description
                })
            }).then(res => {
                if(res.status === 202) {
                    console.log("pizza was successfully added");
                } else {
                    throw new Error(`Could not add pizza to pod: ${res.status}, ${res.statusText}`);
                }
            }).catch(error => console.log(error));
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

const wss = new WebSocketServer({port: PORT});

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