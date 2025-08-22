export type Oven = {
    id: string;
    capacity: number;
    currentLoad: number;
    pizzas: Pizza[];
    isRunning: boolean;
}

export type Pizza = {
    id: string;
    description: string;
    secondsLeft: number
}

export type State = {
    metrics: {
        pods: []
    },
    ovens: Oven[],
    pizzas: Pizza[]
}

export enum MessageType {
    UPDATE = "update",
    NOTIFY = "notify",
    ADD_PIZZA = "add-pizza"
}