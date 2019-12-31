import { Flux, DirectProcessor } from "reactor-core-js/flux";
import { Single } from "rsocket-flowable";
import { Player, Location, RSocketRPCServices, Point } from "../../game-idl";
import PlayerService from "../PlayerService";
import { ReactiveSocket } from "rsocket-types";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import { Disposable } from "reactor-core-js";
import FlowableAdapter from "../FlowableAdapter";

export default class PlayerServiceClientSharedAdapter implements PlayerService {

    private service: RSocketRPCServices.PlayerService;
    private sharedPlayersStream: DirectProcessor<Player.AsObject>;

    constructor(rSocket: ReactiveSocket<any, any>) {
        this.service = new RSocketRPCServices.PlayerServiceClient(rSocket);
    }

    locate(locationStream: Flux<Location.AsObject>): Single<void> {
        return new Single(subject => {
            let disposable: Disposable = {
                dispose: () => {}
            };

            subject.onSubscribe(() => disposable.dispose());

            disposable = locationStream
                .map(location => {
                    const locationProto = new Location();
                    const positionProto = new Point();

                    positionProto.setX(location.position.x);
                    positionProto.setY(location.position.y);
                    locationProto.setPosition(positionProto);
                    locationProto.setDirection(location.direction);

                    return locationProto;
                })
                .compose(flux => FlowableAdapter.wrap(this.service.locate(flux)))
                .consume(
                    () => {},
                    (e: Error) => subject.onError(e),
                    () => subject.onComplete()
                )
        })
    }

    players(): Flux<Player.AsObject> {
        if (!this.sharedPlayersStream) {
            this.sharedPlayersStream = new DirectProcessor();
            Flux.from<Player>(FlowableAdapter.wrap(this.service.players(new Empty())))
                .map(player => player.toObject())
                .subscribe(this.sharedPlayersStream);
        }

        return this.sharedPlayersStream;
    }
}
