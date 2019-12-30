import { Player, Tile } from "../game-idl";

export default class GameState {
    tiles: Tile.AsObject[];

    powerState: number;
    player: Player.AsObject;
    players: { [key: string]: Player.AsObject };
}
