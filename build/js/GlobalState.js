import { Base } from "./Base.js";
import { EventType } from "./types.js";
export class GlobalState extends Base {
    values = {
        isDebug: false,
    };
    game;
    sidebarWidth = 150;
    constructor({ game }) {
        super();
        this.game = game;
    }
    handleEvent({ type, payload }) {
        switch (type) {
            case EventType.keydown:
                if (payload.key === 'd' && payload.ctrlKey) {
                    this.toggleDebug();
                }
                break;
        }
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.game.screenWidth - this.sidebarWidth, 0);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, this.sidebarWidth, this.game.screenHeight);
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font = '10px monospace';
        Object.keys(this.values).forEach((key, i) => {
            const value = this.values[key];
            ctx.fillText(`${(key + ':').padEnd(12)} ${value}`, 10, 14 + i * 13);
        });
        ctx.restore();
    }
    toggleDebug() {
        this.values.isDebug = !this.values.isDebug;
    }
}
