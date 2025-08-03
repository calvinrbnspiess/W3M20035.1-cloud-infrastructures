"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Square, Plus, Minus, Flame, Timer } from "lucide-react"

interface Pizza {
  id: string
  timeRemaining: number
}

interface Oven {
  id: number
  isRunning: boolean
  pizzas: Pizza[]
  temperature: number
}

export default function PizzaOvenControl() {
  const [ovens, setOvens] = useState<Oven[]>([
    { id: 1, isRunning: false, pizzas: [], temperature: 338 },
    { id: 2, isRunning: false, pizzas: [], temperature: 349 },
    { id: 3, isRunning: false, pizzas: [], temperature: 24 },
    { id: 4, isRunning: false, pizzas: [], temperature: 335 },
  ])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setOvens((prevOvens) =>
        prevOvens.map((oven) => ({
          ...oven,
          pizzas: oven.isRunning
            ? oven.pizzas
                .map((pizza) => ({
                  ...pizza,
                  timeRemaining: Math.max(0, pizza.timeRemaining - 1),
                }))
                .filter((pizza) => pizza.timeRemaining > 0)
            : oven.pizzas,
        })),
      )
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startOven = (ovenId: number) => {
    setOvens((prevOvens) => prevOvens.map((oven) => (oven.id === ovenId ? { ...oven, isRunning: true } : oven)))
  }

  const stopOven = (ovenId: number) => {
    setOvens((prevOvens) => prevOvens.map((oven) => (oven.id === ovenId ? { ...oven, isRunning: false } : oven)))
  }

  const addPizza = (ovenId: number) => {
    setOvens((prevOvens) =>
      prevOvens.map((oven) => {
        if (oven.id === ovenId && oven.pizzas.length < 3) {
          const newPizza: Pizza = {
            id: `${ovenId}-${Date.now()}`,
            timeRemaining: 90,
          }
          return { ...oven, pizzas: [...oven.pizzas, newPizza] }
        }
        return oven
      }),
    )
  }

  const removePizza = (ovenId: number, pizzaId: string) => {
    setOvens((prevOvens) =>
      prevOvens.map((oven) =>
        oven.id === ovenId ? { ...oven, pizzas: oven.pizzas.filter((pizza) => pizza.id !== pizzaId) } : oven,
      ),
    )
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen select-none">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Praxisprojekt Pizzaofen-Steuerung</h1>
          <p className="text-gray-600"><strong>W3M20035.1</strong> Cloud Infrastructures and Cloud Native Applications</p>
        </div>
        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="text-2xl font-bold text-black">{ovens.filter((oven) => oven.isRunning).length}</div>
              <div className="text-sm text-gray-600">Laufende Öfen</div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="text-2xl font-bold text-black">
                {ovens.reduce((total, oven) => total + oven.pizzas.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Gesamtpizzen</div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {ovens.reduce(
                  (total, oven) => total + oven.pizzas.filter((pizza) => pizza.timeRemaining <= 10).length,
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600">Fertig in wenigen Sekunden</div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="text-2xl font-bold text-black">
                {Math.round(ovens.reduce((sum, oven) => sum + oven.temperature, 0) / ovens.length)}° C
              </div>
              <div className="text-sm text-gray-600">Durchschn. Temperatur</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ovens.map((oven) => (
            <div
              key={oven.id}
              className={`rounded-lg border shadow-sm transition-all duration-300 ${
                oven.isRunning ? "ring-2 ring-orange-500 bg-orange-50 border-orange-200" : "bg-white border-gray-200"
              }`}
            >
              {/* Card Header */}
              <div className="p-6 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className={`h-5 w-5 ${oven.isRunning ? "text-orange-500" : "text-gray-400"}`} />
                    <h3 className="text-lg font-semibold">Ofen {oven.id}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      oven.isRunning ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {oven.isRunning ? "Läuft" : "Gestoppt"}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">Temperatur: {oven.temperature}° C</div>
              </div>

              {/* Card Content */}
              <div className="px-6 pb-6 space-y-4">
                {/* Oven Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => startOven(oven.id)}
                    disabled={oven.isRunning}
                    className={`flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium px-3 py-2 transition-colors ${
                      oven.isRunning
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    }`}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Starten
                  </button>
                  <button
                    onClick={() => stopOven(oven.id)}
                    disabled={!oven.isRunning}
                    className={`flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium px-3 py-2 border transition-colors ${
                      !oven.isRunning
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    }`}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Stoppen
                  </button>
                </div>

                {/* Pizza Management */}
                <div className="border-t border-t-gray-300 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Pizzen ({oven.pizzas.length}/3)</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => addPizza(oven.id)}
                        disabled={oven.pizzas.length >= 3}
                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium px-3 py-2 border transition-colors ${
                          oven.pizzas.length >= 3
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Pizza List */}
                  <div className="space-y-2">
                    {oven.pizzas.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">Keine Pizzen im Ofen</div>
                    ) : (
                      oven.pizzas.map((pizza, index) => (
                        <div
                          key={pizza.id}
                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Pizza {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono ${
                                pizza.timeRemaining <= 60 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {formatTime(pizza.timeRemaining)}
                            </span>
                            <button
                              onClick={() => removePizza(oven.id, pizza.id)}
                              className="h-6 w-6 p-0 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
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
  )
}
