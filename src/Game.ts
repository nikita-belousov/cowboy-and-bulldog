import { Controller } from "./Controller.js";
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
}

export class Game {
    screenWidth: number;
    screenHeight: number;
    timer: ITimer = { value: 0 };

    private ctx!: Record<ContextType, CanvasRenderingContext2D>;
    private sprites!: Record<SpriteType, Sprite>;
    private controller!: Controller;
    private eventBus!: EventBus;
    private player!: Player;
    private globalState!: GlobalState;

    constructor({ screenWidth, screenHeight }: IGameConstructorParams) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }

    async start() {
        await this.loadSprites();
        
        this.initGlobalState();
        this.initCtxs();
        this.initPlayer();
        this.initEventBus();
        this.initController();

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
            // padding: { x: 0, y: 0 },
        });

        this.sprites = { 
            ...(this.sprites || {}),
            [SpriteType.cowboy]: cowboySprite,
        };

        const loadPromises = Object.values(this.sprites).map(sprite => sprite.load());
        return Promise.all(loadPromises);
    }

    private initPlayer() {
        this.player = new Player({ 
            globalState: this.globalState,
            timer: this.timer,
            position: { x: 100, y: 300 },
            sprite: this.sprites[SpriteType.cowboy],
        });
    }

    private initEventBus() {
        this.eventBus = new EventBus();
    }

    private initController() {
        this.controller = new Controller({ eventBus: this.eventBus });
    }

    private initGlobalState() {
        this.globalState = new GlobalState({ game: this });
    }

    private update() {
        this.player.update();
        
        this.timer.value++;
    }

    private draw() {
        const bgCtx = this.ctx[ContextType.background];
        const fgCtx = this.ctx[ContextType.foreground];
        const uiCtx = this.ctx[ContextType.ui];

        fgCtx.clearRect(0, 0, this.screenWidth, this.screenHeight);
        bgCtx.clearRect(0, 0, this.screenWidth, this.screenHeight);
        uiCtx.clearRect(0, 0, this.screenWidth, this.screenHeight);

        bgCtx.fillStyle = 'rgb(255, 255, 255)'; 
        bgCtx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        this.player.draw(fgCtx);

        if (this.globalState.values.isDebug) {
            this.globalState.draw(uiCtx);
        }
    }

    private tick() {
        this.update();
        this.draw();

        window.requestAnimationFrame(this.tick.bind(this));
    }
}
