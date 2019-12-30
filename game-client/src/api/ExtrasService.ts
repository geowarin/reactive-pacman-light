import { Flux } from "reactor-core-js/flux";
import { Extra } from "../game-idl/index";

export default interface ExtrasService {

    extras(): Flux<Extra.AsObject>;
}
