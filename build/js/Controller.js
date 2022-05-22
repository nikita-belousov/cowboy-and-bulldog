import { EventType } from "./types.js";
export class Controller {
    eventBus;
    constructor({ eventBus }) {
        this.eventBus = eventBus;
        this.init();
    }
    init() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        document.addEventListener('keyup', this.handleKeyup.bind(this));
    }
    handleKeydown({ key, ctrlKey }) {
        this.eventBus.dispatch({ type: EventType.keydown, payload: { key, ctrlKey } });
    }
    handleKeyup({ key, ctrlKey }) {
        this.eventBus.dispatch({ type: EventType.keyup, payload: { key, ctrlKey } });
    }
}
