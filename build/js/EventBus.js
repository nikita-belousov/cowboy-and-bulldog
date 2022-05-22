export class EventBus {
    listeners = [];
    subscribe(entity, eventTypes) {
        this.listeners.push({ entity, eventTypes });
    }
    dispatch(event) {
        this.listeners.forEach(listener => {
            if (listener.eventTypes.includes(event.type)) {
                listener.entity.handleEvent(event);
            }
        });
    }
}
