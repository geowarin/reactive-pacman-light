package org.coinen.reactive.pacman.controller.rsocket;

import com.google.protobuf.Empty;
import io.netty.buffer.ByteBuf;
import org.coinen.pacman.Extra;
import org.coinen.reactive.pacman.service.ExtrasService;
import reactor.core.publisher.Flux;

public class ExtrasController implements org.coinen.pacman.ExtrasService {
    final ExtrasService extrasService;

    public ExtrasController(ExtrasService service) {
        extrasService = service;
    }

    @Override
    public Flux<Extra> extras(Empty message, ByteBuf metadata) {
        return extrasService.extras();
    }
}
