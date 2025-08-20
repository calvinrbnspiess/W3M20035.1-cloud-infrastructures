"use client";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { Flame, Minus, PizzaIcon, Play, Plus, Square, Timer } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { toast } from "sonner";

import { type Oven, type Pizza } from "../../../backend/src/types";

import Button from "@/components/button";

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
        <div className={`text-2xl font-bold ${highlight ? "text-orange-600" : "text-black"}`}>{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
}

function SummaryBar({ ovens }: { ovens: Oven[] }) {
  const running = useMemo(() => ovens.filter((o) => o.isRunning).length, [ovens]);
  const totalPizzas = useMemo(() => ovens.reduce((t, o) => t + o.pizzas.length, 0), [ovens]);
  const finishingSoon = useMemo(
    () => ovens.reduce((t, o) => t + o.pizzas.filter((p) => p.timeRemaining <= 10).length, 0),
    [ovens]
  );
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
      <StatTile value={running} label="Laufende Öfen" />
      <StatTile value={totalPizzas} label="Gesamtpizzen" />
      <StatTile value={finishingSoon} label="Fertig in wenigen Sekunden" highlight />
    </div>
  );
}

function TopActions({ onAddOven, onAddPizzaToAny, isAnyOvenFree }: { onAddOven: () => void; onAddPizzaToAny: () => void; isAnyOvenFree: boolean }) {
  return (
    <div className="mb-8 flex w-fit gap-4 whitespace-nowrap">
      <Button onClick={onAddOven} className="w-fit">
        <Play className="mr-1 h-4 w-4" />
        Neuen Ofen erstellen
      </Button>
      <Button onClick={onAddPizzaToAny} disabled={!isAnyOvenFree} className="w-fit">
        <PizzaIcon className="mr-1 h-4 w-4" />
        Pizza in freien Ofen platzieren
      </Button>
    </div>
  );
}

function OvenHeader({ oven }: { oven: Oven }) {
  return (
    <div className="p-6 pb-3">
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
  const isCritical = pizza.timeRemaining <= 60;
  return (
    <div className="flex items-center justify-between rounded border border-gray-200 bg-white p-2">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-gray-500" />
        <span className="text-sm">Pizza {index + 1}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
            isCritical ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {formatTime(pizza.timeRemaining)}
        </span>
        <Button onClick={onRemove} disabled={disableRemove}>
          <Minus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function PizzaSection({ oven, onAddPizza, onRemovePizza }: { oven: Oven; onAddPizza: () => void; onRemovePizza: (pizzaId: string) => void }) {
  return (
    <div className="border-t border-t-gray-300 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">Pizzen ({oven.pizzas.length}/3)</span>
        <div className="flex gap-1">
          <Button onClick={onAddPizza} disabled={oven.pizzas.length >= 3}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
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

function OvenCard({ oven, onStart, onStop, onAddPizza, onRemovePizza }: {
  oven: Oven;
  onStart: () => void;
  onStop: () => void;
  onAddPizza: () => void;
  onRemovePizza: (pizzaId: string) => void;
}) {
  return (
    <div
      className={`rounded-lg border shadow-sm transition-all duration-300 ${
        oven.isRunning ? "border-orange-200 bg-orange-50 ring-2 ring-orange-500" : "border-gray-200 bg-white"
      }`}
    >
      <OvenHeader oven={oven} />
      <div className="space-y-4 px-6 pb-6">
        <OvenControls isRunning={oven.isRunning} onStart={onStart} onStop={onStop} />
        <PizzaSection oven={oven} onAddPizza={onAddPizza} onRemovePizza={onRemovePizza} />
      </div>
    </div>
  );
}

/** Main Component **/
export default function PizzaOvenControl() {
    const [ovens, setOvens] = useState<Oven[]>([]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:1234");

        ws.addEventListener('message', (event) => {
          try {
            const { type, ...otherData } = JSON.parse(event.data);

            switch(type) {
              case "update":
                console.log("Received update");
                const state = JSON.parse(otherData.state);

                console.log(state)
                setOvens(state.ovens || []);
                break;
              default:
                console.log("Received unknown message type", type);
            }
                

          } catch(error) {
            console.log("Could not parse message: ", error);
          }
        });
    
        return () => {
          console.log("Disconnecting");
          ws.close();
        }
      }, [setOvens]);

  // Tick every second to update running ovens
  useTick(
    () => {
      setOvens((prev) =>
        prev.map((oven) => ({
          ...oven,
          pizzas: oven.isRunning
            ? oven.pizzas
                .map((p) => ({ ...p, timeRemaining: Math.max(0, p.timeRemaining - 1) }))
                .filter((p) => p.timeRemaining > 0)
            : oven.pizzas,
        }))
      );
    },
    1000
  );

  const isAnyOvenFree = useMemo(() => ovens.some((o) => o.pizzas.length < 3), [ovens]);

  return (
    <div className="min-h-screen select-none    bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader />
        <SummaryBar ovens={ovens} />
        <TopActions onAddOven={() => {
            // provider?.sendStateless(
            //     JSON.stringify({ type: "create-oven" })
            //   );
        }} onAddPizzaToAny={() => {}} isAnyOvenFree={isAnyOvenFree} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ovens.map((oven) => (
            <OvenCard
              key={oven.id}
              oven={oven}
              onStart={() => {}}
              onStop={() => {}}
              onAddPizza={() => {}}
              onRemovePizza={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
