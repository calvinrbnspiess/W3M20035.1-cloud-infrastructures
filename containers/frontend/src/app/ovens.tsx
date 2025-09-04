"use client";

import { Flame, Minus, PizzaIcon, Play, Plus, Square, Timer } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { MessageType, type Oven, type Pizza } from "@/types";

import Button from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import PizzaQueue from "./queue";

/** Utils **/
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function useTick(callback: () => void, intervalMs: number) {
  const savedCb = useRef(callback);
  useEffect(() => {
    savedCb.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = setInterval(() => savedCb.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

/** Presentational Components **/
function PageHeader() {
  return (
    <div className="mb-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Praxisprojekt Pizzaofen-Steuerung
      </h1>
      <p className="text-gray-600">
        <strong>W3M20035.1</strong> Cloud Infrastructures and Cloud Native
        Applications
      </p>
    </div>
  );
}

function StatTile({ value, label, highlight = false }: { value: string | number; label: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-4">
        <div className={`text-2xl tabular-nums font-bold ${highlight ? "text-orange-600" : "text-black"}`}>{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
}

function SummaryBar({ ovens, timeTillNextQueueUpdate }: { ovens: Oven[]; timeTillNextQueueUpdate: number }) {
  const running = useMemo(() => ovens.filter((o) => o.isRunning).length, [ovens]);
  const totalPizzas = useMemo(() => ovens.reduce((t, o) => t + o.pizzas.length, 0), [ovens]);
  const finishingSoon = useMemo(
    () => ovens.reduce((t, o) => t + o.pizzas.filter((p) => p.secondsLeft <= 10).length, 0),
    [ovens]
  );

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
      <StatTile value={running} label="Laufende Öfen" />
      <StatTile value={totalPizzas} label="Pizzas werden gerade zubereitet" />
      <StatTile value={finishingSoon} label="Fertig in wenigen Sekunden" highlight />
      <StatTile value={String(timeTillNextQueueUpdate).padStart(2, '0') + "s"} label="Zeit bis zur Abarbeitung der Warteschlange" />
    </div>
  );
}

function TopActions({ onAddPizza, queue }: { onAddPizza: (description: string) => void; queue: Pizza[] }) {
  return (
    <div className="mb-8 w-full gap-4 whitespace-nowrap grid grid-cols-1 md:grid-cols-2">
      <PizzaQueue queue={queue} onAddItem={onAddPizza} />
    </div>
  );
}

function OvenHeader({ oven }: { oven: Oven }) {
  return (
    <div className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={`h-5 w-5 shrink-0 ${oven.isRunning ? "text-orange-500" : "text-gray-400"}`} />
          <h3 className="text-lg font-semibold">{oven.id}</h3>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            oven.isRunning ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          {oven.isRunning ? "Läuft" : "Gestoppt"}
        </span>
      </div>
    </div>
  );
}

function OvenControls({ isRunning, onStart, onStop }: { isRunning: boolean; onStart: () => void; onStop: () => void }) {
  return (
    <div className="flex gap-2">
      <Button onClick={onStart} disabled={isRunning}>
        <Play className="mr-1 h-4 w-4" />
        Starten
      </Button>
      <Button onClick={onStop} disabled={!isRunning}>
        <Square className="mr-1 h-4 w-4" />
        Stoppen
      </Button>
    </div>
  );
}

function PizzaRow({ index, pizza, onRemove, disableRemove }: { index: number; pizza: Pizza; onRemove: () => void; disableRemove: boolean }) {
  const isCritical = pizza.secondsLeft <= 60;
  return (
    <div className="flex items-center justify-between rounded border border-gray-200 bg-white p-2">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-gray-500" />
        <span className="text-sm">{pizza.description}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
            isCritical ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {formatTime(pizza.secondsLeft)}
        </span>
        <Button onClick={onRemove} disabled={disableRemove}>
          <Minus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function PizzaSection({ oven, onRemovePizza }: { oven: Oven; onRemovePizza: (pizzaId: string) => void }) {
  return (
    <div className="border-t border-t-gray-300 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">Pizzen ({oven.pizzas.length}/{oven.capacity})</span>
      </div>

      <div className="space-y-2">
        {oven.pizzas.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">Keine Pizzen im Ofen</div>
        ) : (
          oven.pizzas.map((pizza, idx) => (
            <PizzaRow
              key={pizza.id}
              index={idx}
              pizza={pizza}
              onRemove={() => onRemovePizza(pizza.id)}
              disableRemove={oven.pizzas.length <= 1}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OvenCard({
  oven,
  onRemovePizza,
}: {
  oven: Oven
  onStart: () => void
  onStop: () => void
  onRemovePizza: (pizzaId: string) => void
}) {
  return (
    <Card
      className={`transition-all duration-300 ${
        oven.isRunning ? "border-orange-200 bg-orange-50 ring-2 ring-orange-500" : "border-gray-200 bg-white"
      }`}
    >
      <CardHeader className="pb-3">
        <OvenHeader oven={oven} />
      </CardHeader>
      <CardContent className="space-y-4">
        <PizzaSection oven={oven} onRemovePizza={onRemovePizza} />
      </CardContent>
    </Card>
  )
}

export function useWebSocket(url: string) {
  const [websocket, setWebsocket] = useState<WebSocket>();

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(url);
      setWebsocket(ws);

      ws.addEventListener("open", () => {
        toast.success("Connected to server");
        console.log("Connected to server");
      });

      ws.addEventListener("close", () => {
        toast.message("⚠️ Disconnected. Reconnecting in 3s...");
        console.log("Disconnected, retrying...");
        reconnectTimer = setTimeout(connect, 3000); // retry after 3 seconds
      });

      ws.addEventListener("error", (err) => {
        toast.error("WebSocket error");
        console.error("WebSocket error:", err);
        ws.close(); // trigger reconnect cycle
      });
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws && ws.readyState === WebSocket.OPEN) {
        toast.info("🔌 Disconnecting...");
        ws.close();
      }
    };
  }, [url]);

  return websocket;
}


/** Main Component **/
export default function PizzaOvenControl() {
    const [ovens, setOvens] = useState<Oven[]>([]);
    const [queue, setQueue] = useState<Pizza[]>([]);
    const [timeTillNextQueueUpdate, setTimeTillNextQueueUpdate] = useState(0);

    const websocket = useWebSocket("ws://localhost:1234");

    useEffect(() => {
      if (!websocket) return;
    
      const handleMessage = (event: MessageEvent) => {
        try {
          const { type, ...otherData } = JSON.parse(event.data);
    
          switch (type) {
            case MessageType.UPDATE: {
              console.log("Received update");
              const state = JSON.parse(otherData.state);
              setOvens(state.ovens || []);
              setQueue(state.queue || []);
              setTimeTillNextQueueUpdate(state.timeTillNextQueueUpdate);
              break;
            }
            case MessageType.NOTIFY: {
              toast.info(otherData.message);
              break;
            }
            default:
              console.log("Received unknown message type", type);
          }
        } catch (error) {
          console.log("Could not parse message: ", error);
        }
      };
    
      websocket.addEventListener("message", handleMessage);
    
      return () => {
        websocket.removeEventListener("message", handleMessage);
      };
    }, [websocket]);

  return (
    <div className="min-h-screen select-none    bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader />
        <SummaryBar ovens={ovens} timeTillNextQueueUpdate={timeTillNextQueueUpdate} />
        <TopActions queue={queue} onAddPizza={(description) => {
           toast("Pizza wird angefordert ...");
            websocket?.send(JSON.stringify({
              type: MessageType.ADD_PIZZA,
              description: description
            }))
        }} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ovens.map((oven) => (
            <OvenCard
              key={oven.id}
              oven={oven}
              onStart={() => {}}
              onStop={() => {}}
              onRemovePizza={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
