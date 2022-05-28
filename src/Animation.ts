import {Sprite} from "./Sprite.js";
import {ITimer} from "./types.js";

export interface IAnimationConfig {
    id: string;
    frames: number[];
    duration: number;
    isLoop?: boolean;
}

export interface IAnimationConstructorParams {
    timer: ITimer;
    config: IAnimationConfig;
}

export class Animation {
    private timer: ITimer;
    private config: IAnimationConfig;
    private isPlaying = false;
    private startTime: number | null = null;

    id!: string;
    currentFrame = 0;

    constructor({ timer, config }: IAnimationConstructorParams) {
        this.timer = timer;
        this.config = config;
        this.id = config.id;
    }

    play() {
        this.isPlaying = true;
        this.startTime = this.timer.value;
        this.tick();
    }

    stop() {
        this.isPlaying = false;
        this.startTime = null;
    }

    private tick() {
        if (!this.isPlaying || this.startTime === null) {
            return;
        }

        const { duration, frames } = this.config;
        const currentDuration = this.timer.value - this.startTime;
        const durationPerFrame = duration / frames.length;

        this.currentFrame = Math.floor(currentDuration / durationPerFrame) + frames[0];

        if (currentDuration >= duration) {
            this.currentFrame = frames[frames.length - 1];
            this.finish();
            return;
        }

        requestAnimationFrame(this.tick.bind(this));
    }

    private finish() {
        if (this.config.isLoop) {
            this.play();
        }
    }
}
