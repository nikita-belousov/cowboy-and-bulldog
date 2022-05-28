import {BulletState} from "./Bullet.js";
import { Entity, IEntityConstructorProps } from "./Entity.js";
import {Player} from "./Player.js";
import {Animation} from "./Animation.js";

export interface IDeadConstructorParams extends IEntityConstructorProps {
    player: Player;
}

export enum DeadState {
    idle = 'idle',
    walkLeft = 'walk_left',
    walkRight = 'walk_right',
    damaged = 'damaged',
    dead = 'dead',
    attack = 'attack',
}

export enum DeadAnimation {
    idle = 'idle',
    walk = 'walk',
    damaged = 'damaged',
    dead = 'dead',
    attack = 'attack',
}

export enum Direction {
    right = 'right',
    left = 'left',
}

export class Dead extends Entity {
    private player!: Player;
    private walkSpeed = 10;
    private hits = 5;
    private attackRange = 20;
    private damagedTime: number | null = null;
    private damagedAnimationDuration = 16;
    private attackTime: number | null = null;
    private attackAnimationDuration = 15;
    private deathTime: number | null = null;
    private currentAnimation!: Animation;

    private states: Record<DeadState, boolean> = {
        [DeadState.idle]: true,
        [DeadState.walkLeft]: false,
        [DeadState.walkRight]: false,
        [DeadState.damaged]: false,
        [DeadState.dead]: false,
        [DeadState.attack]: false,
    };

    private animations!: Record<DeadAnimation, Animation>;

    constructor({ player, ...params }: IDeadConstructorParams) {
        super(params);

        this.player = player;
        this.startWalk(Direction.left);

        this.initAnimations();
        this.currentAnimation = this.animations[DeadAnimation.idle];
    }   

    private startWalk(direction: Direction) {
        if (this.states[DeadState.walkLeft] || this.states[DeadState.walkRight]) {
            return;
       }

        this.direction = direction;

        if (direction === Direction.left) {
            this.states[DeadState.walkLeft] = true;
        } else if (direction === Direction.right) {
            this.states[DeadState.walkRight] = true;
        }
    }

    private startAttack() {
        this.states[DeadState.attack] = true;
        this.attackTime = this.timer.value;

        const xDiff = this.attackRange + 5;
        this.changeCollisionRect({
            x: this.direction === Direction.right ? xDiff : -xDiff,
        });
    }

    private die() {
        this.states[DeadState.dead] = true;
        this.deathTime = this.timer.value;
    }

    private takeDamage() {
        this.states[DeadState.damaged] = true;
        this.damagedTime = this.timer.value;

        this.hits--;
        if (this.hits === 0) {
            this.die();
        }
    }

    private checkBulletsCollision() {
        this.player.bullets.forEach(bullet => {
            if (bullet.states[BulletState.shot] && !this.states[DeadState.damaged] && this.checkCollision(bullet.collisionRect)) {
                bullet.explode();
                this.takeDamage();
            }
        });
    }

    private checkAttack() {
        if (this.states[DeadState.attack]) {
            return;
        }

        const { x: deadX, y: deadY } = this.position;
        const { x: playerX, y: playerY } = this.player.position;

        if (deadY > playerY + this.player.collisionRect.height) {
            return;
        }

        if (deadX <= playerX && deadX + this.collisionRect.width + this.attackRange >= playerX ||
            deadX > playerX && deadX - this.attackRange <= playerX + this.player.collisionRect.width) {
            this.startAttack();
        }
    }

    private updateDirection() {
        this.direction = this.player.position.x > this.position.x ? Direction.right : Direction.left;
    }

    private updateWalk() {
        this.updateDirection();

        let dx = Math.floor(this.walkSpeed / 10)
        if (this.direction === Direction.right) {
            this.position.x += dx
        } else if (this.direction === Direction.left) {
            this.position.x -= dx
        };

        if (this.direction === Direction.left && this.position.x === 50) {
            this.direction = Direction.right;
        } else if (this.direction === Direction.right && this.position.x === this.game.screenWidth - 50) {
            this.direction = Direction.left;
        }
    }

    private updateDamaged() {
        if (this.damagedTime && this.timer.value - this.damagedTime > this.damagedAnimationDuration) {
            this.states[DeadState.damaged] = false;
            this.damagedTime = null;
        }
    }

    private updateAttack() {
        if (!this.attackTime) {
            return;
        }

        const attackDuration = this.timer.value - this.attackTime;
        const attackHurtPoint = Math.floor(this.attackAnimationDuration / 2);

        if (attackDuration >= attackHurtPoint) {
            // ...
        }

        if (attackDuration > this.attackAnimationDuration) {
            this.states[DeadState.attack] = false;
            this.attackTime = null;
            this.resetCollisionChanges();
        }
    }
    
    private updateDead() {
        // if (this.deathTime && this.timer.value - this.deathTime > 10) {
        //     this.currentFrame = 9;
        // } else {
        //     this.currentFrame = Math.floor(this.timer.value / 6 % 3) + 6;
        // }
    }

    private updateAnimation() {
        let newAnimation;

        if (this.states[DeadState.dead]) {
            newAnimation = this.animations[DeadAnimation.dead];
        } else if (this.states[DeadAnimation.attack]) {
            newAnimation = this.animations[DeadAnimation.attack];
        } else if (this.states[DeadAnimation.damaged]) {
            newAnimation = this.animations[DeadAnimation.damaged];
        } else if (this.states[DeadState.walkLeft] || this.states[DeadState.walkRight]) {
            newAnimation = this.animations[DeadAnimation.walk];
        } else {
            newAnimation = this.animations[DeadAnimation.idle];
        }

        if (newAnimation !== this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation = newAnimation;
            this.currentAnimation.play();
        }
    }

    update() {
        if (this.states[DeadState.dead]) {
            this.updateDead();
        } else if (this.states[DeadState.damaged]) {
            this.updateDamaged();
        } else if (this.states[DeadState.attack]) {
            this.updateAttack();
        } else if (this.states[DeadState.walkLeft] || this.states[DeadState.walkRight]) {
            this.updateWalk();
        }

        this.checkBulletsCollision();
        this.checkAttack();

        this.updateAnimation();
    }

    private initAnimations() {
        this.animations = {
            [DeadAnimation.idle]: new Animation({
                timer: this.timer,
                config: {
                    id: 'dead_idle',
                    frames: [0],
                    duration: Infinity,
                },
            }),
            [DeadAnimation.walk]: new Animation({
                timer: this.timer,
                config: {
                    id: 'dead_walk',
                    frames: [0, 1, 2, 3, 4],
                    duration: 20,
                    isLoop: true,
                },
            }),
            [DeadAnimation.damaged]: new Animation({
                timer: this.timer,
                config: {
                    id: 'dead_damaged',
                    frames: [5, 6],
                    duration: this.damagedAnimationDuration,
                    isLoop: true,
                },
            }),
            [DeadAnimation.dead]: new Animation({
                timer: this.timer,
                config: {
                    id: 'dead_dead',
                    frames: [7, 8, 9],
                    duration: 15,
                },
            }),
            [DeadAnimation.attack]: new Animation({
                timer: this.timer,
                config: {
                    id: 'dead_attack',
                    frames: [10, 11],
                    duration: this.attackAnimationDuration,
                },
            }),
        };
    }
}
