package org.coinen.reactive.pacman.controller.rsocket;

import io.rsocket.ConnectionSetupPayload;
import io.rsocket.RSocket;
import io.rsocket.SocketAcceptor;
import io.rsocket.rpc.rsocket.RequestHandlingRSocket;
import org.coinen.pacman.MapServiceClient;
import org.coinen.reactive.pacman.controller.rsocket.support.UuidAwareRSocket;
import org.coinen.reactive.pacman.service.MapService;
import org.coinen.reactive.pacman.service.PlayerService;
import reactor.core.publisher.Mono;
import reactor.util.context.Context;

import java.time.Clock;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;

public class SetupController implements SocketAcceptor {

    final Supplier<RequestHandlingRSocket> serverRSocketSupplier;
    final MapService mapService;
    final PlayerService playerService;

    public SetupController(Supplier<RequestHandlingRSocket> requestHandlingRSocketSupplier,
                           MapService service,
                           PlayerService playerService) {
        serverRSocketSupplier = requestHandlingRSocketSupplier;
        mapService = service;
        this.playerService = playerService;
    }

    @Override
    public Mono<RSocket> accept(ConnectionSetupPayload setup, RSocket sendingSocket) {
        final UUID uuid = new UUID(Clock.systemUTC().millis(), ThreadLocalRandom.current().nextLong());

        sendingSocket.onClose()
                .onErrorResume(e -> Mono.empty())
                .then(playerService.disconnectPlayer())
                .subscriberContext(Context.of("uuid", uuid))
                .subscribe();

        return Mono.<RSocket>just(new UuidAwareRSocket(serverRSocketSupplier.get(), uuid))
                .mergeWith(new MapServiceClient(sendingSocket).setup(mapService.getMap())
                        .then(Mono.empty()))
                .subscriberContext(Context.of("uuid", uuid))
                .singleOrEmpty();
    }
}
