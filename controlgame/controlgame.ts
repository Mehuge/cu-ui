/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../vendor/promise.d.ts" />

module ControlGame {
    var $controlGame = cu.FindElement('#control-game');
    var $gameStatus = cu.FindElement('#game-status');
    var $arthurianScore = cu.FindElement('#arthurian-score');
    var $tddScore = cu.FindElement('#tdd-score');
    var $vikingScore = cu.FindElement('#viking-score');
    var $countdown = cu.FindElement('#countdown');

    var countdownTimer = null;
    var hasRequestInProgress = false;

    enum ControlGameState {
        Inactive = 0,
        Waiting = 1,
        BasicGame = 2,
        AdvancedGame = 3
    }
    
    function getControlGame() {
        return new Promise((resolve, reject) => {
            if (!cu.HasAPI()) reject();

            hasRequestInProgress = true;

            var options: JQueryAjaxSettings = {};
            options.type = 'GET';
            options.url = cu.ApiUrl('game/controlgame');
            options.success = (controlGame) => {
                hasRequestInProgress = false;
                resolve(controlGame);
            };
            options.error = () => {
                hasRequestInProgress = false;
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

    function show(controlGame) {
        $controlGame.fadeIn();

        updateCountdown(controlGame);
    }

    function hide() {
        $controlGame.fadeOut();

        resetCountdownTimer();
    }

    function update() {
        if (hasRequestInProgress) return;

        getControlGame().then(controlGame => {
            if (controlGame && controlGame.gameState !== ControlGameState.Inactive) {
                show(controlGame);
            } else {
                hide();
            }
        }, hide);
    }

    update();
    setInterval(update, 5000);
}