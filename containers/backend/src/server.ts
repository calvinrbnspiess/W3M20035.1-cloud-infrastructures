import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import { Oven } from "./types";
import { v4 as uuidv4 } from 'uuid';
import k8s from "@kubernetes/client-node";
import fetch from "node-fetch"; //TODO: benutzen um pod api aufzurufen

const PORT = parseInt(process.env.PORT || "1234", 10);
let yDoc = new Y.Doc();
let tempUuid;

// k8s stuff
const kubeConfig = new k8s.KubeConfig();
kubeConfig.loadFromDefault() // lädt die kubeconfig von ~/.kube/config oder in-cluster TODO: check how this works?
const k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

const ovens = yDoc.getArray("ovens") as Y.Array<Oven>;
const pods = yDoc.getArray("pods");

async function updateOvensFromPods() {
    try {
        // TODO: in listNamespacedPod() richtige params mitgeben
        //const res = await k8sApi.listNamespacedPod();
        //const pods = res.body.items;

        //TODO: pod api aufrufen und result mappen
        //TODO: result ans frontend schicken -> alles was furnace endpoint hergibt

        // Mock ovens, remove once k8s call works
        tempUuid = uuidv4();
        let oven = { id: tempUuid, capacity: 2, currentLoad: 2, pizzas: [], isRunning: true };
        yDoc.transact(() => ovens.push([oven]));

    } catch (err) {
        console.error("Error occured whilst getting pods from k8s:", err);
    }
}

const server = new Server({
  port: PORT,
  async onConnect() {
    console.log("🔮 - Client connected.");
  },

  async onLoadDocument() {
    return yDoc;
  },

  async onStateless({ payload, connection }) {
    const msg = JSON.parse(payload);

    switch (msg.type) {
      case "create-oven": {
        // do your backend work
        await updateOvensFromPods();

        // reply to just this client
        connection.sendStateless(
          JSON.stringify({ type: "notify", message: "Oven '${tempUuid}' created!" })
        );
        break;
      }
      default:
        break;
    }
  },


});

server.listen();
setInterval(updateOvensFromPods, 5 * 1000);
console.log(`Server listening on port ${PORT}`);