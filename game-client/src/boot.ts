import "phaser";
import RSocketWebSocketClient from 'rsocket-websocket-client';
import {Game, Scene} from 'phaser';
import {RpcClient} from 'rsocket-rpc-core';
import {BufferEncoders} from 'rsocket-core';
import {ReactiveSocket} from 'rsocket-types';
import {Map, RSocketRPCServices} from './game-idl/index';
import {GameScene} from './Game/index';
import Menu from './menu';
import {CompassScene} from './Compass/index';

import * as RSocketApi from './api/rsocket/index';

export class Boot extends Scene {

    constructor() {
        super('Boot');
    }

    preload() {

        this.load.image('logo', 'asset/logo.png');

        this.load.image('food1', 'asset/food1.png');
        this.load.image('food2', 'asset/food2.png');

        this.load.image('compass', 'asset/compass.png');
        this.load.image('compass-needle', 'asset/compass-needle.png');

        this.load.spritesheet('ghost', 'asset/ghost2.png', {frameWidth: 60, frameHeight: 60});
        this.load.spritesheet('man', 'asset/pacman-sprite.png', {frameWidth: 60, frameHeight: 60});

        this.load.spritesheet('tiles', 'asset/tile2.png', {frameWidth: 100, frameHeight: 100});
    }

    create(config: any) {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || "rsocket";
        if (type === "rsocket") {

            let rSocket: ReactiveSocket<any, any>;
            const clientSupplier = () => new RpcClient({
                // transport: new RSocketResumableTransport(
                //     () =>  rSocketWebSocketClient, // provider for low-level transport instances
                //     {
                //         bufferSize: 99999999, // max number of sent & pending frames to
                //         // buffer before failing
                //         resumeToken: uuid.v4(), // string to uniquely identify the session across connections
                //     }
                // ),
                transport: new RSocketWebSocketClient(
                    {
                        // url: urlParams.get('endpoint') || 'ws://localhost:3000',
                        url: urlParams.get('endpoint') || 'ws://dinoman.netifi.com:3000',
                    } as any,//TODO: FIXME
                    BufferEncoders
                ),
                setup: {
                    keepAlive: 5000,
                    lifetime: 60000,
                },
                responder: new RSocketRPCServices.MapServiceServer({
                    setup: (map: Map) => {
                        this.scene.start('Menu', {
                            sizeData: config,
                            maze: map.toObject(),
                            playerService: new RSocketApi.PlayerServiceClientSharedAdapter(rSocket),
                            extrasService: new RSocketApi.ExtrasServiceClientAdapter(rSocket),
                            gameService: new RSocketApi.GameServiceClientAdapter(rSocket)
                        });
                    }
                })
            });

            let client: RpcClient<any, any> = undefined;

            let rSocketReconnectionNumber = 0;

            const connect = () => {
                client = clientSupplier();
                this.showLoadingCircle(() => {
                    client
                        .connect()
                        .then(preparedRSocket => {
                            rSocketReconnectionNumber = 0;
                            rSocket = preparedRSocket;
                        }, () => {
                            client.close();
                            setTimeout(() => connect(), ++rSocketReconnectionNumber * 1000)
                        });
                });
            };

            connect();
        }
    }

    showLoadingCircle(callback: () => void) {
        $('#phaser-overlay-container').css("pointer-events", "none");
        $('#phaser-overlay-container').show();
        $('#phaser-overlay-container #phaser-overlay').children().hide();
        $(".main").hide();
        $("#phaser-container").css("background-color", "white");
        $('#phaser-overlay-container #phaser-overlay').find('.loader').fadeIn(200, callback);
    }
}

(() => {
    const normalWidth = 1280;
    const normalHeight = 720;
    const scale: number = 1;
    const zoom = 1;
    const game = new Game({
        type: Phaser.AUTO,
        parent: 'canvas-container',
        backgroundColor: '#116',
        width: normalWidth * zoom * scale,
        height: normalHeight * zoom * scale,
        physics: {
            default: 'arcade',
            arcade: {
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [new Boot(), new Menu(), new GameScene(), new CompassScene()],
    });
    const sizeData = {
        width: normalWidth * scale,
        height: normalHeight * scale,
        scale: scale,
        zoom: zoom
    };
    game.scene.start('Boot', sizeData);
})();

