import { Config, Nickname } from "../game-idl";
import { Single } from "rsocket-flowable";


export default interface GameService {

    start(nickname: Nickname.AsObject): Single<Config.AsObject>
}
