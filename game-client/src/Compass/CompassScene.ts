import { Scene } from 'phaser';
import CompassConfig from './CompassConfig';
import CompassService from './CompassService';

export default class CompassScene extends Scene {
    private service: CompassService;
    private compass: Phaser.GameObjects.Image;
    private compassNeedle: Phaser.GameObjects.Image;

    constructor() {
        super('Compass');
    }

    create(config: CompassConfig) {
        this.compass = this.add.image(60, 60, 'compass').setScale(0.6 * config.config.scale);
        this.compassNeedle = this.add.image(60, 60, 'compass-needle').setScale(0.6 * config.config.scale);
        this.service = new CompassService(config.playerService, config.locationService, config.state);
    }

    destroy() {
        this.service.dispose()
    }

    update() {
        const { rotation } = this.service;

        if (rotation == undefined) {
            this.compassNeedle.setRotation((Date.now() / 350) % 360);
        }
        else {
            this.compassNeedle.setRotation(rotation + Math.PI / 2 + Math.PI);
        }
    }
}