export type BackendOven = {
    ovenId: string;
    capacity: number;
    currentLoad: number;
    pizzas: BackendPizza[];
}

export type BackendPizza = {
    pizza: {
        id: string;
        description: string;
    },
    secondsLeft: number;
}

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
    secondsLeft: number;
    createdAt?: string;
}

export type State = {
    metrics: {
        pods: PodInfo[]
    },
    ovens: Oven[],
    queue: Pizza[],
    timeTillNextQueueUpdate: number
}

export type PodInfo = {
    ip?: string;
    name?: string;
    creationTimestamp?: Date;
    ovenId: string;
    status?: Array<{
      name: string;
      ready: boolean;
      restartCount: number;
      image: string;
      imageID: string;
    }>;
  };

export enum MessageType {
    UPDATE = "update",
    NOTIFY = "notify",
    ADD_PIZZA = "add-pizza",
    REMOVE_PIZZA = "remove-pizza"
}