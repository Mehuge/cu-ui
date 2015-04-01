/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../vendor/promise.d.ts" />

module ControlGame {
    var $controlGame = cu.FindElement('#control-game');
    var $totalPlayersCount = cu.FindElement('#total-players-count');
    var $gameStatus = cu.FindElement('#game-status');
    var $countdown = cu.FindElement('#countdown');
    var $tddPlayersCount = $('#tdd-players-count');
    var $tddPlayersLabel = $('#tdd-players-label');
    var $arthurianPlayersCount = $('#arthurian-players-count');
    var $arthurianPlayersLabel = $('#arthurian-players-label');
    var $vikingPlayersCount = $('#viking-players-count');
    var $vikingPlayersLabel = $('#viking-players-label');
    var $arthurianScore = cu.FindElement('#arthurian-score');
    var $tddScore = cu.FindElement('#tdd-score');
    var $vikingScore = cu.FindElement('#viking-score');

    var countdownTimer = null;
    var hasControlGameRequestInProgress = false;
    var hasPlayersRequestInProgress = false;

    enum ControlGameState {
        Inactive = 0,
        Waiting = 1,
        BasicGame = 2,
        AdvancedGame = 3
    }

    function getPlayers() {
        return new Promise((resolve, reject) => {
            if (!cu.HasAPI()) return reject();

            if (hasPlayersRequestInProgress) return reject();

            hasPlayersRequestInProgress = true;

            var options: JQueryAjaxSettings = {};
            options.type = 'GET';
            options.url = cuAPI.serverURL + 'game/players';
            options.success = (players) => {
                hasPlayersRequestInProgress = false;
                resolve(players);
            };
            options.error = () => {
                hasPlayersRequestInProgress = false;
                reject();
            };

            $.ajax(options);
        });
    }
    
    function getControlGame() {
        return new Promise((resolve, reject) => {
            if (!cu.HasAPI()) return reject();

            if (hasControlGameRequestInProgress) return reject();

            hasControlGameRequestInProgress = true;

            var options: JQueryAjaxSettings = {};
            options.type = 'GET';
            options.url = cuAPI.serverURL + 'game/controlgame';
            options.success = (controlGame) => {
                hasControlGameRequestInProgress = false;
                resolve(controlGame);
            };
            options.error = () => {
                hasControlGameRequestInProgress = false;
                reject();
            };

            $.ajax(options);
        });
    }

    function getFutureDate(seconds) {
        var date = new Date();
        date.setSeconds(date.getSeconds() + seconds);
        return date;
    }

    function getSecondsRemaining(date) {
        return (date - +(new Date())) / 1000;
    }

    function getTimeRemaining(secondsRemaining) {
        if (!secondsRemaining || secondsRemaining < 0) return '0:00';
        var minutes = Math.floor(secondsRemaining / 60);
        var seconds = Math.round(secondsRemaining % 60);
        return minutes + ':' + (seconds < 10 ? '0' + seconds : '' + seconds);
    }

    function updateSecondsRemaining(controlGame, gameOver) {
        var secondsRemaining = getSecondsRemaining(gameOver);

        if (secondsRemaining < 0) {
            secondsRemaining = 0;

            resetCountdownTimer();
        }

        updateView(controlGame, secondsRemaining);
    }

    function resetCountdownTimer() {
        clearInterval(countdownTimer);

        countdownTimer = null;
    }

    function updateCountdown(controlGame) {
        resetCountdownTimer();

        var gameOver = getFutureDate(controlGame.timeLeft);

        updateSecondsRemaining(controlGame, gameOver);
        countdownTimer = setInterval(() => {
            updateSecondsRemaining(controlGame, gameOver);
        }, 1000);
    }

    function getStatusText(gameState) {
        switch (gameState) {
            case ControlGameState.Waiting:
                return 'Waiting For Round To Begin...';
            case ControlGameState.BasicGame:
            case ControlGameState.AdvancedGame:
                return 'Round In Progress';
        }
        return '';
    }

    function updateView(controlGame, secondsRemaining) {
        $gameStatus.text(getStatusText(controlGame.gameState));
        $arthurianScore.text(controlGame.arthurianScore);
        $tddScore.text(controlGame.tuathaDeDanannScore);
        $vikingScore.text(controlGame.vikingScore);
        $countdown.text(getTimeRemaining(secondsRemaining));
    }

    function updatePlayers(players) {
        var total = players.arthurians + players.tuathaDeDanann + players.vikings;

        $totalPlayersCount.text(total);

        $tddPlayersCount.text(players.tuathaDeDanann);
        $tddPlayersLabel.text(players.tuathaDeDanann === 1 ? 'player' : 'players');

        $arthurianPlayersCount.text(players.arthurians);
        $arthurianPlayersLabel.text(players.arthurians === 1 ? 'player' : 'players');

        $vikingPlayersCount.text(players.vikings);
        $vikingPlayersLabel.text(players.vikings === 1 ? 'player' : 'players');
    }

    function show(controlGame) {
        $controlGame.fadeIn();

        updateCountdown(controlGame);
    }

    function hide() {
        $controlGame.fadeOut();

        resetCountdownTimer();
    }

    function update() {
        getControlGame().then(controlGame => {
            if (controlGame && controlGame.gameState > ControlGameState.Inactive) {
                show(controlGame);
            } else {
                hide();
            }
        });

        getPlayers().then(players => {
            updatePlayers(players);
        });
    }

    cu.OnServerConnected(() => {
        update();
        setInterval(update, 5000);
    });
}