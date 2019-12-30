package org.coinen.reactive.pacman.service.support;

import org.coinen.pacman.Extra;
import org.coinen.reactive.pacman.repository.ExtrasRepository;
import org.coinen.reactive.pacman.repository.PlayerRepository;
import org.coinen.reactive.pacman.repository.PowerRepository;
import org.coinen.reactive.pacman.service.ExtrasService;
import reactor.core.publisher.DirectProcessor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

public class DefaultExtrasService implements ExtrasService {
    final ExtrasRepository extrasRepository;
    final PlayerRepository playerRepository;
    final PowerRepository powerRepository;
    final DirectProcessor<Extra> extrasProcessor = DirectProcessor.create();
    final FluxSink<Extra> extrasFluxSink = extrasProcessor.sink();


    public DefaultExtrasService(
        ExtrasRepository extrasRepository,
        PlayerRepository playerRepository,
        PowerRepository powerRepository
    ) {
        this.extrasRepository = extrasRepository;
        this.playerRepository = playerRepository;
        this.powerRepository = powerRepository;
    }

    @Override
    public Flux<Extra> extras() {
        return extrasProcessor;
    }

    @Override
    public int check(float x, float y) {
        var retainedExtra = extrasRepository.collideExtra(x, y);

        if (retainedExtra != 0) {
            if (Math.signum(retainedExtra) == -1.0f) {
                powerRepository.powerUp();
            }

            var addedExtra = extrasRepository.createExtra(playerRepository.count());

            var extra = Extra.newBuilder()
                             .setLast(retainedExtra)
                             .setCurrent(addedExtra)
                             .build();

            extrasFluxSink.next(extra);

            return retainedExtra;
        }

        return 0;
    }
}
