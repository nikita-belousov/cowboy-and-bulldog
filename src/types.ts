export interface IPosition {
    x: number;
    y: number;
}

export interface IRect {
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

export enum Direction {
    left = 'left',
    right = 'right',
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
