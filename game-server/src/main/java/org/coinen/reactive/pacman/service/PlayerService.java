package org.coinen.reactive.pacman.service;

import org.coinen.pacman.Location;
import org.coinen.pacman.Player;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PlayerService {

    Mono<Player> createPlayer(String nickname);

    Mono<Void> disconnectPlayer();

    Mono<Void> locate(Flux<Location> locationStream);

    Flux<Player> players();
}
