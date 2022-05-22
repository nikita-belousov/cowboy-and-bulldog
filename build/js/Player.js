import { Entity } from "./Entity.js";
import { EventType } from "./types.js";
export var PlayerState;
(function (PlayerState) {
    PlayerState["idle"] = "idle";
    PlayerState["walkLeft"] = "walk_left";
    PlayerState["walkRight"] = "walk_right";
    PlayerState["jump"] = "jump";
    PlayerState["shoot"] = "shoot";
})(PlayerState || (PlayerState = {}));
export var PlayerDirection;
(function (PlayerDirection) {
    PlayerDirection["right"] = "right";
    PlayerDirection["left"] = "left";
})(PlayerDirection || (PlayerDirection = {}));
export class Player extends Entity {
    collisionRect = { x: 30, y: 30, width: 30, height: 40 };
    timer;
    sprite;
    currentFrame;
    // private animationSpeed = 20;
    walkSpeed = 40;
    direction = PlayerDirection.right;
    jumpForce = 10;
    gravityForce = 0;
    states = {
        [PlayerState.idle]: true,
        [PlayerState.walkLeft]: false,
        [PlayerState.walkRight]: false,
        [PlayerState.jump]: false,
        [PlayerState.shoot]: false,
    };
    constructor({ globalState, position, sprite, timer }) {
        super({ globalState, position });
        this.timer = timer;
        this.sprite = sprite;
        this.startIdle();
    }
    startIdle() {
        this.currentFrame = 0;
    }
    startWalk(direction) {
        if (this.states[PlayerState.jump] ||
            this.states[PlayerState.walkLeft] ||
            this.states[PlayerState.walkRight]) {
            return;
        }
        this.direction = direction;
        if (direction === PlayerDirection.left) {
            this.states[PlayerState.walkLeft] = true;
        }
        else if (direction === PlayerDirection.right) {
            this.states[PlayerState.walkRight] = true;
        }
    }
    startJump() {
        if (this.states[PlayerState.jump]) {
            return;
        }
        this.states[PlayerState.jump] = true;
        this.currentFrame = 0;
    }
    startShoot() {
        this.states[PlayerState.shoot] = true;
        this.currentFrame = 2;
    }
    stopJump() {
        this.states[PlayerState.jump] = false;
        this.gravityForce = 0;
    }
    stopShoot() {
        this.states[PlayerState.shoot] = false;
        this.startIdle();
    }
    updateWalk() {
        this.currentFrame = Math.floor(this.timer.value / 6 % 2);
        const dx = Math.floor(this.walkSpeed / 10);
        if (this.direction === PlayerDirection.right) {
            this.position.x += dx;
        }
        else if (this.direction === PlayerDirection.left) {
            this.position.x -= dx;
        }
    }
    updateJump() {
        this.currentFrame = 0;
        this.gravityForce += 0.5;
        const dy = this.jumpForce - this.gravityForce;
        this.position.y -= dy;
    }
    updateShoot() {
        this.currentFrame = Math.floor(this.timer.value / 4 % 2 + 2);
    }
    updateGroundCollision() {
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
    draw(ctx) {
        const flipX = this.direction === PlayerDirection.left;
        this.sprite.draw(this.currentFrame, ctx, this.position.x, this.position.y, flipX);
        super.draw(ctx);
    }
    handleEvent(event) {
        switch (event.type) {
            case EventType.keydown:
                this.handleKeydown(event);
                break;
            case EventType.keyup:
                this.handleKeyup(event);
                break;
        }
    }
    handleKeydown({ payload: { key, ctrlKey } }) {
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
    handleKeyup({ payload: { key } }) {
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
