import { Entity, IEntityConstructorProps } from "./Entity.js";
import { Sprite } from "./Sprite.js";
import { EventType, IEvent, IKeydownEvent, IKeyupEvent, ITimer } from "./types.js";

export interface IPlayerConstructorParams extends IEntityConstructorProps {
    timer: ITimer;
    sprite: Sprite;
}

export enum PlayerState {
    idle = 'idle',
    walkLeft = 'walk_left',
    walkRight = 'walk_right',
    jump = 'jump',
    shoot = 'shoot',
}

export enum PlayerDirection {
    right = 'right',
    left = 'left',
}

export class Player extends Entity {
    protected collisionRect = { x: 30, y: 30, width: 30, height: 40 };

    private timer!: ITimer;
    private sprite!: Sprite;
    private currentFrame!: number;
    // private animationSpeed = 20;
    private walkSpeed = 40;
    private direction: PlayerDirection = PlayerDirection.right;
    private jumpForce = 10;
    private gravityForce = 0;

    private states: Record<PlayerState, boolean> = {
        [PlayerState.idle]: true,
        [PlayerState.walkLeft]: false,
        [PlayerState.walkRight]: false,
        [PlayerState.jump]: false,
        [PlayerState.shoot]: false,
    };

    constructor({ globalState, position, sprite, timer }: IPlayerConstructorParams) {
        super({ globalState, position });

        this.timer = timer;
        this.sprite = sprite;
        this.startIdle();
    }

    private startIdle() {
        this.currentFrame = 0;
    }

    private startWalk(direction: PlayerDirection) {
        if (this.states[PlayerState.jump] || 
            this.states[PlayerState.walkLeft] || 
            this.states[PlayerState.walkRight]) {
            return;
        }

        this.direction = direction;

        if (direction === PlayerDirection.left) {
            this.states[PlayerState.walkLeft] = true;
        } else if (direction === PlayerDirection.right) {
            this.states[PlayerState.walkRight] = true;
        }
    }

    private startJump() {
        if (this.states[PlayerState.jump]) {
            return;
        }

        this.states[PlayerState.jump] = true;
        this.currentFrame = 0;
    }

    private startShoot() {
        this.states[PlayerState.shoot] = true;
        this.currentFrame = 2;
    }

    private stopJump() {
        this.states[PlayerState.jump] = false;
        this.gravityForce = 0;
    }

    private stopShoot() {
        this.states[PlayerState.shoot] = false;
        this.startIdle();
    }

    private updateWalk() {
        this.currentFrame = Math.floor(this.timer.value / 6 % 2);
        const dx = Math.floor(this.walkSpeed / 10)

        if (this.direction === PlayerDirection.right) {
            this.position.x += dx
        } else if (this.direction === PlayerDirection.left) {
            this.position.x -= dx
        }
    }

    private updateJump() {
        this.currentFrame = 0;
        this.gravityForce += 0.5;
        const dy = this.jumpForce - this.gravityForce;
        this.position.y -= dy;
    }

    private updateShoot() {
        this.currentFrame = Math.floor(this.timer.value / 4 % 2 + 2);
    }

    private updateGroundCollision() {
        this.position.y = Math.min(this.position.y, 300);

        if (this.position.y === 300 && this.states[PlayerState.jump]) {
            this.stopJump();
        }
    }

    update() {
        if (this.states[PlayerState.walkLeft] || this.states[PlayerState.walkRight]) {
            this.updateWalk();
        }
        if (this.states[PlayerState.jump]) {
            this.updateJump();
        }
        if (this.states[PlayerState.shoot]) {
            this.updateShoot();
        }
        this.updateGroundCollision();
    }

    draw(ctx: CanvasRenderingContext2D) {
        const flipX = this.direction === PlayerDirection.left;
        this.sprite.draw(this.currentFrame, ctx, this.position.x, this.position.y, flipX);

        super.draw(ctx);
    }

    handleEvent(event: IEvent) {
        switch (event.type) {
            case EventType.keydown:
                this.handleKeydown(event);
                break;
            case EventType.keyup:
                this.handleKeyup(event);
                break;
        }
    }

    private handleKeydown({ payload: { key, ctrlKey } }: IKeydownEvent) {
        if (ctrlKey) {
            return;
        }

        switch (key) {
            case 'a':
            case 'ArrowLeft':
                this.startWalk(PlayerDirection.left);
                break;
            case 'd':
            case 'ArrowRight':
                this.startWalk(PlayerDirection.right);
                break;
            case ' ':
                this.startJump();
                break;
            case 'j':
                this.startShoot();
                break;
        }
    }

    private handleKeyup({ payload: { key } }: IKeyupEvent) {
        switch (key) {
            case 'a':
            case 'ArrowLeft':
                this.states[PlayerState.walkLeft] = false;
                break;
            case 'd':
            case 'ArrowRight':
                this.states[PlayerState.walkRight] = false;
                break;
            case 'j':
                this.stopShoot();
                break;
        }
    }
}
