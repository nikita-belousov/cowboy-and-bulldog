import { Base } from "./Base.js";
import { Direction } from "./types.js";
export class Entity extends Base {
    id;
    game;
    audio;
    globalState;
    sprite;
    timer;
    position;
    collisionChanges;
    animations;
    currentAnimation;
    direction = Direction.right;
    constructor({ game, audio, globalState, timer, sprite, position }) {
        super();
        this.id = Math.floor(Math.random() * 10000).toString();
        this.game = game;
        this.audio = audio;
        this.globalState = globalState;
        this.timer = timer;
        this.sprite = sprite;
        this.position = position;
        this.resetCollisionChanges();
    }
    get collisionRect() {
        return {
            x: this.position.x + this.collisionChanges.x,
            y: this.position.y + this.collisionChanges.y,
            width: this.sprite.offset.width + this.collisionChanges.width,
            height: this.sprite.offset.height + this.collisionChanges.height,
        };
    }
    changeCollisionRect(changes) {
        this.collisionChanges.x += changes.x || 0;
        this.collisionChanges.y += changes.y || 0;
        this.collisionChanges.width += changes.width || 0;
        this.collisionChanges.height += changes.height || 0;
    }
    resetCollisionChanges() {
        this.collisionChanges = { x: 0, y: 0, width: 0, height: 0 };
    }
    drawCollisionRect(ctx) {
        const { x, y, width, height } = this.collisionRect;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = 'rgb(0, 255, 0)';
        ctx.fillRect(0, -16, width, 16);
        ctx.font = '7px monospace';
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillText(`x: ${Math.floor(this.position.x)}`, 2, -9);
        ctx.fillText(`y: ${Math.floor(this.position.y)}`, 2, -2);
        ctx.strokeStyle = 'rgb(0, 255, 0)';
        ctx.strokeRect(0, 0, width, height);
        ctx.restore();
    }
    drawEntitySprite(ctx) {
        const centerX = this.position.x + this.collisionRect.width / 2;
        const centerY = this.position.y + this.collisionRect.height / 2;
        const width = this.sprite.size;
        const height = this.sprite.size;
        const spriteFrame = this.sprite.size * this.currentAnimation.currentFrame;
        const flipX = this.direction === Direction.left;
        ctx.save();
        ctx.translate(centerX, centerY);
        if (flipX) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(this.sprite.image, spriteFrame, 0, width, height, -this.collisionRect.width / 2 - this.sprite.offset.x, -this.collisionRect.height / 2 - this.sprite.offset.y, width, height);
        ctx.restore();
    }
    draw(ctx) {
        this.drawEntitySprite(ctx);
        if (this.globalState.values.isDebug) {
            this.drawCollisionRect(ctx);
        }
    }
    checkCollision(rect) {
        const { x, y, width, height } = this.collisionRect;
        return x < rect.x + rect.width &&
            x + width > rect.x &&
            y < rect.y + rect.height &&
            y + height > rect.y;
    }
}
