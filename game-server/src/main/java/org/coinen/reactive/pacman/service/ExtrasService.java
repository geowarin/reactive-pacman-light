package org.coinen.reactive.pacman.service;

import org.coinen.pacman.Extra;
import reactor.core.publisher.Flux;

public interface ExtrasService {

    Flux<Extra> extras();

    int check(float x, float y);
}
