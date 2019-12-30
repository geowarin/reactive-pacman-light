import { Flux, DirectProcessor } from "reactor-core-js/flux";
import { Direction } from "../game-idl";

export interface DirectionService {

    listen(): Flux<Direction>
}

export class KeysService implements DirectionService {

    private readonly keysProcessor: DirectProcessor<Direction>;

    constructor(scene: Phaser.Scene) {
        this.keysProcessor = new DirectProcessor<Direction>();
        scene.input.keyboard.on('keydown', ({ key }: any) => {
            switch (key) {
                case "ArrowUp":
                    this.keysProcessor.onNext(Direction.UP);
                    return;

                case "ArrowLeft":
                    this.keysProcessor.onNext(Direction.LEFT);
                    return;

                case "ArrowDown":
                    this.keysProcessor.onNext(Direction.DOWN);
                    return;

                case "ArrowRight":
                    this.keysProcessor.onNext(Direction.RIGHT);
                    return;
            }
        }, this);
    }

    listen(): Flux<Direction> {
        return this.keysProcessor;
    }
}
export class SwipeService implements DirectionService {


    private readonly minX = 30;  //min x swipe for horizontal swipe
    private readonly maxX = 30;  //max x difference for vertical swipe
    private readonly minY = 50;  //min y swipe for vertical swipe
    private readonly maxY = 60;  //max y difference for horizontal swipe

    private readonly swipeProcessor: DirectProcessor<Direction>;

    private initialX: number;
    private initialY: number;
    private observedX: number;
    private observedY: number;

    constructor(scene: Phaser.Scene) {
        this.swipeProcessor = new DirectProcessor<Direction>()
        window.document.querySelector('#phaser-overlay').addEventListener("touchstart", this.doOnStartTouch.bind(this), false);
        window.document.querySelector('#phaser-overlay').addEventListener("touchmove", this.doOnMoveTouch.bind(this), false);
        window.document.querySelector('#phaser-overlay').addEventListener("touchend", this.doOnEndTouch.bind(this), false);
    }

    doOnStartTouch(e: TouchEvent) {
        const touch = e.touches[0];

        this.initialX = touch.screenX;
        this.initialY = touch.screenY;

        e.preventDefault();
    }

    doOnMoveTouch(e: TouchEvent) {
        const touch = e.touches[0];

        this.observedX = touch.screenX;
        this.observedY = touch.screenY;

        e.preventDefault();
    }

    doOnEndTouch(e: TouchEvent) {
        const {
            initialX, initialY,
            observedX, observedY,
            maxX, minX, maxY, minY
        } = this;

        if ((((observedX - minX > initialX) || (observedX + minX < initialX)) && ((observedY < initialY + maxY) && (initialY > observedY - maxY) && (observedX > 0)))) {
            if (observedX > initialX) {
                this.swipeProcessor.onNext(Direction.RIGHT);
            } else {
                this.swipeProcessor.onNext(Direction.LEFT);
            }
        }
        //vertical detection
        else if ((((observedY - minY > initialY) || (observedY + minY < initialY)) && ((observedX < initialX + maxX) && (initialX > observedX - maxX) && (observedY > 0)))) {
            if (observedY > initialY) {
                this.swipeProcessor.onNext(Direction.DOWN);
            } else {
                this.swipeProcessor.onNext(Direction.UP);
            }
        }

        this.initialX = 0;
        this.initialY = 0;
        this.observedX = 0;
        this.observedY = 0;

        e.preventDefault();
    }

    //
    // moveTouch(e: TouchEvent) {
    //     if (this.initialX === null) {
    //         return;
    //     }
    //     var currentX = e.touches[0].clientX;
    //     var currentY = e.touches[0].clientY;
    //
    //     var diffX = this.initialX - currentX;
    //     var diffY = this.initialY - currentY;
    //
    //     if (Math.abs(diffX) > Math.abs(diffY)) {
    //         // sliding horizontally
    //         if (diffX > 0) {
    //         // swiped left
    //             this.swipeProcessor.onNext(Direction.LEFT);
    //         } else {
    //         // swiped right
    //             this.swipeProcessor.onNext(Direction.RIGHT);
    //         }
    //     } else {
    //         // sliding vertically
    //         if (diffY > 0) {
    //         // swiped up
    //             this.swipeProcessor.onNext(Direction.UP);
    //         } else {
    //         // swiped down
    //             this.swipeProcessor.onNext(Direction.DOWN);
    //         }
    //     }
    //
    //     this.initialX = null;
    //     this.initialY = null;
    //
    //     e.preventDefault();
    // }


    listen(): Flux<Direction> {
        return this.swipeProcessor;
    }
}


export class ControlsService implements DirectionService {
    private swipeService: SwipeService;
    private keysService: KeysService;

    constructor(scene: Phaser.Scene) {
        this.keysService = new KeysService(scene);
        this.swipeService = new SwipeService(scene);
    }

    listen(): Flux<Direction> {
        return Flux.mergeArray([this.swipeService.listen(), this.keysService.listen()]);
    }
}
