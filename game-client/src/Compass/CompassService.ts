import PlayerService from "../api/PlayerService";
import {GameState, MyLocationGameService} from "../Game";
import {Player, Location, Point} from "../game-idl";
import {Disposable} from "reactor-core-js";

export default class CompassService implements Disposable {

    private rotationToClosest: number;
    private playerServiceDisposable: Disposable;
    private localGameServiceDisposable: Disposable;

    private closestPlayerUuid: string;
    private readonly playersLocation: { [name: string]: Location.AsObject };
    private myLocation: Location.AsObject;

    constructor(
        private playerService: PlayerService,
        private gameService: MyLocationGameService,
        private state: GameState
    ) {
        this.playerServiceDisposable = playerService.players()
            .consume(player => this.doOnPlayerLocation(player));
        this.localGameServiceDisposable = gameService.playerLocation()
            .consume(location => this.doOnMyLocation(location));
        this.playersLocation = Object.keys(this.state.players)
            .map(uuid => this.state.players[uuid])
            .filter(p => p.type === Player.Type.PACMAN)
            .reduce<{ [name: string]: Location.AsObject }>((pv, cv) => (pv[cv.uuid] = cv.location) && pv, {});

        this.doOnMyLocation(state.player.location)
    }

    get rotation(): number {
        return this.rotationToClosest;
    }

    dispose(): void {
        this.playerServiceDisposable.dispose();
        this.localGameServiceDisposable.dispose();
    }

    private doOnPlayerLocation(player: Player.AsObject): void {
        try {
            const {location, type, uuid, state} = player;

            if (type === Player.Type.PACMAN && state !== Player.State.DISCONNECTED) {
                this.playersLocation[uuid] = location;

                if (this.closestPlayerUuid) {
                    const playerDistance = this.distanceTo(location.position,
                        this.myLocation.position);
                    const closestDistance = this.distanceTo(this.myLocation.position,
                        this.playersLocation[this.closestPlayerUuid].position);

                    if (closestDistance > playerDistance) {
                        this.closestPlayerUuid = uuid;
                        this.rotationToClosest = this.rotationTo(this.myLocation.position, location.position);

                        return;
                    }
                }

                this.doOnMyLocation(this.myLocation);
            }
            else if (state === Player.State.DISCONNECTED) {
                delete this.playersLocation[uuid];

                if (uuid === this.closestPlayerUuid) {
                    delete this.closestPlayerUuid;
                    delete this.rotationToClosest;

                    this.doOnMyLocation(this.myLocation);
                }
            }
        } catch(e) {
            // delete this.closestPlayerUuid;
            console.error(e);
        }
    }

    private doOnMyLocation(location: Location.AsObject) {
        try {
            let closestLocation;
            let closestPlayerUuid;
            let closestDistance = Number.MAX_SAFE_INTEGER;

            if (!Object.keys(this.playersLocation).length) {
                return;
            }

            if (this.closestPlayerUuid) {
                closestLocation = this.playersLocation[this.closestPlayerUuid];
                closestDistance = this.distanceTo(this.myLocation.position, closestLocation.position);

                /**
                 * This check whether closestLocation became even more closer.
                 * In case it becomes closer, than we don't have to recalculate all distance
                 * and assume that current closest player is the closest one still
                 */
                if (closestDistance > this.distanceTo(location.position, closestLocation.position)) {
                    this.myLocation = location;
                    this.rotationToClosest = this.rotationTo(location.position, closestLocation.position);
                    return;
                }
            }

            for (const uuid in this.playersLocation) {
                const playerLocation = this.playersLocation[uuid];
                const playerDistance = this.distanceTo(location.position, playerLocation.position);

                if (closestDistance >= playerDistance) {
                    closestLocation = playerLocation;
                    closestDistance = playerDistance;
                    closestPlayerUuid = uuid;
                }
            }

            this.rotationToClosest = this.rotationTo(location.position, closestLocation.position);
            this.closestPlayerUuid = closestPlayerUuid;
            this.myLocation = location;
        } catch(e) {
            console.error(e);
        }
    }

    private distanceTo(p1: Point.AsObject, p2: Point.AsObject): number {
        const width = p1.x - p2.x;
        const height = p1.y - p2.y;

        return width * width + height * height;
    }

    private rotationTo(p1: Point.AsObject, p2: Point.AsObject) {
        const width = p1.x - p2.x;
        const height = p1.y - p2.y;

        return Math.atan2(height, width);
    }


}
