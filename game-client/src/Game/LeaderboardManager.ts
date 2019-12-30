import PlayerService from "../api/PlayerService";
import GameConfig from "./GameConfig";
import { GameState } from ".";
import { Player, Score } from "../game-idl/index";
import { Disposable } from "reactor-core-js";
import SceneSupport from "../Commons/SceneSupport";

export default class LeaderboardManager implements SceneSupport {

    private playerServiceDisposable: Disposable;
    private leaderboard: Map<String, Score.AsObject>;
    private readonly overlay: JQuery<HTMLElement>;

    constructor(
        private scene: Phaser.Scene, private state: GameState, private config: GameConfig,
        private playerService: PlayerService
    ) {
        this.leaderboard = new Map();
        const players = Object.keys(state.players);
        players.forEach(uuid => {
            const player = state.players[uuid];
            this.leaderboard.set(player.uuid, {
                score: player.score,
                uuid: player.uuid,
                username: player.nickname
            });
        });
        this.leaderboard.set(state.player.uuid, {
            score: state.player.score,
            uuid: state.player.uuid,
            username: state.player.nickname
        });
        this.overlay = $("#phaser-overlay");
        this.playerServiceDisposable = playerService.players()
            .consume(player => this.doOnPlayerScore(player));
        this.overlay.find(".leaderboard").show();
    }

    doOnPlayerScore(player: Player.AsObject): void {
        const { uuid, state, score, nickname } = player;

        if (state !== Player.State.DISCONNECTED) {
            this.leaderboard.set(uuid, {
                score: score, username: nickname || 'Incognito', uuid
            });
        } else {
            this.leaderboard.delete(uuid);
        }
    }

    update() {
        var overlay = this.overlay;
        var leaderboard = overlay.find(".leaderboard").find('ol');
        leaderboard.empty();
        const lines = [];
        for (let key of this.leaderboard.keys()) {
            let data = this.leaderboard.get(key);
            lines.push(data);
        }
        lines.sort((a, b) => a.score < b.score ? 1 : -1);
        lines.forEach(line => {
            var elem = $("<li></li>");
            elem.text(line.username + " - " + line.score);
            elem.appendTo(leaderboard);
        })
    }

    dispose(): void {
        this.playerServiceDisposable.dispose();
    }

}
