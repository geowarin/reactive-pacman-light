import { Location } from "../game-idl";
import { Flux } from "reactor-core-js/flux";

export default class MyLocationGameService {

    constructor(private locationStream: Flux<Location.AsObject>) { }

    playerLocation(): Flux<Location.AsObject> {
        return this.locationStream;
    }
}
