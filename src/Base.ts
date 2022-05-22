import { IEvent } from "./types.js";

export abstract class Base {
    abstract handleEvent(event: IEvent): void;
}
