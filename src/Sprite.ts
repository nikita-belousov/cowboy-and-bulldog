export interface ISpriteConstructorParams {
    source: string;
    size: number;
    padding?: { x: number; y: number }
}

export class Sprite {
    image!: HTMLImageElement;
    source!: string;
    size!: number;
    padding: { x: number; y: number } = { x: 0, y: 0 };

    constructor({ source, size, padding }: ISpriteConstructorParams) {
        this.image = new Image();
        this.size = size;
        this.source = source;

        if (padding) {
            this.padding = padding;
        }
    }

    load(): Promise<void> {
        this.image.src = this.source;

        return new Promise((resolve) => {
            this.image.onload = () => {
                resolve();
            };
        });
    }

    draw(frame: number, ctx: CanvasRenderingContext2D, x: number, y: number, flipX?: boolean, flipY?: boolean) {
        ctx.save();

        const width = this.size - (this.padding.x * 2);
        const height = this.size - (this.padding.y * 2);

        ctx.translate(x, y);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(
            this.image,
            this.size * frame + this.padding.x,
            this.padding.y,
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
