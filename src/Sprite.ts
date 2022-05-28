import { IRect } from "./types";

export interface ISpriteConstructorParams {
    source: string;
    size: number;
    offset: IRect;
}

export class Sprite {
    image!: HTMLImageElement;
    source!: string;
    size!: number;
    offset!: IRect;

    constructor({ source, size, offset }: ISpriteConstructorParams) {
        this.image = new Image();
        this.size = size;
        this.source = source;
        this.offset = offset;
    }

    load(): Promise<void> {
        this.image.src = this.source;

        return new Promise((resolve) => {
            this.image.onload = () => {
                resolve();
            };
        });
    }

    draw(frame: number, ctx: CanvasRenderingContext2D, x: number, y: number, flipX?: boolean, flipY?: boolean, center = true) {
        ctx.save();

        const offsetX = x - this.offset.x;
        const offsetY = y - this.offset.y;
        const width = this.size;
        const height = this.size;

        ctx.translate(offsetX, offsetY);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(
            this.image,
            this.size * frame,
            0,
            width,
            height,
            flipX ? -width : 0,
            0,
            width,
            height
        );

        ctx.restore();
    }
}
