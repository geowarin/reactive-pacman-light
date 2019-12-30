import GameConfig from "./GameConfig";
import {Player, Tile, Point, Direction, Location} from "../game-idl/index";
import GameState from "./GameState";

export const updateSprite = (
    { location: { direction, position: {x, y} }, type }: Player.AsObject,
    { powerState }: GameState,
    { size }: GameConfig,
    playerSprite: Phaser.Physics.Arcade.Sprite
) => {

    playerSprite.setX(x);
    playerSprite.setY(y);

    if (direction === Direction.LEFT) {
        playerSprite.setFlipX(true);
        playerSprite.setRotation(Phaser.Math.DegToRad(0));
    }
    else if (direction === Direction.RIGHT) {
        playerSprite.setFlipX(false);
        playerSprite.setRotation(Phaser.Math.DegToRad(0));
    }
    else if (direction === Direction.UP) {
        playerSprite.setFlipX(false);
        if (type == Player.Type.PACMAN)
            playerSprite.setRotation(Phaser.Math.DegToRad(270));
    }
    else if (direction === Direction.DOWN) {
        playerSprite.setFlipX(false);
        if (type == Player.Type.PACMAN)
            playerSprite.setRotation(Phaser.Math.DegToRad(90));
    }

    if (type === Player.Type.GHOST) {
        const animationName = ghostAnimation(direction, powerState);

        if (animationName !== playerSprite.anims.getCurrentKey()) {
            playerSprite.anims.play(animationName);
        }
    }
};

export const createSprite = (user: Player.AsObject, scene: Phaser.Scene, config: GameConfig, state: GameState): Phaser.Physics.Arcade.Sprite => {
    const { scale, size } = config;

    const sprite = scene.physics.add
        .sprite(
            user.location.position.x,
            user.location.position.y,
            user.type == Player.Type.GHOST ? "ghost" : "man"
        );
        // .setScale(scale, scale);

    if (user.type == Player.Type.PACMAN) {
        sprite.anims.play("eat");
    }
    else if (user.type == Player.Type.GHOST) {
        sprite.anims.play(ghostAnimation(user.location.direction, state.powerState));
    }

    return sprite
};

export const ghostAnimation = (direction: Direction, powerState: number) => {
    let animationName = powerState == 0 ? "default" : powerState == 1 ? "powerup" : "powerup-wearoff";

    if (direction == Direction.UP) {
        animationName += "-up";
    }
    else if (direction == Direction.DOWN) {
        animationName += "-down";
    }

    return animationName;
};

export const playerSpeed = (playerType: Player.Type, dt: number, powerState: number) => {
    const maxSpeed = 5;
    let speed = 0;

    if (playerType == Player.Type.PACMAN) {
        speed = (dt / 4);
    }
    else if (playerType == Player.Type.GHOST) {
        if (powerState == 0) {
            speed = (dt / 3.6);
        }
        else {
            speed = (dt / 4.5);
        }
    }

    speed = Math.min(speed, maxSpeed);

    return speed;
};

export const motionVector = (direction: number, speed: number) => {
    const obj = {
        x: 0,
        y: 0
    };

    if (direction === Direction.LEFT) {
        obj.x -= speed;
    }
    else if (direction === Direction.RIGHT) {
        obj.x += speed;
    }
    else if (direction === Direction.UP) {
        obj.y -= speed;
    }
    else if (direction === Direction.DOWN) {
        obj.y += speed;
    }

    return obj;
}


export const checkCollision = (
    tiles: Array<Tile.AsObject>,
    initialLocation: Location.AsObject,
    nextPosition: Point.AsObject,
    newDirection: boolean,
    regVec: { x: number; y: number; },
    forceTurn?: any
) => {
        const direction = initialLocation.direction;
        const initialX = initialLocation.position.x;
        const initialY = initialLocation.position.y;
        const finalX = nextPosition.x;
        const finalY = nextPosition.y;
        const size = 100;

        var scaledX = finalX / size;
        var scaledY = finalY / size;
        var initialTileX = Math.round(initialX / size);
        var initialTileY = Math.round(initialY / size);
        var finalTileX = Math.round(finalX / size);
        var finalTileY = Math.round(finalY / size);
        var tilePath = [];
        if (direction == 0 || direction == 2) {
            for (var i = 0 ; i <= Math.abs(initialTileY - finalTileY) ; i++) {
                var change = (direction == 0 ? -1 : 1) * i;
                tilePath.push({x: initialTileX, y: initialTileY + change});
            }
        }
        else {
            for (var i = 0 ; i <= Math.abs(initialTileX - finalTileX) ; i++) {
                var change = (direction == 1 ? -1 : 1) * i;
                tilePath.push({x: initialTileX + change, y: initialTileY});
            }
        }

        var threshold = 0.1;
        var extraWallSqueeze = .001;

        for (var t = 0 ; t < tilePath.length - 1 ; t++) {
            for (var i = 0 ; i < tiles.length ; i++) {
                var tile = tiles[i];
                var tileX = tilePath[t].x;
                var tileY = tilePath[t].y;
                if (tileX == tile.point.x && tileY == tile.point.y) {
                    var wall = tile.wallsList[direction];
                    if (wall) {
                        if (direction == 0 || direction == 2) {
                            return {
                                x: initialX,
                                y: tileY * size,
                                //y: (direction == 0 ? tileY - threshold : tileY + threshold) * size,
                                success: false
                            };
                        }
                        else {
                            return {
                                //x: (direction == 1 ? tileX - threshold : tileX + threshold) * size,
                                x: tileX * size,
                                y: initialY,
                                success: false
                            };
                        }
                    }
                }
            }
        }

        if (!newDirection) {
            threshold = 0;
        }

        for (var i = 0 ; i < tiles.length ; i++) {
            var tile = tiles[i];
            var tileX = tilePath[tilePath.length - 1].x;
            var tileY = tilePath[tilePath.length - 1].y;
            if (tileX == tile.point.x && tileY == tile.point.y) {
                var wall = tile.wallsList[direction];

                var initX = initialX / size;
                var initY = initialY / size;

                var hypX = (initialX + regVec.x) / size;
                var hypY = (initialY + regVec.y) / size;

                var worked = false;
                if (wall && direction == 0 && scaledY >= tileY - threshold) {
                    worked = true;
                }
                else if (wall && direction == 2 && scaledY <= tileY + threshold) {
                    worked = true;
                }
                else if (wall && direction == 1 && scaledX >= tileX - threshold) {
                    worked = true;
                }
                else if (wall && direction == 3 && scaledX <= tileX + threshold) {
                    worked = true;
                }
                else if (!wall && (direction == 0 || direction == 2) && tileX >= Math.min(initX, hypX) && tileX <= Math.max(initX, hypX)) {
                    worked = true;
                }
                else if (!wall && (direction == 1 || direction == 3) && tileY >= Math.min(initY, hypY) && tileY <= Math.max(initY, hypY)) {
                    worked = true;
                }
                else if (forceTurn) {
                    worked = true;
                }
                else {
                    worked = false;
                }

                if (worked) {
                    if (direction == 0 || direction == 2) {
                        return {x: tileX * size, y: finalY, success: !wall || tilePath.length > 1};
                    }
                    else {
                        return {x: finalX, y: tileY * size, success: !wall || tilePath.length > 1};
                    }
                }
                else {
                    var success = tilePath.length > 1;
                    if (direction == 0 || direction == 2) {
                        return {
                            x: initialX,
                            y: tileY * size,
                            //y: (direction == 0 ? tileY - threshold : tileY + threshold) * size,
                            success: success
                        };
                    }
                    else {
                        return {
                            x: tileX * size,
                            //x: (direction == 1 ? tileX - threshold : tileX + threshold) * size,
                            y: initialY,
                            success: success
                        };
                    }
                }
            }
        }

        return {
            x: initialX,
            y: initialY,
            success: false
        };
}
