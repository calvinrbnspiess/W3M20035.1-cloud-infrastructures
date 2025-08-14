import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import { Oven } from "./types";
import { generateRandomName } from "./helpers";

const PORT = parseInt(process.env.PORT || "1234", 10);

console.log("Starting server...");

let yDoc = new Y.Doc();

const ovens = yDoc.getArray("ovens") as Y.Array<Oven>;
const pods = yDoc.getArray("pods");

const createOven = () => {
  let oven = { id: generateRandomName(), capacity: 2, currentLoad: 2, pizzas: [], isRunning: true };

  yDoc.transact(() => ovens.push([oven]));

  return oven;
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

  async onLoadDocument() {
    return yDoc;
  },

  async onStateless({ payload, connection }) {
    const msg = JSON.parse(payload);

    switch (msg.type) {
      case "create-oven": {
        // do your backend work
        const oven = await createOven();

        // reply to just this client
        connection.sendStateless(
          JSON.stringify({ type: "notify", message: `Oven '${oven.id} created!'` })
        );
        break;
      }
      default:
        break;
    }
  },


});

server.listen();