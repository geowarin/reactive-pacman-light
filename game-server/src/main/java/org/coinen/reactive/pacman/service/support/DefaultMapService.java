package org.coinen.reactive.pacman.service.support;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.coinen.pacman.Map;
import org.coinen.pacman.Point;
import org.coinen.pacman.Size;
import org.coinen.pacman.Tile;
import org.coinen.reactive.pacman.service.MapService;

public class DefaultMapService implements MapService {

    final Map         map;
    final List<Point> tilesPosition;

    public DefaultMapService() {
        map = Map.newBuilder()
                 .addAllTiles(generate(60, 60, 10))
                 .setSize(Size.newBuilder()
                              .setWidth(60)
                              .setHeight(60)
                              .build())
                 .build();
        tilesPosition = generateTileCoordinates(60, 60, 10, 10);

    }

    static class TileInner {

        int       x;
        int       y;
        boolean   checked;
        Boolean[] walls;
    }

    @Override
    public Map getMap() {
        return map;
    }

    @Override
    public List<Point> getTilesPositions() {
        return tilesPosition;
    }

    @Override
    public Point getRandomPoint() {
        return tilesPosition.get(getRandomIntInclusive(0, tilesPosition.size() - 1));
    }

    static List<Point> generateTileCoordinates(int width,
                                               int height,
                                               int offsetX,
                                               int offsetY) {
        var minX = offsetX;
        var maxX = width - offsetX - 1;
        var minY = offsetY;
        var maxY = height - offsetY - 1;

        var arr = new ArrayList<Point>();

        for (var i = minX; i <= maxX; i++) {
            for (var j = minY; j <= maxY; j++) {
                arr.add(Point.newBuilder()
                             .setX(i)
                             .setY(j)
                             .build());
            }
        }

        return arr;
    }

    static float distance2(Point p1, Point p2) {
        var d1 = p1.getX() - p2.getX();
        var d2 = p1.getY() - p2.getY();

        return d1 * d1 + d2 * d2;
    }

    private static final List<Tile> generate(int width, int height, int offset) {
        var arr = new Integer[width][];

        for (var i = 0; i < width; i++) {
            Integer[] column = new Integer[height];
            Arrays.fill(column, -1);
            arr[i] = column;
        }

        var tileIndices = generateTileCoordinates(width, height, offset, offset);

        var center = Point.newBuilder()
                          .setX(Math.round(width / 2f))
                          .setY(Math.round(height / 2f))
                          .build();

        tileIndices.sort((p1, p2) -> Float.compare(distance2(p1, center),
            distance2(p2, center)));

        var count = 0;
        var bounds = offset;
        for (var p = 0; p < tileIndices.size(); p++) {
            Point point = tileIndices.get(p);
            int i = (int) point.getX();
            int j = (int) point.getY();

            if (arr[i] == null) {
                Integer[] column = new Integer[height];
                arr[i] = column;
            }

            if (arr[i][j] == -1) {
                var shapeNum = count;
                arr[i][j] = shapeNum;
                var shapeCount = 0;
                var offsetX = 0;
                var offsetY = 0;
                var max = getRandomIntInclusive(4, 8);
                while (shapeCount < max) {
                    var direc = getRandomIntInclusive(0, 3);
                    var changeX = 0;
                    var changeY = 0;
                    var direcCount = 0;
                    do {
                        if (direc == 0) {
                            changeX = 1;
                        }
                        else if (direc == 1) {
                            changeX = -1;
                        }
                        else if (direc == 2) {
                            changeY = 1;
                        }
                        else {
                            changeY = -1;
                        }

                        var elem = arr[i + offsetX + changeX][j + offsetY + changeY];
                        if (elem == null || elem == -1) {
                            offsetX += changeX;
                            offsetY += changeY;
                            arr[i + offsetX][j + offsetY] = shapeNum;
                            break;
                        }
                        else {
                            changeX = 0;
                            changeY = 0;
                            direc++;
                            if (direc == 4) {
                                direc = 0;
                            }
                            direcCount++;
                        }
                    }
                    while (changeX == 0 && changeY == 0 && direcCount < 4);
                    shapeCount++;
                }
                count++;
            }
        }

        return generateTiles(arr, width, height, offset);
    }

    static List<Tile> generateTiles(Integer[][] data, int width, int height, int offset) {
        List<TileInner> tiles = new ArrayList<>();
        for (var i = 0; i < data.length - 1; i++) {
            for (var j = 0; j < data[i].length - 1; j++) {
                var walls = new Boolean[] {false, false, false, false};
                if (data[i][j].equals(data[i + 1][j]) && data[i][j] != null && data[i + 1][j] != null) {
                    walls[0] = true;
                }
                if (data[i][j].equals(data[i][j + 1]) && data[i][j] != null && data[i][j + 1] != null) {
                    walls[1] = true;
                }
                if (data[i][j + 1].equals(data[i + 1][j + 1]) && data[i][j + 1] != null && data[i + 1][j + 1] != null) {
                    walls[2] = true;
                }
                if (data[i + 1][j].equals(data[i + 1][j + 1]) && data[i + 1][j] != null && data[i + 1][j + 1] != null) {
                    walls[3] = true;
                }
                var tile = new TileInner();
                tile.x = i;
                tile.y = j;
                tile.walls = walls;
                tiles.add(tile);
            }
        }

        checkTiles(tiles, width, height, offset);

        return tiles.stream()
                    .map(ti -> Tile.newBuilder()
                                   .setPoint(Point.newBuilder()
                                                  .setX(ti.x)
                                                  .setY(ti.y)
                                                  .build())
                                   .addAllWalls(Arrays.asList(ti.walls))
                                   .build())
                    .collect(Collectors.toList());
    }

    static void checkTiles(List<TileInner> tiles, int width, int height, int offset) {
        var minX = offset;
        var maxX = width - offset - 1;
        var minY = offset;
        var maxY = height - offset - 1;

        var bounds = new int[] {minX, maxX, minY, maxY};
        List<TileInner> badTiles;
        while (true) {
            resetTileCheck(bounds, tiles);
            checkTileRecursive(minX, minY, bounds, tiles);
            badTiles = getBadTiles(bounds, tiles);
            if (badTiles.size() == 0) {
                break;
            }
            var randomTile = 0;
            var randDirec = 0;
            TileInner neighbor;
            do {
                randomTile = getRandomIntInclusive(0, badTiles.size() - 1);
                randDirec = getRandomIntInclusive(0, 3);
                neighbor = getNeighbor(badTiles.get(randomTile), randDirec, tiles);
            }
            while (!neighbor.checked || neighbor.x < minX || neighbor.x > maxX || neighbor.y < minY || neighbor.y > maxY);
            removeWall(badTiles.get(randomTile), randDirec, tiles);
        }
    }

    static void removeWall(TileInner tile, int direction, List<TileInner> tiles) {
        tile.walls[direction] = false;
        getNeighbor(tile, direction, tiles).walls[(direction + 2) % 4] = false;
    }

    static TileInner getNeighbor(TileInner tile, int direction, List<TileInner> tiles) {
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

        return getTile(x, y, tiles);
    }

    static void checkTileRecursive(int x, int y, int[] bounds, List<TileInner> tiles) {
        var tile = getTile(x, y, tiles);
        tile.checked = true;
        if (x != bounds[0] && !tile.walls[1] && !getTile(x - 1, y, tiles).checked) {
            checkTileRecursive(x - 1, y, bounds, tiles);
        }
        if (x != bounds[1] && !tile.walls[3] && !getTile(x + 1, y, tiles).checked) {
            checkTileRecursive(x + 1, y, bounds, tiles);
        }
        if (y != bounds[2] && !tile.walls[0] && !getTile(x, y - 1, tiles).checked) {
            checkTileRecursive(x, y - 1, bounds, tiles);
        }
        if (y != bounds[3] && !tile.walls[2] && !getTile(x, y + 1, tiles).checked) {
            checkTileRecursive(x, y + 1, bounds, tiles);
        }
    }

    private static TileInner getTile(int x, int y, List<TileInner> tiles) {
        for (var i = 0; i < tiles.size(); i++) {
            TileInner tile = tiles.get(i);
            if (tile.x == x && tile.y == y) {
                return tile;
            }
        }

        return null;
    }

    static void resetTileCheck(int[] bounds, List<TileInner> tiles) {
        for (var i = bounds[0]; i <= bounds[1]; i++) {
            for (var j = bounds[2]; j <= bounds[3]; j++) {
                var tile = getTile(i, j, tiles);
                tile.checked = false;
            }
        }
    }

    static List<TileInner> getBadTiles(int[] bounds, List<TileInner> tiles) {
        var badTiles = new ArrayList<TileInner>();

        for (var i = bounds[0]; i <= bounds[1]; i++) {
            for (var j = bounds[2]; j <= bounds[3]; j++) {
                var tile = getTile(i, j, tiles);
                if (!tile.checked) {
                    badTiles.add(tile);
                }
            }
        }

        return badTiles;
    }

    public static int getRandomIntInclusive(int min, int max) {
        return (int) (Math.ceil(Math.random() * (max - min)) + min); //The maximum is
        // inclusive
        // and
        // the minimum is inclusive
    }
}
