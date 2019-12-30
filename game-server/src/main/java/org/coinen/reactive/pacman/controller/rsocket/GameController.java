package org.coinen.reactive.pacman.controller.rsocket;

import io.netty.buffer.ByteBuf;
import org.coinen.pacman.Config;
import org.coinen.pacman.Nickname;
import org.coinen.reactive.pacman.service.GameService;
import reactor.core.publisher.Mono;

public class GameController implements org.coinen.pacman.GameService {

    final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @Override
    public Mono<Config> start(Nickname message, ByteBuf metadata) {
        return gameService.start(message);
    }

}
