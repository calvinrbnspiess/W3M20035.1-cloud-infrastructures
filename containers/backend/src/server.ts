import {v4 as uuidv4} from 'uuid';
import * as k8s from '@kubernetes/client-node';
import {WebSocketServer} from "ws";
import {MessageType, Pizza, PodInfo, State} from "./types";

const PORT = parseInt(process.env.PORT || "1234", 10);

const SECONDS_TILL_QUEUE_ITERATION = 15;

let tempUuid: string;

const kubeConfig = new k8s.KubeConfig();
kubeConfig.loadFromDefault()
const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

async function updateOvensFromPods() {
    try {
        const res = await k8sApi.listNamespacedPod({ namespace: process.env.NAMESPACE || "default" });
        const pods = res.items;

        const updatedPods: PodInfo[] = [];

        for(let pod of pods.filter(pod => pod.metadata?.labels?.app === "oven")) {
            console.log("IP: ", pod.status?.podIP);

            updatedPods.push({
                ip: pod.status?.podIP,
                name: pod.metadata?.name,
                creationTimestamp: pod.metadata?.creationTimestamp,
                status: pod.status?.containerStatuses
            })
        }

        state.metrics.pods = updatedPods;

        // now fetch all ovens and update state.ovens

        console.log(updatedPods);

        //TODO: result mappen
        //TODO: daten ans frontend schicken

        // TODO: remove once everything else works
        
        console.log("Updated ovens from server-side");

        sendUpdateToAll();

    } catch (err) {
        console.error("Error occurred whilst getting pods from k8s:", err);
    }
}

async function createOvenAsync() {
    tempUuid = uuidv4();
    let oven = {
        id: tempUuid,
        capacity: 2,
        currentLoad: 2,
        pizzas: [],
        isRunning: true
    };

    state.ovens.push(oven);

    sendUpdateToAll();
}

async function addPizzaToQueue(description: string) {
    const pizza: Pizza = {description: description, id: uuidv4(), secondsLeft: 90, createdAt: new Date().toISOString() };
    state.queue.push(pizza);
    sendUpdateToAll();

    return true;
}

async function removePizzaFromOven(id: string) {
    for (const oven of state.ovens) {
        oven.pizzas = oven.pizzas.filter(pizza => pizza.id !== id);
    }
    sendUpdateToAll();
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
    
    // iterate ovens, skip full ovens, put pizzas into ovens as long as there is space
    for (const oven of state.ovens) {
        while(oven.pizzas.length < oven.capacity) {
            const pizza = state.queue.shift();
            if (!pizza) {
                break;
            }
    
            oven.pizzas.push(pizza);
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

// update every 15 seconds
setInterval(updateOvensFromPods, 15 * 1000);
// send updates every second
setInterval(() => {
    processQueue();
    sendUpdateToAll();
}, 1000);


const wss = new WebSocketServer({port: PORT});

updateOvensFromPods();

// create dummy oven
createOvenAsync();

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
                case MessageType.REMOVE_PIZZA:
                    const pizzaId = otherData.id;
                    
                    removePizzaFromOven(pizzaId);
                    ws.send(JSON.stringify({
                        type: MessageType.NOTIFY,
                        message: `Pizza wurde entfernt.`
                    }));
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