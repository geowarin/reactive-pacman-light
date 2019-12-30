package org.coinen.reactive.pacman.service;

import java.util.List;

import org.coinen.pacman.Map;
import org.coinen.pacman.Point;

public interface MapService {

    Map getMap();

    List<Point> getTilesPositions();

    Point getRandomPoint();
}
