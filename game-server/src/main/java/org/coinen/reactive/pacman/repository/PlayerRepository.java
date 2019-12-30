package org.coinen.reactive.pacman.repository;

import java.util.Collection;
import java.util.UUID;
import java.util.function.Function;
import java.util.function.Supplier;

import org.coinen.pacman.Player;

public interface PlayerRepository {

    Collection<Player> findAll();

    Player findOne(UUID uuid);

    Player update(UUID uuid, Function<Player, Player> playerUpdater);

    Player save(UUID uuid, Supplier<? extends Player> playerSupplier);

    Player delete(UUID uuid);

    int count();
}
