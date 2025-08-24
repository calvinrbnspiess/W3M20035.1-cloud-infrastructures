import {v4 as uuidv4} from 'uuid';
import * as k8s from '@kubernetes/client-node';
import {WebSocketServer} from "ws";
import {MessageType, Pizza, State} from "./types";

const PORT = parseInt(process.env.PORT || "1234", 10);

let tempUuid: string;

const kubeConfig = new k8s.KubeConfig();
kubeConfig.loadFromDefault()
const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

async function updateOvensFromPods() {
    try {
        const res = await k8sApi.listNamespacedPod({ namespace: "default" });
        const pods = res.items;
        console.log("Pods:" + pods);

        //TODO: result mappen
        //TODO: daten ans frontend schicken

        // TODO: remove once everything else works
        await createOvenAsync();

        console.log("Updated ovens from server-side");

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

async function createPizza(description: string, ws: WebSocket) {
    if (state.ovens.length === 0) {
        ws.send(JSON.stringify({type: MessageType.NOTIFY, message: `No oven available.`}));
        return false;
    }

    // Find the first oven with less than 3 pizzas
    const availableOven = state.ovens.find(oven => oven.pizzas.length < 3);

    if (!availableOven) {
        ws.send(JSON.stringify({type: MessageType.NOTIFY, message: `There is no free oven.`}));
        return false;
    }

    const pizza: Pizza = {description: description, id: uuidv4(), secondsLeft: 90};

    availableOven.pizzas.push(pizza);
    sendUpdateToAll();

    return true;
}

// Update pods every 5 seconds
setInterval(updateOvensFromPods, 15 * 1000);

const clients = new Set<WebSocket>();

let state: State = {
    metrics: {
        pods: [] // some information about pods (id, cpu/memory)
        // pizza queue duration length
    },
    ovens: [],
    pizzas: []
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

const wss = new WebSocketServer({port: PORT});

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
                    const success = await createPizza(otherData.description, ws);

                    if (success) {
                        ws.send(JSON.stringify({
                            type: MessageType.NOTIFY,
                            message: `Pizza '${otherData.description ?? 'with unknown description'}' created!`
                        }));
                    }
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