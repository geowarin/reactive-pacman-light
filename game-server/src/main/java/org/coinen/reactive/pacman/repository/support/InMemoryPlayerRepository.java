package org.coinen.reactive.pacman.repository.support;

import java.util.Collection;
import java.util.UUID;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Function;
import java.util.function.Supplier;

import org.coinen.pacman.Player;
import org.coinen.reactive.pacman.repository.PlayerRepository;
import org.jctools.maps.NonBlockingHashMap;

public class InMemoryPlayerRepository implements PlayerRepository {

    final ConcurrentMap<UUID, Player> store = new NonBlockingHashMap<>();

    @Override
    public Collection<Player> findAll() {
        return store.values();
    }

    @Override
    public Player findOne(UUID uuid) {
        return store.get(uuid);
    }

    @Override
    public Player update(UUID uuid, Function<Player, Player> playerUpdater) {
        return store.compute(uuid, (__, player) -> playerUpdater.apply(player));
    }

    @Override
    public Player save(UUID uuid, Supplier<? extends Player> playerSupplier) {
        return store.computeIfAbsent(uuid, __ -> playerSupplier.get());
    }

    @Override
    public Player delete(UUID uuid) {
        return store.remove(uuid);
    }

    @Override
    public int count() {
        return store.size();
    }
}
