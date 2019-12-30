package org.coinen.reactive.pacman.controller.rsocket;

import com.google.protobuf.Empty;
import io.netty.buffer.ByteBuf;
import org.coinen.pacman.Location;
import org.coinen.pacman.Player;
import org.coinen.reactive.pacman.service.PlayerService;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class PlayerController implements org.coinen.pacman.PlayerService {

    final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @Override
    public Mono<Empty> locate(Publisher<Location> messages, ByteBuf metadata) {
        return playerService.locate(Flux.from(messages))
            .thenReturn(Empty.getDefaultInstance());
    }

    @Override
    public Flux<Player> players(Empty message, ByteBuf metadata) {
        return playerService.players();
    }
}
