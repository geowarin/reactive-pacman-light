package org.coinen.reactive.pacman.service.support;

import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

import io.netty.util.concurrent.FastThreadLocal;
import org.coinen.pacman.Direction;
import org.coinen.pacman.Location;
import org.coinen.pacman.Player;
import org.coinen.pacman.Point;
import org.coinen.reactive.pacman.repository.PlayerRepository;
import org.coinen.reactive.pacman.repository.PowerRepository;
import org.coinen.reactive.pacman.service.ExtrasService;
import org.coinen.reactive.pacman.service.MapService;
import org.coinen.reactive.pacman.service.PlayerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.DirectProcessor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.publisher.Mono;
import reactor.util.context.Context;

public class DefaultPlayerService implements PlayerService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultPlayerService.class);

    final DirectProcessor<Player> playersProcessor = DirectProcessor.create();
    final FluxSink<Player>        playersSink      = playersProcessor.sink();

    final PlayerRepository                    playerRepository;
    final PowerRepository                     powerRepository;
    final ExtrasService                       extrasService;
    final MapService                          mapService;
    final FastThreadLocal<Collection<Player>> playersThreadLocal =
        new FastThreadLocal<>() {
            @Override
            protected Collection<Player> initialValue() {
                return playerRepository.findAll();
            }
        };

    public DefaultPlayerService(PlayerRepository playerRepository,
        ExtrasService extrasService,
        MapService mapService,
        PowerRepository powerRepository
    ) {
        this.playerRepository = playerRepository;
        this.extrasService = extrasService;
        this.mapService = mapService;
        this.powerRepository = powerRepository;

        Flux.interval(Duration.ofSeconds(10))
            .doOnNext(this::checkPlayers)
            .subscribe();
    }

    private void checkPlayers(long el) {
        playerRepository.findAll()
            .forEach(p -> {
                if (System.currentTimeMillis() - p.getTimestamp() > 120000) {
                    this.disconnectPlayer()
                        .subscriberContext(Context.of("uuid", UUID.fromString(p.getUuid())))
                        .subscribe();
                }
            });
    }

    @Override
    public Mono<Void> locate(Flux<Location> locationStream) {
        return Mono
            .subscriberContext()
            .map(c -> c.<UUID>get("uuid"))
            .flatMap(uuid -> locationStream
                .doOnNext(location -> {
                    var time = Instant.now();
                    var updatedPlayer = playerRepository.update(uuid, player -> {
                        if (player == null) {
                            return null;
                        }

                        var playerBuilder = player.toBuilder()
                                                  .setTimestamp(time.toEpochMilli())
                                                  .setState(Player.State.ACTIVE)
                                                  .setLocation(location);
                        final var position = location.getPosition();
                        final var isPowerActive = powerRepository.isPowerUp();
                        final var isGhostPlayer = player.getType().equals(Player.Type.GHOST);
                        final var isPacManPlayer = player.getType().equals(Player.Type.PACMAN);
                        final var playerCollection = playersThreadLocal.get();

                        if ((isPowerActive && isGhostPlayer) || (!isPowerActive && isPacManPlayer)) {
                            for (var otherPlayer : playerCollection) {
                                var isActivePlayer = otherPlayer.getState()
                                                                .equals(Player.State.ACTIVE);
                                var areDifferent = !otherPlayer.getType().equals(player.getType());
                                var hasIntersection = distance(
                                    otherPlayer.getLocation()
                                               .getPosition(),
                                    player.getLocation()
                                          .getPosition()
                                ) < 100;

                                if (isActivePlayer && areDifferent && hasIntersection) {
                                    var collidedWithPlayer =
                                        playerRepository.update(
                                            UUID.fromString(otherPlayer.getUuid()),
                                            p -> p.toBuilder()
                                                  .setScore(p.getScore() + 20)
                                                  .build()
                                        );
                                    playerBuilder.setState(Player.State.DISCONNECTED);
                                    playersSink.next(collidedWithPlayer);
                                    break;
                                }
                            }
                        }
                        else {
                            var totalScore = 0;

                            for (var otherPlayer : playerCollection) {
                                var isActivePlayer = otherPlayer.getState()
                                                                .equals(Player.State.ACTIVE);
                                var areDifferent = !otherPlayer.getType().equals(player.getType());
                                var hasIntersection = distance(
                                    otherPlayer.getLocation()
                                               .getPosition(),
                                    player.getLocation()
                                          .getPosition()
                                ) < 100;

                                if (isActivePlayer && areDifferent && hasIntersection) {
                                    var collidedWithPlayer =
                                        playerRepository.update(
                                            UUID.fromString(otherPlayer.getUuid()),
                                            p -> p.toBuilder()
                                                  .setState(Player.State.DISCONNECTED)
                                                  .build()
                                        );
                                    playersSink.next(collidedWithPlayer);
                                    totalScore += 20;
                                }
                            }

                            if (totalScore > 0) {
                                playerBuilder.setScore(player.getScore() + totalScore);
                            }
                        }

                        var isNotKilled =
                            !(playerBuilder.getState() == Player.State.DISCONNECTED);

                        if (isNotKilled && isPacManPlayer) {
                            var hasIntersectionWithExtra =
                                extrasService.check(position.getX(), position.getY()) > 0;

                            if (hasIntersectionWithExtra) {
                                playerBuilder.setScore(player.getScore() + 1);
                            }
                        }

                        return playerBuilder.setTimestamp(Instant.now().toEpochMilli()).build();
                    });


                    if (updatedPlayer == null) {
                        return;
                    }

                    var isKilled = updatedPlayer.getState() == Player.State.DISCONNECTED;

                    if (isKilled) {
                        playerRepository.delete(uuid);
                    }

                    playersSink.next(updatedPlayer);
                })
                .then()
            );
    }

    @Override
    public Flux<Player> players() {
        return playersProcessor;
    }

    @Override
    public Mono<Player> createPlayer(String nickname) {
        return Mono
            .subscriberContext()
            .map(c -> c.<UUID>get("uuid"))
            .map((uuid) -> playerRepository.save(uuid, () -> {
                var score = 0;
                var playerType = generatePlayerType();
                var playerPosition = findBestStartingPosition(playerType);
                var player = Player.newBuilder()
                        .setLocation(Location.newBuilder()
                                .setDirection(Direction.RIGHT)
                                .setPosition(playerPosition.toBuilder()
                                        .setX(playerPosition.getX() * 100)
                                        .setY(playerPosition.getY() * 100)))
                        .setNickname(nickname)
                        .setState(Player.State.CONNECTED)
                        .setScore(score)
                        .setType(playerType)
                        .setUuid(uuid.toString())
                        .setTimestamp(Instant.now().toEpochMilli())
                        .build();

                playersSink.next(player);

                return player;
            }));
    }

    @Override
    public Mono<Void> disconnectPlayer() {
        return Mono.subscriberContext()
                   .map(c -> c.<UUID>get("uuid"))
                   .doOnNext(uuid -> {
                       LOGGER.info("Disconnecting Player: {}", uuid);
                       Player player = playerRepository.delete(uuid);
                       if (player != null) {
                           playersSink.next(player.toBuilder()
                                                  .setState(Player.State.DISCONNECTED)
                                                  .build());
                       }
                   })
                   .then();
    }

    private Player.Type generatePlayerType() {
        var manCount = 0;
        var ghostCount = 0;
        var players = playerRepository.findAll();

        for (Player player : players) {

            if (player.getType() == Player.Type.PACMAN) {
                manCount++;
            }
            else if (player.getType() == Player.Type.GHOST) {
                ghostCount++;
            }
        }

        if (ghostCount < manCount) {
            return Player.Type.GHOST;
        }
        else {
            return Player.Type.PACMAN;
        }
    }

    private Point findBestStartingPosition(Player.Type playerType) {

        var players = playerRepository.findAll()
            .stream()
            .filter(p -> p.getType() != playerType)
            .collect(Collectors.toList());

        while(true) {
            var point = mapService.getRandomPoint();
            if (players.size() == 0) {
                return point;
            }
            for (Player player : players) {
                if (playerType != player.getType()) {
                    var dist = distance(player.getLocation()
                        .getPosition(), point);
                    if (dist > 5) {
                        return point;
                    }
                }
            }
        }
    }

    private float distance(Point p1, Point p2) {
        var d1 = p1.getX() - p2.getX();
        var d2 = p1.getY() - p2.getY();
        return d1 * d1 + d2 * d2;
    }
}
