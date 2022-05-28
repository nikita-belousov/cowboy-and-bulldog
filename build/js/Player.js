import { Bullet } from "./Bullet.js";
import { Entity } from "./Entity.js";
import { Direction, EventType } from "./types.js";
import { Animation } from './Animation.js';
export var PlayerState;
(function (PlayerState) {
    PlayerState["idle"] = "idle";
    PlayerState["walkLeft"] = "walk_left";
    PlayerState["walkRight"] = "walk_right";
    PlayerState["jump"] = "jump";
    PlayerState["shoot"] = "shoot";
})(PlayerState || (PlayerState = {}));
export var PlayerAnimation;
(function (PlayerAnimation) {
    PlayerAnimation["idle"] = "idle";
    PlayerAnimation["walk"] = "walk";
    PlayerAnimation["jump"] = "jump";
    PlayerAnimation["shoot"] = "shoot";
})(PlayerAnimation || (PlayerAnimation = {}));
export class Player extends Entity {
    bullets = [];
    walkSpeed = 40;
    jumpForce = 10;
    gravityForce = 0;
    states = {
        [PlayerState.idle]: true,
        [PlayerState.walkLeft]: false,
        [PlayerState.walkRight]: false,
        [PlayerState.jump]: false,
        [PlayerState.shoot]: false,
    };
    constructor(params) {
        super(params);
        this.initAnimations();
        this.startIdle();
        this.direction = Direction.right;
    }
    startIdle() {
        this.currentAnimation = this.animations[PlayerAnimation.idle];
    }
    startWalk(direction) {
        if (this.states[PlayerState.jump] ||
            this.states[PlayerState.walkLeft] ||
            this.states[PlayerState.walkRight]) {
            return;
        }
        this.direction = direction;
        if (direction === Direction.left) {
            this.states[PlayerState.walkLeft] = true;
        }
        else if (direction === Direction.right) {
            this.states[PlayerState.walkRight] = true;
        }
    }
    startJump() {
        if (this.states[PlayerState.jump]) {
            return;
        }
        this.states[PlayerState.jump] = true;
    }
    spawnBullet() {
        const bullet = new Bullet({
            game: this.game,
            audio: this.audio,
            globalState: this.globalState,
            timer: this.timer,
            position: { x: this.position.x + 10, y: this.position.y + 18 },
            sprite: this.game.sprites.bullet,
            direction: this.direction,
            onDelete: id => {
                this.bullets = this.bullets.filter(bullet => bullet.id !== id);
            },
        });
        this.bullets.push(bullet);
    }
    startShoot() {
        if (this.states[PlayerState.shoot]) {
            return;
        }
        this.states[PlayerState.shoot] = true;
        this.spawnBullet();
        // this.audio.play(AudioEffect.shot);
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
        let dx = Math.floor(this.walkSpeed / 10);
        if (this.direction === Direction.right) {
            this.position.x += dx;
        }
        else if (this.direction === Direction.left) {
            this.position.x -= dx;
        }
        ;
    }
    updateJump() {
        this.gravityForce += 0.5;
        const dy = this.jumpForce - this.gravityForce;
        this.position.y -= dy;
    }
    updateShoot() {
        // this.currentFrame = Math.floor(this.timer.value / 4 % 2 + 2);
    }
    updateGroundCollision() {
        this.position.y = Math.min(this.position.y, 300);
        if (this.position.y === 300 && this.states[PlayerState.jump]) {
            this.stopJump();
        }
    }
    updateBullets() {
        this.bullets.forEach(bullet => bullet.update());
    }
    updateAnimation() {
        let newAnimation;
        if (this.states[PlayerState.shoot]) {
            newAnimation = this.animations[PlayerAnimation.shoot];
        }
        else if (this.states[PlayerState.jump]) {
            newAnimation = this.animations[PlayerAnimation.jump];
        }
        else if (this.states[PlayerState.walkLeft] || this.states[PlayerState.walkRight]) {
            newAnimation = this.animations[PlayerAnimation.walk];
        }
        else {
            newAnimation = this.animations[PlayerAnimation.idle];
        }
        if (newAnimation !== this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation = newAnimation;
            this.currentAnimation.play();
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
        this.updateBullets();
        this.updateGroundCollision();
        this.updateAnimation();
    }
    draw(ctx) {
        this.bullets.forEach(bullet => bullet.draw(ctx));
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
                this.startWalk(Direction.left);
                break;
            case 'd':
            case 'ArrowRight':
                this.startWalk(Direction.right);
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
    initAnimations() {
        this.animations = {
            [PlayerAnimation.idle]: new Animation({
                timer: this.timer,
                config: {
                    id: 'player_idle',
                    frames: [0],
                    duration: Infinity,
                },
            }),
            [PlayerAnimation.walk]: new Animation({
                timer: this.timer,
                config: {
                    id: 'player_walk',
                    frames: [0, 1],
                    duration: 12,
                    isLoop: true,
                },
            }),
            [PlayerAnimation.jump]: new Animation({
                timer: this.timer,
                config: {
                    id: 'player_jump',
                    frames: [0],
                    duration: Infinity,
                },
            }),
            [PlayerAnimation.shoot]: new Animation({
                timer: this.timer,
                config: {
                    id: 'player_shoot',
                    frames: [2, 3],
                    duration: 10,
                    isLoop: true,
                },
            }),
        };
    }
}
