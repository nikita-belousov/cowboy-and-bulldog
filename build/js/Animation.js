export class Animation {
    timer;
    config;
    isPlaying = false;
    startTime = null;
    id;
    currentFrame = 0;
    constructor({ timer, config }) {
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
    tick() {
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
    finish() {
        if (this.config.isLoop) {
            this.play();
        }
    }
}
