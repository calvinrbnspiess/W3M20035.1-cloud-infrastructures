import { MessageType, Oven, State } from "./types";
import { v4 as uuidv4 } from 'uuid';
import * as k8s from '@kubernetes/client-node';
import fetch from "node-fetch";
import { WebSocketServer } from "ws";

const PORT = parseInt(process.env.PORT || "1234", 10);

let tempUuid: string;

// k8s stuff
const kubeConfig = new k8s.KubeConfig();
kubeConfig.loadFromDefault()
const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

async function updateOvensFromPods() {
  try {
    // TODO: in listNamespacedPod() richtige params mitgeben
    //const res = await k8sApi.listNamespacedPod();
    //const pods = res.body.items;
    //TODO: pod api aufrufen und result mappen
    //TODO: result ans frontend schicken -> alles was furnace endpoint hergibt

    // Mock ovens, remove once k8s call works
    tempUuid = uuidv4();
    let oven = {
      id: tempUuid,
      capacity: 2,
      currentLoad: 2,
      pizzas: [],
      isRunning: true
    };

    state.ovens.push(oven);
    
    clients.forEach(ws => {
      sendUpdate(ws);
    })

    console.log("Updated ovens from server-side");
    
  } catch (err) {
    console.error("Error occurred whilst getting pods from k8s:", err);
  }
}

// Update pods every 5 seconds
setInterval(updateOvensFromPods, 5 * 1000);

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
  ws.send(JSON.stringify({ type: MessageType.UPDATE, state: payload }));
}

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);

  // Immediately send the full current state
  sendUpdate(ws);

  ws.addEventListener("message", (message) => {
    console.log("<- received message", message);

    try {
      const { type } = JSON.parse(message.data);
      console.log("type", type);
    } catch(error) {
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