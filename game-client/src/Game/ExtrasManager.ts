import GameState from "./GameState";
import GameConfig from "./GameConfig";
import ExtrasService from "../api/ExtrasService";
import { Extra } from "../game-idl";
import SceneSupport from "../Commons/SceneSupport";

export default class ExtrasManager implements SceneSupport {
    extra: Set<number>;
    extraSprites: Map<number, Phaser.Physics.Arcade.Sprite>;

    constructor(
        private scene: Phaser.Scene,
        private state: GameState,
        private config: GameConfig,
        extras: Array<number>,
        extraService: ExtrasService,
    ) {
        this.extra = new Set();
        this.extraSprites = new Map();
        extras.forEach(extra => this.insertExtra(extra));
        extraService.extras()
            .consume(e => this.doOnExtra(e));
    }

    currentTimeout: any;

    doOnExtra(extra: Extra.AsObject) {
        this.retainExtra(extra.last);
        this.insertExtra(extra.current);

        if (Math.sign(extra.last) === -1) {
            if (this.state.powerState > 0) {
                clearTimeout(this.currentTimeout);
            }

            this.state.powerState = 1;
            this.currentTimeout = setTimeout(() => {
                this.state.powerState = 2;
                this.currentTimeout = setTimeout(() => {
                    this.state.powerState = 0;
                }, 3000);
            }, 7000);
        }
    }

    retainExtra(position: number) {
        if (this.extra.has(position)) {
            this.extra.delete(position);

            const normalizedPosition = Math.abs(position);

            this.extraSprites.get(normalizedPosition).destroy();
            this.extraSprites.delete(normalizedPosition);
        }
    }

    // extra < 0 == powerUp

    insertExtra(position: number) {
        const normalizedPosition = Math.abs(position);
        const { map: { width }, size, scale } = this.config;
        const i = normalizedPosition % width;
        const j = Math.floor(normalizedPosition / width);
        const sprite = this.scene.physics.add
            .sprite(
                i * size,
                j * size,
                'food' + (Math.sign(position) === 1 ? '1' : '2')
            )
            .setScale(scale);
        this.extraSprites.set(normalizedPosition, sprite);
        this.extra.add(position);
    }

    update(): void { }
}
