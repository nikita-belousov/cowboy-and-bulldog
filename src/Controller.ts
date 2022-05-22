import {EventBus} from "./EventBus.js";
import {EventType} from "./types.js";

export interface IControllerContructorParams {
    eventBus: EventBus;
}

export class Controller {
    eventBus!: EventBus;

    constructor({ eventBus }: IControllerContructorParams) {
        this.eventBus = eventBus;
        this.init();
    }

    private init() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        document.addEventListener('keyup', this.handleKeyup.bind(this));
    }

    private handleKeydown({ key, ctrlKey }: KeyboardEvent) {
        this.eventBus.dispatch({ type: EventType.keydown, payload: { key, ctrlKey } })
    }

    private handleKeyup({ key, ctrlKey }: KeyboardEvent) {
        this.eventBus.dispatch({ type: EventType.keyup, payload: { key, ctrlKey } })
    }
}
