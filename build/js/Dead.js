import { BulletState } from "./Bullet.js";
import { Entity } from "./Entity.js";
import { Animation } from "./Animation.js";
export var DeadState;
(function (DeadState) {
    DeadState["idle"] = "idle";
    DeadState["walkLeft"] = "walk_left";
    DeadState["walkRight"] = "walk_right";
    DeadState["damaged"] = "damaged";
    DeadState["dead"] = "dead";
    DeadState["attack"] = "attack";
})(DeadState || (DeadState = {}));
export var DeadAnimation;
(function (DeadAnimation) {
    DeadAnimation["idle"] = "idle";
    DeadAnimation["walk"] = "walk";
    DeadAnimation["damaged"] = "damaged";
    DeadAnimation["dead"] = "dead";
    DeadAnimation["attack"] = "attack";
})(DeadAnimation || (DeadAnimation = {}));
export var Direction;
(function (Direction) {
    Direction["right"] = "right";
    Direction["left"] = "left";
})(Direction || (Direction = {}));
export class Dead extends Entity {
    player;
    walkSpeed = 10;
    hits = 5;
    attackRange = 20;
    damagedTime = null;
    damagedAnimationDuration = 16;
    attackTime = null;
    attackAnimationDuration = 15;
    deathTime = null;
    currentAnimation;
    states = {
        [DeadState.idle]: true,
        [DeadState.walkLeft]: false,
        [DeadState.walkRight]: false,
        [DeadState.damaged]: false,
        [DeadState.dead]: false,
        [DeadState.attack]: false,
    };
    animations;
    constructor({ player, ...params }) {
        super(params);
        this.player = player;
        this.startWalk(Direction.left);
        this.initAnimations();
        this.currentAnimation = this.animations[DeadAnimation.idle];
    }
    startWalk(direction) {
        if (this.states[DeadState.walkLeft] || this.states[DeadState.walkRight]) {
            return;
        }
        this.direction = direction;
        if (direction === Direction.left) {
            this.states[DeadState.walkLeft] = true;
        }
        else if (direction === Direction.right) {
            this.states[DeadState.walkRight] = true;
        }
    }
    startAttack() {
        this.states[DeadState.attack] = true;
        this.attackTime = this.timer.value;
        const xDiff = this.attackRange + 5;
        this.changeCollisionRect({
            x: this.direction === Direction.right ? xDiff : -xDiff,
        });
    }
    die() {
        this.states[DeadState.dead] = true;
        this.deathTime = this.timer.value;
    }
    takeDamage() {
        this.states[DeadState.damaged] = true;
        this.damagedTime = this.timer.value;
        this.hits--;
        if (this.hits === 0) {
            this.die();
        }
    }
    checkBulletsCollision() {
        this.player.bullets.forEach(bullet => {
            if (bullet.states[BulletState.shot] && !this.states[DeadState.damaged] && this.checkCollision(bullet.collisionRect)) {
                bullet.explode();
                this.takeDamage();
            }
        });
    }
    checkAttack() {
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
    updateDirection() {
        this.direction = this.player.position.x > this.position.x ? Direction.right : Direction.left;
    }
    updateWalk() {
        this.updateDirection();
        let dx = Math.floor(this.walkSpeed / 10);
        if (this.direction === Direction.right) {
            this.position.x += dx;
        }
        else if (this.direction === Direction.left) {
            this.position.x -= dx;
        }
        ;
        if (this.direction === Direction.left && this.position.x === 50) {
            this.direction = Direction.right;
        }
        else if (this.direction === Direction.right && this.position.x === this.game.screenWidth - 50) {
            this.direction = Direction.left;
        }
    }
    updateDamaged() {
        if (this.damagedTime && this.timer.value - this.damagedTime > this.damagedAnimationDuration) {
            this.states[DeadState.damaged] = false;
            this.damagedTime = null;
        }
    }
    updateAttack() {
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
    updateDead() {
        // if (this.deathTime && this.timer.value - this.deathTime > 10) {
        //     this.currentFrame = 9;
        // } else {
        //     this.currentFrame = Math.floor(this.timer.value / 6 % 3) + 6;
        // }
    }
    updateAnimation() {
        let newAnimation;
        if (this.states[DeadState.dead]) {
            newAnimation = this.animations[DeadAnimation.dead];
        }
        else if (this.states[DeadAnimation.attack]) {
            newAnimation = this.animations[DeadAnimation.attack];
        }
        else if (this.states[DeadAnimation.damaged]) {
            newAnimation = this.animations[DeadAnimation.damaged];
        }
        else if (this.states[DeadState.walkLeft] || this.states[DeadState.walkRight]) {
            newAnimation = this.animations[DeadAnimation.walk];
        }
        else {
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
        }
        else if (this.states[DeadState.damaged]) {
            this.updateDamaged();
        }
        else if (this.states[DeadState.attack]) {
            this.updateAttack();
        }
        else if (this.states[DeadState.walkLeft] || this.states[DeadState.walkRight]) {
            this.updateWalk();
        }
        this.checkBulletsCollision();
        this.checkAttack();
        this.updateAnimation();
    }
    initAnimations() {
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
