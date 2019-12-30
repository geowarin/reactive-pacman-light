
import GameConfig from "./GameConfig";
import GameState from "./GameState";
import SceneSupport from "../Commons/SceneSupport";


export default class MapManager implements SceneSupport {

    canvases: any[];
    canvassize: number;

    constructor(private scene: Phaser.Scene, private state: GameState, private config: GameConfig) {
        this.canvases = [];
        this.canvassize = 16;

        this.initialize()
    }

    update(): void {
        let { player: { location: { position: { x, y } } } } = this.state;
        const { screen: { width, height }, size, scale } = this.config;
        // x = x / size;
        // y = y / size;

        var canvasWidth = this.canvassize * size;
        for (var i = 0; i < this.canvases.length; i++) {
            var c = this.canvases[i];
            var centerX = c.x + canvasWidth / 2 + size / 2;
            var centerY = c.y + canvasWidth / 2 + size / 2;
            if (Math.abs(x - centerX) <= width / 2 / scale + 50 + canvasWidth / 2 && Math.abs(y - centerY) <= height / 2 / scale + 50 + canvasWidth / 2) {
                if (!c.image) {
                    c.image = this.scene.add.image(c.x, c.y, c.name).setOrigin(0).setScale(scale);
                    
                    this.scene.children.sendToBack(c.image);
                }
            }
            else if (c.image) {
                c.image.destroy();
                c.image = null;
            }
        }
    }

    static ceilPow2(aSize: any) {
        return Math.pow(2, Math.ceil(Math.log(aSize) / Math.log(2)));
    }

    public tileDataMatches(oldData: any, newData: any) {
        if (oldData && newData && typeof oldData == "object" && typeof newData == "object"
            && typeof oldData.tiles == "object" && oldData.tiles instanceof Array
            && typeof newData.tiles == "object" && newData.tiles instanceof Array
            && oldData.tiles.length == newData.tiles.length
            && oldData.width == newData.width && oldData.height == newData.height) {

        }
        else {
            return false;
        }

        var oldTiles = oldData.tiles;
        var newTiles = newData.tiles;

        for (var t = 0; t < oldTiles.length; t++) {
            if (oldTiles[t].x == newTiles[t].x && oldTiles[t].y == newTiles[t].y) {
                var walls1 = oldTiles[t].walls;
                var walls2 = newTiles[t].walls;
                if (walls1.length == walls2.length) {

                }
                else {
                    return false;
                }
                for (var i = 0; i < walls1.length; i++) {
                    if (walls1[i] == walls2[i]) {

                    }
                    else {
                        return false;
                    }
                }
            }
            else {
                return false;
            }
        }

        return true;
    }

    initialize() {

        var tiles = this.state.tiles;
        const size = this.config.size;
        const wid = this.config.map.width;
        const hei = this.config.map.height;

        this.canvases = [];

        var interval = this.canvassize;

        var count = 0;


        for (var x = 0; x < wid; x += interval) {
            for (var y = 0; y < hei; y += interval) {

                var width = Math.min(interval, wid - x);
                var height = Math.min(interval, hei - y);
                var canvasName = 'map' + count;
                var canvasTexture = this.scene.textures.createCanvas(canvasName, width * size, height * size);
                var context = canvasTexture.context;
                var texture = this.scene.textures.get('tiles');

                for (var i = x; i < x + width; i++) {
                    for (var j = y; j < y + height; j++) {
                        var walls: boolean[];
                        for (var t = 0; t < tiles.length; t++) {
                            if (tiles[t].point.x == i && tiles[t].point.y == j) {
                                walls = tiles[t].wallsList;
                                break;
                            }
                        }

                        var frame = -1;
                        var rotation = 0;

                        var wallCount = 0;
                        for (var w = 0; w < walls.length; w++) {
                            if (walls[w]) {
                                wallCount++;
                            }
                        }

                        if (wallCount == 0) {
                            frame = 6;
                        }
                        else if (wallCount == 4) {
                            frame = 9;
                        }
                        else if (wallCount == 3) {
                            frame = 4;
                            for (var w = 0; w < walls.length; w++) {
                                var wall = walls[w];
                                if (!wall) {
                                    rotation = 180 - 90 * w;
                                }
                            }
                        }
                        else if (wallCount == 2) {
                            if (walls[0] == walls[2]) {
                                frame = 13;
                                if (walls[0]) {
                                    rotation = 90;
                                }
                            }
                            else {
                                frame = 8;
                                for (var w = 0; w < walls.length; w++) {
                                    var wall1 = walls[w];
                                    var wall2;
                                    if (w == walls.length - 1) {
                                        wall2 = walls[0];
                                    }
                                    else {
                                        wall2 = walls[w + 1]
                                    }

                                    if (wall1 == wall2 && wall1) {
                                        rotation = -90 * w;
                                    }
                                }
                            }
                        }
                        else if (wallCount == 1) {
                            frame = 12;
                            for (var w = 0; w < walls.length; w++) {
                                var wall = walls[w];
                                if (wall) {
                                    rotation = 90 - (w * 90);
                                    break;
                                }
                            }
                        }

                        if (frame != -1) {
                            var contextX = i - x;
                            var contextY = j - y;

                            context.save();
                            context.translate(contextX * size + size / 2, contextY * size + size / 2);
                            context.rotate(Phaser.Math.DegToRad(rotation));

                            var canvasData = (texture.frames as any)[frame].canvasData;
                            context.drawImage(texture.getSourceImage() as HTMLCanvasElement, canvasData.x, canvasData.y,
                                canvasData.width, canvasData.height, -size / 2, -size / 2, size, size);
                            context.restore();
                        }
                    }
                }

                canvasTexture.refresh();

                var posX = -size / 2 + x * size;
                var posY = -size / 2 + y * size;

                this.canvases.push({
                    x: posX,
                    y: posY,
                    name: canvasName,
                    image: null
                });

                count++;
            }
        }
    }

    public getTile(x: any, y: any) {
        const { tiles } = this.state;
        for (var i = 0; i < tiles.length; i++) {
            if (tiles[i].point.x == x && tiles[i].point.y == y) {
                return tiles[i];
            }
        }

        return false;
    }

    getNeighbor(tile: any, direction: any) {
        var x = tile.x;
        var y = tile.y;
        if (direction == 0) {
            y -= 1;
        }
        else if (direction == 1) {
            x -= 1;
        }
        else if (direction == 2) {
            y += 1;
        }
        else {
            x += 1;
        }

        return this.getTile(x, y);
    }
};