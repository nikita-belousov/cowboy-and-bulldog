export interface IPosition {
    x: number;
    y: number;
}

export interface ICollisionRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ITimer {
    value: number;
}

export enum EventType {
    keydown = 'keydown',
    keyup = 'keyup',
}

export type IKeyboardEventPayload = Pick<KeyboardEvent, 'key' | 'ctrlKey'>

export interface IKeydownEvent {
    type: EventType.keydown;
    payload: IKeyboardEventPayload;
}

export interface IKeyupEvent {
    type: EventType.keyup;
    payload: IKeyboardEventPayload;
}

export type IEvent = IKeydownEvent | IKeyupEvent;
