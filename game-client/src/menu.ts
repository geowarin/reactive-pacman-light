import { Scene } from 'phaser';
import { Config } from './game-idl';

import GameService from './api/GameService';

export default class Menu extends Scene {
    nickname: string;
    config: any;
    gameService: GameService;

    constructor() {
        super('Menu');
    }

    closeAvgrund(){
        $(".avgrund-popup").hide();
        // $('body').removeClass("avgrund-active");
        // $('body').removeClass("avgrund-overlay");
    }

    init(config: any) {
        this.nickname = localStorage.getItem("nickname");
        this.config = config;
        this.gameService = config.gameService;
    }

    create(config: any) {

        //var template = "";
        //var height = 730;
        if (config && config.type == "error") {
            // template = `<h3>${config.title}</h3>
            // <p>${config.text}</p>`;
            // height = 130;
            $('#phaser-overlay-container').show();
            $('#phaser-overlay-container #phaser-overlay').children().hide();
            var loginError = $(".avgrund-popup.login-error");
            loginError.show();
            loginError.find("h3").text(config.title);
            loginError.find("p").text(config.text);
        }
        else {
            $("#phaser-container").css("background-color", "#116");
            $('#phaser-overlay-container').show();
            $('#phaser-overlay-container').css("pointer-events", "auto");
            $('#phaser-overlay-container #phaser-overlay').children().hide();
            $(".main").show();

            if (localStorage.getItem("input-mode") == "quadrants") {
                $("#radio .toggle-right").prop( "checked", true );
            }

            let value = "";
            if (this.nickname != "" && this.nickname !== undefined && this.nickname !== null) {
                //value = "value='" + this.nickname + "'";
                value = this.nickname;
            }
            $(".avgrund-popup.login input[type='text']").val(value);

            setTimeout(function() {
                $("#nickname").focus();
            }, 500);

            $(".avgrund-popup input[type='submit']").on("click", this.startGame.bind(this));

            $(document).on("keypress", (event) => {
                if (event.which == 13) {
                    this.startGame();
                }
            });
        }
    }

    startGame() {
        var quadrantMode = true;
        if ($("#radio .toggle-right").prop( "checked")) {
            localStorage.setItem("input-mode", "quadrants");
        }
        else {
            localStorage.setItem("input-mode", "swipe");
            quadrantMode = false;
        }

        $(".avgrund-popup input[type='submit']").off("click");
        $(document).off("keypress");
        this.nickname = $(".avgrund-popup input[type='text']").val() as string;
        //$(".avgrund-popup").remove();
        this.closeAvgrund();

        // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        //     $("#to-scroll").show();
        //     $("body").height($(window).height() + 1000);
        //     // $("body").css("overflow", "scroll");
        //     // $('#phaser-overlay').css("position", "relative");
        //     $('#phaser-overlay-container').hide();
        //     $(window).scrollTop(0);
        //     $(window).on("scroll", (e) => {
        //         if (window.scrollY > 500) {
        //             $("#canvas-container").css("position", "absolute");
        //             $(window).off("scroll");
        //             $('#phaser-overlay-container').show();
        //             // $('#phaser-overlay').css("position", "fixed");
        //             $("html").css("overflow", "none");
        //             $("body").css("overflow", "none");
        //             $("body").height("100%");
        //             $("#canvas-container").show();

        //             $("#to-scroll").remove();

        //             this.gameService.start({value: this.nickname})
        //                 .then((config: Config.AsObject) => {
        //                     this.scene.start('Game', {
        //                         ...this.config,
        //                         player: config.player,
        //                         players: config.playersList,
        //                         extras: config.extrasList,
        //                     });
        //                 })
        //         }
        //     });
        // } else {
            $("#canvas-container").show();
            this.gameService.start({value: this.nickname})
                .then((config: Config.AsObject) => {
                    localStorage.setItem("nickname", this.nickname);
                    this.scene.start('Game', {
                        ...this.config,
                        player: config.player,
                        players: config.playersList,
                        extras: config.extrasList,
                    });
            });
        // }
    }
}

/*
x - loading circle
text below players
notifications
better maze generation?
*/
