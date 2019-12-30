package org.coinen.reactive.pacman.repository.support;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;

import org.coinen.reactive.pacman.repository.PowerRepository;
import reactor.core.publisher.Mono;

public class InMemoryPowerRepository implements PowerRepository {
    volatile int powerUpCounter;
    final static AtomicIntegerFieldUpdater<InMemoryPowerRepository> POWER_UP_COUNTER =
        AtomicIntegerFieldUpdater.newUpdater(InMemoryPowerRepository.class, "powerUpCounter");

    @Override
    public boolean isPowerUp() {
        return powerUpCounter > 0;
    }

    @Override
    public void powerUp() {
        POWER_UP_COUNTER.incrementAndGet(this);
        Mono.delay(Duration.ofSeconds(10))
            .subscribe(__ -> POWER_UP_COUNTER.decrementAndGet(this));
    }
}
