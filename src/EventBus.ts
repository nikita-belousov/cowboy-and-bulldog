import { Base } from "./Base.js";
import { EventType, IEvent } from "./types.js";

export interface IEventListener {
    entity: Base;
    eventTypes: EventType[];
}

export class EventBus {
    private listeners: IEventListener[] = [];

    subscribe(entity: Base, eventTypes: EventType[]) {
        this.listeners.push({ entity, eventTypes });
    }

    dispatch(event: IEvent) {
        this.listeners.forEach(listener => {
            if (listener.eventTypes.includes(event.type)) {
                listener.entity.handleEvent(event);
            }
        })
    }
}
