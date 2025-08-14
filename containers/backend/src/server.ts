import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import { Oven } from "./types";
import { generateRandomName } from "./helpers";

const PORT = parseInt(process.env.PORT || "1234", 10);
let yDoc = new Y.Doc();

const state = yDoc.getMap();

state.set("ovens", []);
state.set<Oven[]>("pods", []);

console.log("Starting server...");

const ovens = state.get("ovens") as Oven[];

const createOven = () => {
  ovens.push({ id: generateRandomName(), capacity: 2, currentLoad: 2, pizzas: [], isRunning: true })
}

/* fetch running pods from kubernetes and update ovens */
setInterval(() => {
  createOven();
}, 15 * 1000);

createOven();

const server = new Server({
  port: PORT,

  async onConnect() {
    console.log("🔮 Client connected.");
  },

  async onLoadDocument({ documentName }) {
    return yDoc;
  },

});

server.listen();