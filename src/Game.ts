import {Audio} from "./Audio.js";
import { Controller } from "./Controller.js";
import {Dead} from "./Dead.js";
import { EventBus } from "./EventBus.js";
import {GlobalState} from "./GlobalState.js";
import { Player } from "./Player.js";
import { Sprite } from "./Sprite.js";
import { EventType, ITimer } from "./types.js";

export interface IGameConstructorParams {
    screenWidth: number;
    screenHeight: number;
}

enum ContextType {
    ui = 'ui',
    foreground = 'foreground',
    background = 'background',
}

enum SpriteType {
    cowboy = 'cowboy',
    dead = 'dead',
    bullet = 'bullet',
}

export class Game {
    screenWidth: number;
    screenHeight: number;
    timer: ITimer = { value: 0 };
    sprites!: Record<SpriteType, Sprite>;

    private ctx!: Record<ContextType, CanvasRenderingContext2D>;
    private controller!: Controller;
    private eventBus!: EventBus;
    private audio!: Audio;
    private player!: Player;
    private enemies: Dead[] = [];
    private globalState!: GlobalState;

    constructor({ screenWidth, screenHeight }: IGameConstructorParams) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }

    async start() {
        await this.loadSprites();
        
        this.initGlobalState();
        this.initCtxs();
        this.initEventBus();
        this.initController();
        this.initAudio();

        this.initPlayer();
        this.spawnEnemies();

        this.eventBus.subscribe(this.player, [EventType.keydown, EventType.keyup]);
        this.eventBus.subscribe(this.globalState, [EventType.keydown, EventType.keyup]);

        this.tick();
    }

    private initCtx(type: ContextType) {
        const canvasElem = document.getElementById(type) as HTMLCanvasElement;

        canvasElem.width = this.screenWidth;
        canvasElem.height = this.screenHeight;

        if (!canvasElem) {
            throw new Error(`can not find canvas element for ${type}`);
        }

        this.ctx = {
            ...(this.ctx || {}),
            [type]: canvasElem.getContext('2d') as CanvasRenderingContext2D,
        };
    }

    private initCtxs() {
        const gameElem = document.getElementById('game') as HTMLDivElement;

        gameElem.style.width = `${this.screenWidth}px`;
        gameElem.style.height = `${this.screenHeight}px`;

        Object.values(ContextType).forEach(this.initCtx.bind(this));
    }

    private async loadSprites(): Promise<void[]> {
        const cowboySprite = new Sprite({
            source: './sprites/cowboy.png',
            size: 100,
            offset: { x: 35, y: 30, width: 30, height: 40 },
        });

        const bulletSprite = new Sprite({
            source: './sprites/bullet.png',
            size: 20,
            offset: { x: 8, y: 8, width: 8, height: 4 },
        });

        const deadSprite = new Sprite({
            source: './sprites/dead.png',
            size: 100,
            offset: { x: 40, y: 30, width: 30, height: 40 },
        });

        this.sprites = { 
            ...(this.sprites || {}),
            [SpriteType.cowboy]: cowboySprite,
            [SpriteType.dead]: deadSprite,
            [SpriteType.bullet]: bulletSprite,
        };

        const loadPromises = Object.values(this.sprites).map(sprite => sprite.load());
        return Promise.all(loadPromises);
    }

    private initPlayer() {
        this.player = new Player({ 
            game: this,
            audio: this.audio,
            globalState: this.globalState,
            timer: this.timer, sprite: this.sprites[SpriteType.cowboy],
            position: { x: 100, y: 300 },
        });
    }

    private spawnEnemies() {
        this.enemies.push(new Dead({ 
            game: this,
            audio: this.audio,
            globalState: this.globalState,
            timer: this.timer,
            sprite: this.sprites[SpriteType.dead],
            position: { x: 600, y: 300 },
            player: this.player,
        }));

        // const spawnTime = Math.round(Math.random() * 10000);

        // setTimeout(() => {
        //     if (!this.globalState.values.isPaused) {
        //         this.enemies.push(new Dead({ 
        //             game: this,
        //             audio: this.audio,
        //             globalState: this.globalState,
        //             timer: this.timer,
        //             sprite: this.sprites[SpriteType.dead],
        //             position: { x: 600, y: 300 },
        //             player: this.player,
        //         }));
        //     }

        //     this.spawnEnemies();
        // }, spawnTime);
    }

    private initEventBus() {
        this.eventBus = new EventBus();
    }

    private initController() {
        this.controller = new Controller({ eventBus: this.eventBus });
    }

    private initAudio() {
        this.audio = new Audio();
    }

    private initGlobalState() {
        this.globalState = new GlobalState({ game: this });
    }

    private update() {
        this.enemies.forEach(enemy => enemy.update());
        this.player.update();
        
        this.timer.value++;
    }

    private draw() {
        const { isDebug } = this.globalState.values;

        const bgCtx = this.ctx[ContextType.background];
        const fgCtx = this.ctx[ContextType.foreground];
        const uiCtx = this.ctx[ContextType.ui];

        fgCtx.clearRect(0, 0, this.screenWidth, this.screenHeight);
        bgCtx.clearRect(0, 0, this.screenWidth, this.screenHeight);
        uiCtx.clearRect(0, 0, this.screenWidth, this.screenHeight);

        bgCtx.fillStyle = 'rgb(160, 160, 160)'; 
        bgCtx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        this.enemies.forEach(enemy => enemy.draw(fgCtx));
        this.player.draw(fgCtx);

        if (isDebug) {
            this.globalState.draw(uiCtx);
        }
    }

    private drawPauseScreen() {
        const uiCtx = this.ctx[ContextType.ui];

        const text = 'pause';
        const fontSize = 20;
        const charWidth = fontSize / 1.5;
        const textWidth = text.length * charWidth;

        uiCtx.save();

        uiCtx.clearRect(0, 0, this.screenWidth, this.screenHeight);
        uiCtx.globalAlpha = 0.4;
        uiCtx.fillStyle = 'rgb(0, 0, 0)'; 
        uiCtx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        uiCtx.globalAlpha = 1;
        uiCtx.fillStyle = 'rgb(255, 255, 255)';
        uiCtx.font = `${fontSize}px monospace`;
        uiCtx.fillText(
            text,
            this.screenWidth / 2 - textWidth / 2,
            this.screenHeight / 2 - fontSize / 2
        );
        
        uiCtx.restore();
    }

    private tick() {
        if (this.globalState.values.isPaused) {
            this.drawPauseScreen();
        } else {
            this.update();
            this.draw();
        }

        window.requestAnimationFrame(this.tick.bind(this));
    }
}
