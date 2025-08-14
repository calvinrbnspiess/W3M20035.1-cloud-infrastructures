export type Oven = {
    id: string;
    capacity: number;
    currentLoad: number;
    pizzas: Pizza[];
    isRunning: boolean;
}

export type Pizza = {
    id: string;
    timeRemaining: number
}