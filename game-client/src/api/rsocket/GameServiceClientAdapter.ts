import GameService from "../GameService";
import { Nickname, Config, RSocketRPCServices } from "./../../game-idl";
import { ReactiveSocket } from "rsocket-types";
import { Single } from "rsocket-flowable";

export default class GameServiceClientAdapter implements GameService {

    private service: RSocketRPCServices.GameService;

    constructor(rSocket: ReactiveSocket<any, any>) {
        this.service = new RSocketRPCServices.GameServiceClient(rSocket);
    }

    start({ value }: Nickname.AsObject): Single<Config.AsObject> {
        const nicknameProto = new Nickname();

        nicknameProto.setValue(value);

        return this.service.start(nicknameProto)
            .map((c: Config) => c.toObject());
    }
}
