import { Server } from "@hocuspocus/server";
import * as Y from "yjs";

const PORT = parseInt(process.env.PORT || "1234", 10);

console.log("Starting server...");

setInterval(() => {
  // fetch running pods
}, 5 * 1000);

const server = new Server({
  port: PORT,

  async onConnect() {
    console.log("🔮");
  },

  async onLoadDocument({ documentName }) {
    const ydoc = new Y.Doc();

    // Create a shared map for the state
    const state = ydoc.getMap("state");
    state.set("pods", []);
    state.set("ovens", [
      { id: "cd8we32ff", capacity: 2, currentLoad: 0, pizzas: [] },
    ]);

    return ydoc;
  },
});

server.listen();

// start web socket server at port XXXX

// provide
// - ws endpoint to put a new pizza in any available oven

// push changes of ovens to frontend, provide information about how long pizza is in the oven
