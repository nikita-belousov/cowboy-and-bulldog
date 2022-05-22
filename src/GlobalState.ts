import { Base } from "./Base.js";
import { Game } from "./Game.js";
import { EventType, IEvent } from "./types.js";

export interface IGlobalStateConstructorParams {
    game: Game;
}

export interface IGlobalStateValues {
    isDebug: boolean;
}

export class GlobalState extends Base {
    values: IGlobalStateValues = {
        isDebug: false,
    }

    private game!: Game;
    private sidebarWidth = 150;

    constructor({ game }: IGlobalStateConstructorParams) {
        super();

        this.game = game;
    }

    handleEvent({ type, payload }: IEvent) {
        switch (type) {
            case EventType.keydown:
                if (payload.key === 'd' && payload.ctrlKey) {
                    this.toggleDebug();
                }
                break;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.game.screenWidth - this.sidebarWidth, 0);

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, this.sidebarWidth, this.game.screenHeight);

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font = '10px monospace';

        Object.keys(this.values).forEach((key, i) => {
            const value = this.values[key as keyof IGlobalStateValues];
            ctx.fillText(`${(key + ':').padEnd(12)} ${value}`, 10, 14 + i * 13);
        });

        ctx.restore();
    }

    private toggleDebug() {
        this.values.isDebug = !this.values.isDebug;
    }
}
