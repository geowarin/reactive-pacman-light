import {Player, Direction, Location} from "../game-idl";
import {DirectionService} from "../Commons/DirectionService";
import GameState from "./GameState";
import GameConfig from "./GameConfig";
import PlayerService from "../api/PlayerService";
import {
    checkCollision, createSprite, motionVector, playerSpeed, updateSprite
} from "./PlayerUtils";
import {DirectProcessor} from "reactor-core-js/flux";
import SceneSupport from "../Commons/SceneSupport";
import MyLocationGameService from "./MyLocationGameService";

export default class PlayersManager implements SceneSupport {

    private direcLog: Array<any> = [];
    private locationProcessor: DirectProcessor<Location.AsObject> = new DirectProcessor();
    private player: Phaser.Physics.Arcade.Sprite;
    private players: { [key: string]: Phaser.Physics.Arcade.Sprite };

    constructor(
        private scene: Phaser.Scene,
        private state: GameState,
        private config: GameConfig,
        private playerService: PlayerService,
        directionService: DirectionService
    ) {

        playerService.players()
            .consume((player: Player.AsObject) => this.doOnPlayer(player));
        playerService.locate(this.locationProcessor)
            .then();
        directionService.listen()
            .consume(direction => this.doOnDirection(direction));

        this.init();
    }

    init() {
        this.player = createSprite(this.state.player, this.scene, this.config, this.state);
        this.players = Object.keys(this.state.players)
            .reduce<{ [key: string]: Phaser.Physics.Arcade.Sprite }>(
                (players, uuid) => (players[uuid] = createSprite(this.state.players[uuid], this.scene, this.config, this.state)) && players,
                {}
            );

        this.scene.cameras.main.startFollow(this.player);
        if (this.state.player.type === Player.Type.GHOST) {
            this.scene.scene.launch('Compass', {
                state: this.state,
                config: this.config,
                playerService: this.playerService,
                locationService: new MyLocationGameService(this.locationProcessor)
            });
        }
    }

    nextDirection: Direction;

    doOnDirection(direction: Direction): void {
        this.nextDirection = direction;
        // const { scale } = this.config;
        // const playerSprite = this.player;
        // const { player, powerState } = this.state;

        // player.location.direction = direction;
        // updateSprite(player, scale, playerSprite);

        // if (player.type == Player.Type.GHOST) {
        //     const animationName = ghostAnimation(direction, powerState);

        //     if (animationName != playerSprite.anims.getCurrentKey()) {
        //         playerSprite.anims.play(animationName);
        //     }
        // }
    }

    doOnPlayer(playerUpdate: Player.AsObject): void {
        const { uuid, state } = playerUpdate;
        if (state === Player.State.CONNECTED) {
            if (uuid !== this.state.player.uuid) {
                this.players[uuid] = createSprite(playerUpdate, this.scene, this.config, this.state);
            }
        } else if (state === Player.State.ACTIVE) {
            if (uuid !== this.state.player.uuid) {
                if (!this.players[uuid]) {
                    this.players[uuid] = createSprite(playerUpdate, this.scene, this.config, this.state);
                }

                const sprite: Phaser.Physics.Arcade.Sprite = this.players[uuid];

                updateSprite(playerUpdate, this.state, this.config, sprite);

                this.state.players[uuid] = playerUpdate;
            }
        } else {
            if (this.state.player.uuid === uuid) {
                location.reload(true);
            }
            else {
                if (this.players[uuid]) {
                    this.players[uuid].destroy();
                }
                delete this.players[uuid];
                delete this.state.players[uuid];
            }
        }
    }

    lastX: number;
    lastY: number;
    update(time: number, deltaTime: number): void {
        Object.keys(this.players).forEach((uuid) => {
            this.scene.children.bringToTop(this.players[uuid]);
        });

        const { player, powerState } = this.state;
        const { type, location: { position } } = player;
        const sprite = this.player;

        const prevDirec = player.location.direction;
        const direction = this.nextDirection;

        this.scene.children.bringToTop(this.player);

        //player.setVelocity(0);
        const speed = playerSpeed(type, deltaTime, powerState);

        for (let i = 0; i < this.direcLog.length; i++) {
            this.direcLog[i].time += deltaTime;
        }
        this.direcLog.unshift({
            direc: direction,
            time: 0
        });
        while (this.direcLog[this.direcLog.length - 1].time > 400) {
            this.direcLog.pop();
        }
        let success = false;
        for (let i = 0; i < this.direcLog.length; i++) {
            if (this.direcLog[i].direc != prevDirec) {
                const regVec = motionVector(prevDirec, speed);
                const motionVec = motionVector(this.direcLog[i].direc, speed);
                const res = checkCollision(
                    this.state.tiles,
                    { ...player.location, direction: this.direcLog[i].direc },
                    { x: position.x + motionVec.x, y: position.y + motionVec.y },
                    true,
                    regVec
                );
                if (res.success) {
                    player.location.direction = direction;
                    position.x = res.x;
                    position.y = res.y;

                    updateSprite(player, this.state, this.config, sprite);

                    this.direcLog = [];
                    success = true;
                    break;
                }
            }
        }

        if (!success) {
            const motionVec = motionVector(prevDirec, speed);
            const res = checkCollision(
                this.state.tiles,
                { ...player.location, direction: prevDirec },
                { x: position.x + motionVec.x, y: position.y + motionVec.y },
                false,
                motionVec
            );
            position.x = res.x;
            position.y = res.y;

            updateSprite(player, this.state, this.config, sprite);
        }

        // this.text.x = this.playerSprite.x;
        // this.text.y = this.playerSprite.y + this.textOffset;

        const currentX = position.x;
        const currentY = position.y;


        if (this.lastX != currentX || this.lastY != currentY || (Date.now() - player.timestamp) > 5000) {
            player.timestamp = Date.now();
            this.lastX = currentX;
            this.lastY = currentY;
            this.locationProcessor.onNext(player.location);
        }
    }
}
