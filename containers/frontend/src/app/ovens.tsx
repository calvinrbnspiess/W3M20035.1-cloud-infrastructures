"use client";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { Flame, Minus, Pizza, Play, Plus, Square, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";

import Button from "@/components/button";

interface Pizza {
    id: string;
    timeRemaining: number;
}

interface Oven {
    id: number;
    isRunning: boolean;
    pizzas: Pizza[];
    temperature: number;
}

export default function PizzaOvenControl() {
    const [ovens, setOvens] = useState<Oven[]>([
        { id: 1, isRunning: false, pizzas: [], temperature: 338 },
        { id: 2, isRunning: false, pizzas: [], temperature: 349 },
        { id: 3, isRunning: false, pizzas: [], temperature: 24 },
        { id: 4, isRunning: false, pizzas: [], temperature: 335 },
    ]);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        console.log("Connecting to Hocuspocus server...");
        // Local Yjs doc
        const ydoc = new Y.Doc();

        // Connect to the Hocuspocus server
        const provider = new HocuspocusProvider({
            url: "ws://localhost:1234",
            name: "pizza-state", // document name
            document: ydoc,
        });

        // Access the shared map
        const state = ydoc.getMap("state");

        // Example: listen for changes
        state.observe((event) => {
            console.log("State changed:", Object.fromEntries(state.entries()));
        });
    }, []);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setOvens((prevOvens) =>
                prevOvens.map((oven) => ({
                    ...oven,
                    pizzas: oven.isRunning
                        ? oven.pizzas
                              .map((pizza) => ({
                                  ...pizza,
                                  timeRemaining: Math.max(
                                      0,
                                      pizza.timeRemaining - 1,
                                  ),
                              }))
                              .filter((pizza) => pizza.timeRemaining > 0)
                        : oven.pizzas,
                })),
            );
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const startOven = (ovenId: number) => {
        setOvens((prevOvens) =>
            prevOvens.map((oven) =>
                oven.id === ovenId ? { ...oven, isRunning: true } : oven,
            ),
        );
    };

    const addOven = () => {
        setOvens((prevOvens) => [
            ...prevOvens,
            {
                id: prevOvens.length + 1,
                isRunning: false,
                pizzas: [],
                temperature: 338,
            },
        ]);
    };

    const stopOven = (ovenId: number) => {
        setOvens((prevOvens) =>
            prevOvens.map((oven) =>
                oven.id === ovenId ? { ...oven, isRunning: false } : oven,
            ),
        );
    };

    const addPizza = (ovenId: number) => {
        setOvens((prevOvens) =>
            prevOvens.map((oven) => {
                if (oven.id === ovenId && oven.pizzas.length < 3) {
                    const newPizza: Pizza = {
                        id: `${ovenId}-${Date.now()}`,
                        timeRemaining: 90,
                    };
                    return { ...oven, pizzas: [...oven.pizzas, newPizza] };
                }
                return oven;
            }),
        );
    };

    const removePizza = (ovenId: number, pizzaId: string) => {
        setOvens((prevOvens) =>
            prevOvens.map((oven) =>
                oven.id === ovenId
                    ? {
                          ...oven,
                          pizzas: oven.pizzas.filter(
                              (pizza) => pizza.id !== pizzaId,
                          ),
                      }
                    : oven,
            ),
        );
    };

    function addPizzaToOven(): void {
        const firstFreeOven = ovens.find((oven) => oven.pizzas.length < 3);

        if (firstFreeOven) {
            addPizza(firstFreeOven.id);
        }
    }

    const isOvenFree = !!ovens.find((oven) => oven.pizzas.length < 3);

    return (
        <div className="min-h-screen bg-slate-50 p-6 select-none">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        Praxisprojekt Pizzaofen-Steuerung
                    </h1>
                    <p className="text-gray-600">
                        <strong>W3M20035.1</strong> Cloud Infrastructures and
                        Cloud Native Applications
                    </p>
                </div>
                {/* Summary Stats */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="p-4">
                            <div className="text-2xl font-bold text-black">
                                {ovens.filter((oven) => oven.isRunning).length}
                            </div>
                            <div className="text-sm text-gray-600">
                                Laufende Öfen
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="p-4">
                            <div className="text-2xl font-bold text-black">
                                {ovens.reduce(
                                    (total, oven) => total + oven.pizzas.length,
                                    0,
                                )}
                            </div>
                            <div className="text-sm text-gray-600">
                                Gesamtpizzen
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {ovens.reduce(
                                    (total, oven) =>
                                        total +
                                        oven.pizzas.filter(
                                            (pizza) =>
                                                pizza.timeRemaining <= 10,
                                        ).length,
                                    0,
                                )}
                            </div>
                            <div className="text-sm text-gray-600">
                                Fertig in wenigen Sekunden
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="p-4">
                            <div className="text-2xl font-bold text-black">
                                {Math.round(
                                    ovens.reduce(
                                        (sum, oven) => sum + oven.temperature,
                                        0,
                                    ) / ovens.length,
                                )}
                                ° C
                            </div>
                            <div className="text-sm text-gray-600">
                                Durchschn. Temperatur
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-8 flex w-fit gap-4 whitespace-nowrap">
                    <Button onClick={() => addOven()} className="w-fit">
                        <Play className="mr-1 h-4 w-4" />
                        Neuen Ofen erstellen
                    </Button>
                    <Button
                        onClick={() => addPizzaToOven()}
                        disabled={!isOvenFree}
                        className="w-fit"
                    >
                        <Pizza className="mr-1 h-4 w-4" />
                        Pizza in freien Ofen platzieren
                    </Button>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {ovens.map((oven) => (
                        <div
                            key={oven.id}
                            className={`rounded-lg border shadow-sm transition-all duration-300 ${
                                oven.isRunning
                                    ? "border-orange-200 bg-orange-50 ring-2 ring-orange-500"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            {/* Card Header */}
                            <div className="p-6 pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Flame
                                            className={`h-5 w-5 ${oven.isRunning ? "text-orange-500" : "text-gray-400"}`}
                                        />
                                        <h3 className="text-lg font-semibold">
                                            Ofen {oven.id}
                                        </h3>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            oven.isRunning
                                                ? "bg-gray-900 text-white"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {oven.isRunning ? "Läuft" : "Gestoppt"}
                                    </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                    Temperatur: {oven.temperature}° C
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="space-y-4 px-6 pb-6">
                                {/* Oven Controls */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => startOven(oven.id)}
                                        disabled={oven.isRunning}
                                    >
                                        <Play className="mr-1 h-4 w-4" />
                                        Starten
                                    </Button>
                                    <Button
                                        onClick={() => stopOven(oven.id)}
                                        disabled={!oven.isRunning}
                                    >
                                        <Square className="mr-1 h-4 w-4" />
                                        Stoppen
                                    </Button>
                                </div>

                                {/* Pizza Management */}
                                <div className="border-t border-t-gray-300 pt-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            Pizzen ({oven.pizzas.length}/3)
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                onClick={() =>
                                                    addPizza(oven.id)
                                                }
                                                disabled={
                                                    oven.pizzas.length >= 3
                                                }
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Pizza List */}
                                    <div className="space-y-2">
                                        {oven.pizzas.length === 0 ? (
                                            <div className="py-4 text-center text-sm text-gray-500">
                                                Keine Pizzen im Ofen
                                            </div>
                                        ) : (
                                            oven.pizzas.map((pizza, index) => (
                                                <div
                                                    key={pizza.id}
                                                    className="flex items-center justify-between rounded border border-gray-200 bg-white p-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Timer className="h-4 w-4 text-gray-500" />
                                                        <span className="text-sm">
                                                            Pizza {index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
                                                                pizza.timeRemaining <=
                                                                60
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {formatTime(
                                                                pizza.timeRemaining,
                                                            )}
                                                        </span>
                                                        <Button
                                                            onClick={() =>
                                                                removePizza(
                                                                    oven.id,
                                                                    pizza.id,
                                                                )
                                                            }
                                                            disabled={
                                                                oven.pizzas
                                                                    .length <= 1
                                                            }
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
