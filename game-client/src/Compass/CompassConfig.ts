import { GameConfig, GameState, MyLocationGameService } from "../Game";
import PlayerService from "../api/PlayerService";

export default interface CompassConfig {
    readonly config: GameConfig;
    readonly state: GameState;
    readonly playerService: PlayerService;
    readonly locationService: MyLocationGameService;
}