import { Base } from "./Base.js";
export class Entity extends Base {
    globalState;
    position;
    constructor({ globalState, position }) {
        super();
        this.globalState = globalState;
        this.position = position;
    }
    drawCollisionRect(ctx) {
        const { x, y, width, height } = this.collisionRect;
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.fillStyle = 'rgb(0, 255, 0)';
        ctx.fillRect(x, y - 16, width, 16);
        ctx.font = '7px monospace';
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillText(`x: ${Math.floor(this.position.x)}`, x + 2, y - 9);
        ctx.fillText(`y: ${Math.floor(this.position.y)}`, x + 2, y - 2);
        ctx.strokeStyle = 'rgb(0, 255, 0)';
        ctx.strokeRect(x, y, width, height);
        ctx.restore();
    }
    draw(ctx) {
        if (this.globalState.values.isDebug) {
            this.drawCollisionRect(ctx);
        }
    }
}
