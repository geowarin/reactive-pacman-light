package org.coinen.reactive.pacman.controller.rsocket.support;

import java.util.UUID;

import io.rsocket.Payload;
import io.rsocket.RSocket;
import io.rsocket.ResponderRSocket;
import io.rsocket.util.RSocketProxy;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.context.Context;

public class UuidAwareRSocket extends RSocketProxy implements ResponderRSocket {

    private final UUID uuid;

    public UuidAwareRSocket(RSocket source, UUID uuid) {
        super(source);
        this.uuid = uuid;
    }

    @Override
    public Mono<Void> fireAndForget(Payload payload) {
        return super.fireAndForget(payload).subscriberContext(Context.of("uuid", uuid));
    }

    @Override
    public Mono<Payload> requestResponse(Payload payload) {
        return super.requestResponse(payload).subscriberContext(Context.of("uuid", uuid));
    }

    @Override
    public Flux<Payload> requestStream(Payload payload) {
        return super.requestStream(payload).subscriberContext(Context.of("uuid", uuid));
    }

    @Override
    public Flux<Payload> requestChannel(Publisher<Payload> payloads) {
        return super.requestChannel(payloads).subscriberContext(Context.of("uuid", uuid));
    }

    @Override
    public Mono<Void> metadataPush(Payload payload) {
        return super.metadataPush(payload).subscriberContext(Context.of("uuid", uuid));
    }

    @Override
    public Flux<Payload> requestChannel(Payload payload, Publisher<Payload> payloads) {
        if (source instanceof ResponderRSocket) {
            return ((ResponderRSocket) source).requestChannel(payload, payloads)
                                              .subscriberContext(Context.of("uuid", uuid));
        } else {
            return requestChannel(
                Flux.from(payloads)
                    .skip(1)
                    .startWith(payload)
            );
        }
    }
}
