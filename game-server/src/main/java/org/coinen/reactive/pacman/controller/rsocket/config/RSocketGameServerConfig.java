package org.coinen.reactive.pacman.controller.rsocket.config;

import io.rsocket.SocketAcceptor;
import io.rsocket.rpc.RSocketRpcService;
import io.rsocket.rpc.rsocket.RequestHandlingRSocket;
import org.coinen.pacman.ExtrasServiceServer;
import org.coinen.pacman.GameServiceServer;
import org.coinen.pacman.PlayerServiceServer;
import org.coinen.reactive.pacman.controller.rsocket.ExtrasController;
import org.coinen.reactive.pacman.controller.rsocket.GameController;
import org.coinen.reactive.pacman.controller.rsocket.PlayerController;
import org.coinen.reactive.pacman.controller.rsocket.SetupController;
import org.coinen.reactive.pacman.service.ExtrasService;
import org.coinen.reactive.pacman.service.GameService;
import org.coinen.reactive.pacman.service.MapService;
import org.coinen.reactive.pacman.service.PlayerService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.messaging.rsocket.annotation.support.RSocketMessageHandler;

import java.util.Optional;

@Configuration
public class RSocketGameServerConfig {

    @Bean
    public ExtrasServiceServer extrasServiceServer(
            ExtrasService extrasService
    ) {
        return new ExtrasServiceServer(new ExtrasController(extrasService), Optional.empty(), Optional.empty(), Optional.empty());
    }

    @Bean
    public GameServiceServer gameServiceServer(
            GameService gameService
    ) {
        return new GameServiceServer(new GameController(gameService), Optional.empty(), Optional.empty(), Optional.empty());
    }

    @Bean
    public PlayerServiceServer playerServiceServer(PlayerService playerService) {
        return new PlayerServiceServer(new PlayerController(playerService), Optional.empty(), Optional.empty(), Optional.empty());
    }

    @Bean
    RSocketMessageHandler messageHandler(SetupController setupController) {
        return new RSocketMessageHandler() {
            @Override
            public SocketAcceptor responder() {
                return setupController;
            }
        };
    }

    @Bean
    public SetupController setupController(
            ObjectProvider<RequestHandlingRSocket> socket,
            MapService mapService,
            PlayerService playerService) {
        return new SetupController(socket::getIfAvailable, mapService, playerService);
    }

    @Bean
    @Scope("prototype")
    public RequestHandlingRSocket requestHandlingRSocket(
            RSocketRpcService[] rSocketRpcServices
    ) {
        return new RequestHandlingRSocket(rSocketRpcServices);
    }
}
