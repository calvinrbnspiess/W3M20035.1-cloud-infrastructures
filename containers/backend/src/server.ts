import { Server } from "@hocuspocus/server";
import * as Y from "yjs";

const PORT = parseInt(process.env.PORT || "1234", 10);
let yDoc = new Y.Doc();

console.log("Starting server...");

setInterval(() => {
    let ovens = yDoc.getArray("ovens")
    ovens.push([{ id: "fgfgdfgfd", capacity: 2, currentLoad: 2, pizzas: [] }])
  // fetch running pods
}, 5 * 1000);

const server = new Server({
  port: PORT,

  async onConnect() {
    console.log("🔮");
  },

  async onLoadDocument({ documentName }) {

    // Create a shared map for the state
    const state = yDoc.getMap("state");
    state.set("pods", []);
    state.set("ovens", [
      { id: "cd8we32ff", capacity: 2, currentLoad: 0, pizzas: [] },
      { id: "a789dsf7d", capacity: 3, currentLoad: 1, pizzas: [] },

    ]);

    return yDoc;
  },
});

server.listen();

// start web socket server at port XXXX

// provide
// - ws endpoint to put a new pizza in any available oven

// push changes of ovens to frontend, provide information about how long pizza is in the oven
