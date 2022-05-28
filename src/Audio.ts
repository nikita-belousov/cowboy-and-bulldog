export enum AudioEffect {
    shot = 'shot',
}

export class Audio {
    static paths: Record<AudioEffect, string> = {
        [AudioEffect.shot]: './audio/shot.wav',
    }

    audioCtx!: AudioContext;
    tracks!: Record<AudioEffect, HTMLAudioElement>;

    constructor() {
        this.initAudioCtx();
        this.loadAudioFiles();
    }

    play(key: AudioEffect) {
        this.tracks[key].play();
    }

    private initAudioCtx() {
        this.audioCtx = new AudioContext();
    }

    private loadAudioFiles() {
        (Object.keys(Audio.paths) as AudioEffect[]).forEach(key => {
            this.loadAudio(Audio.paths[key])
                .then(track => {
                    this.tracks = { ...(this.tracks || {}), [key]: track };
                });
        });
    }

    private loadAudio(path: string): Promise<HTMLAudioElement> {
        const audioElem = document.createElement('audio');
        audioElem.src = path;

        return new Promise((resolve, reject) => {
            // TODO(nobelou): не работает [23.05.2022]
            audioElem.addEventListener('load', () => {
                const track = this.audioCtx.createMediaElementSource(audioElem);
                track.connect(this.audioCtx.destination);

                resolve(audioElem);
            });

            audioElem.onerror = () => {
                reject(`failed loading audio: ${path}`);
            };
        });
    }
}
