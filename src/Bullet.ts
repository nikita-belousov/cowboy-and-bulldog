import { Entity, IEntityConstructorProps } from "./Entity.js";
import {Direction} from "./types.js";
import {Animation} from './Animation.js';

export interface IBulletConstructorParams extends IEntityConstructorProps {
    direction: Direction;
    onDelete: (entityId: string) => void;
}

export enum BulletState {
    shot = 'shot',
    explode = 'explode',
}

export enum BulletAnimation {
    shot = 'shot',
    explode = 'explode',
}

export class Bullet extends Entity {
    speed = 10;
    explosionTime = 10;

    states: Record<BulletState, boolean> = {
        [BulletState.shot]: true,
        [BulletState.explode]: false,
    };

    private onDelete!: IBulletConstructorParams['onDelete'];
    private explosionStart: number | null = null;

    constructor({ direction, onDelete, ...params }: IBulletConstructorParams) {
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

    private updateAnimation() {
        let newAnimation;

        if (this.states[BulletState.explode]) {
            newAnimation = this.animations[BulletAnimation.explode];
        } else {
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
        } else {
            const dx = this.direction === Direction.right ? this.speed : -this.speed;
            this.position.x += dx;
        }

        this.updateAnimation();
    }   

    private initAnimations() {
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
