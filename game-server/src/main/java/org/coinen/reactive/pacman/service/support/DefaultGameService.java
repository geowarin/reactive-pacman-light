package org.coinen.reactive.pacman.service.support;

import java.util.stream.Collectors;

import org.coinen.pacman.Config;
import org.coinen.pacman.Nickname;
import org.coinen.pacman.Score;
import org.coinen.reactive.pacman.repository.ExtrasRepository;
import org.coinen.reactive.pacman.repository.PlayerRepository;
import org.coinen.reactive.pacman.service.GameService;
import org.coinen.reactive.pacman.service.MapService;
import org.coinen.reactive.pacman.service.PlayerService;
import reactor.core.publisher.Mono;

public class DefaultGameService implements GameService {

    final PlayerService    playerService;
    final ExtrasRepository extrasRepository;
    final MapService       mapService;
    final PlayerRepository playerRepository;

    public DefaultGameService(PlayerService playerService,
        ExtrasRepository extrasRepository,
        PlayerRepository repository,
        MapService service) {
        this.playerService = playerService;
        this.extrasRepository = extrasRepository;
        this.playerRepository = repository;
        this.mapService = service;
    }

    @Override
    public Mono<Config> start(Nickname nickname) {

        if (nickname.getValue()
                    .length() <= 13) {
            var name = nickname.getValue()
                               .replaceAll("/[^a-zA-Z0-9. ]/g", "");
            if (name.isBlank()) {
                name = "Unnamed";
            }

            return playerService
                .createPlayer(name)
                .map(player -> Config.newBuilder()
                                     .setPlayer(player)
                                     .addAllPlayers(
                                         playerRepository.findAll()
                                                         .stream()
                                                         .filter(p -> !p.getUuid()
                                                                       .equals(player.getUuid()))
                                                         .collect(Collectors.toList()))
                                     .addAllExtras(extrasRepository.finaAll())
                                     .addAllScores(
                                         playerRepository.findAll()
                                                         .stream()
                                                         .map(p -> Score.newBuilder()
                                                                             .setUsername(p.getNickname())
                                                                             .setScore(p.getScore())
                                                                             .setUuid(p.getUuid())
                                                                             .build())
                                                         .collect(Collectors.toList())

                                     )
                                     .build());
        }

        return Mono.error(new IllegalArgumentException("Illegal player name"));
    }
}
