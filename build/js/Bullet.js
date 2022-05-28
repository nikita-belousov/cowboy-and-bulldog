import { Entity } from "./Entity.js";
import { Direction } from "./types.js";
import { Animation } from './Animation.js';
export var BulletState;
(function (BulletState) {
    BulletState["shot"] = "shot";
    BulletState["explode"] = "explode";
})(BulletState || (BulletState = {}));
export var BulletAnimation;
(function (BulletAnimation) {
    BulletAnimation["shot"] = "shot";
    BulletAnimation["explode"] = "explode";
})(BulletAnimation || (BulletAnimation = {}));
export class Bullet extends Entity {
    speed = 10;
    explosionTime = 10;
    states = {
        [BulletState.shot]: true,
        [BulletState.explode]: false,
    };
    onDelete;
    explosionStart = null;
    constructor({ direction, onDelete, ...params }) {
        super(params);
        this.onDelete = onDelete;
        this.direction = direction;
        this.initAnimations();
        this.currentAnimation = this.animations[BulletAnimation.shot];
    }
    explode() {
        this.states[BulletState.explode] = true;
        this.explosionStart = this.timer.value;
    }
    updateAnimation() {
        let newAnimation;
        if (this.states[BulletState.explode]) {
            newAnimation = this.animations[BulletAnimation.explode];
        }
        else {
            newAnimation = this.animations[BulletState.shot];
        }
        if (newAnimation !== this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation = newAnimation;
            this.currentAnimation.play();
        }
    }
    update() {
        if (this.states[BulletState.explode]) {
            if (this.explosionStart && this.timer.value - this.explosionStart > this.explosionTime) {
                this.onDelete(this.id);
            }
        }
        else {
            const dx = this.direction === Direction.right ? this.speed : -this.speed;
            this.position.x += dx;
        }
        this.updateAnimation();
    }
    initAnimations() {
        this.animations = {
            [BulletAnimation.shot]: new Animation({
                timer: this.timer,
                config: {
                    id: 'bullet_shot',
                    frames: [0],
                    duration: Infinity,
                },
            }),
            [BulletAnimation.explode]: new Animation({
                timer: this.timer,
                config: {
                    id: 'bullet_explode',
                    frames: [1, 2],
                    duration: this.explosionTime,
                },
            }),
        };
    }
}
