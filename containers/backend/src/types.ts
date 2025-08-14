export type Oven = {
    id: string;
    capacity: number;
    currentLoad: number;
    pizzas: PizzaStatus[];
    isRunning: boolean;
}

export type PizzaStatus = {
    id: string;
    description: string;
    secondsLeft: number
}