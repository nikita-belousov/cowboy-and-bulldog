export var AudioEffect;
(function (AudioEffect) {
    AudioEffect["shot"] = "shot";
})(AudioEffect || (AudioEffect = {}));
export class Audio {
    static paths = {
        [AudioEffect.shot]: './audio/shot.wav',
    };
    audioCtx;
    tracks;
    constructor() {
        this.initAudioCtx();
        this.loadAudioFiles();
    }
    play(key) {
        this.tracks[key].play();
    }
    initAudioCtx() {
        this.audioCtx = new AudioContext();
    }
    loadAudioFiles() {
        Object.keys(Audio.paths).forEach(key => {
            this.loadAudio(Audio.paths[key])
                .then(track => {
                this.tracks = { ...(this.tracks || {}), [key]: track };
            });
        });
    }
    loadAudio(path) {
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
