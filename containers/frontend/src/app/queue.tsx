"use client"

import { useState } from "react"
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PizzaIcon, X } from "lucide-react"
import { Pizza } from "@/types";

interface SimpleQueueProps {
  queue?: Pizza[]
  onAddItem?: (description: string) => void
  onRemoveItem?: (id: string) => void
}

const PIZZA_OPTIONS = [
  "Pizza Salami",
  "Pizza Margherita",
  "Pizza Pepperoni",
  "Pizza Quattro Stagioni",
  "Pizza Prosciutto",
  "Pizza Funghi",
  "Pizza Capricciosa",
  "Pizza Diavola",
]

export default function PizzaQueue({
  queue = [],
  onAddItem,
  onRemoveItem,
}: SimpleQueueProps) {
  const [selectedPizza, setSelectedPizza] = useState("")

  const handleAddPizza = () => {
    if (selectedPizza && onAddItem) {
      onAddItem(selectedPizza)
      setSelectedPizza("")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">PizzaQueue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
            <Select value={selectedPizza} onValueChange={setSelectedPizza}>
            <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select pizza..." />
            </SelectTrigger>
            <SelectContent>
                {PIZZA_OPTIONS.map((pizza) => (
                <SelectItem key={pizza} value={pizza}>
                    {pizza}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <Button onClick={handleAddPizza} disabled={!selectedPizza} className="w-full">
            <PizzaIcon className="mr-1 h-4 w-4" />
            Pizza anfordern
        </Button>

        <div className="space-y-2">
          {queue.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Keine Pizzas in der Warteschlange</p>
          ) : (
            queue.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                  <span className="font-medium truncate">{item.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{formatTime(new Date(item.createdAt))}</span>
                  {onRemoveItem && (
                    <Button
                      onClick={() => onRemoveItem(item.id)}
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
