/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="3dcarousel.d.ts" />

module Login {
    /* Both Character Selection and Character Creation Variables */

    var loginToken = null;

    var $modalWrapper = $('#modal-wrapper');
    var $modal = $('#modal');
    var $characters = $('#characters');

    /* Background swapping variables */
    var $bgLayer1 = $('#background-layer1');
    var $bgLayer2 = $('#background-layer2');
    var $currentBg = null;

    /* Server Selection Variables */

    var servers = [
        { name: 'localhost', host: 'localhost', isOnline: true, playerCounts: { arthurians: 0, tuathaDeDanann: 0, vikings: 0, total: 0 } }
    ];

    var selectedServer = null;

    var serverTimeouts = [];

    var $serversModalContainer = null;

    var serverCharacterRequests = {};

    /* Character Selection Variables */

    var $characterSelection = $('#character-selection');
    var $previousButton = $('#btn-previous');
    var $nextButton = $('#btn-next');
    var $serversButton = $('#btn-servers');
    var $deleteButton = $('#btn-delete');
    var $createNewButton = $('#btn-create-new');
    var $startButton = $('#btn-start');
    var $selectedCharacter = null;
    var carousel: Carousel;

    /* Character Creation Variables */

    var $characterCreation = $('#character-creation');
    var $characterCreationRealms = $('#character-creation-realms');
    var $arthuriansButton = $('#btn-arthurians');
    var $tddButton = $('#btn-tdd');
    var $vikingsButton = $('#btn-vikings');
    var $characterCreationRaces = $('.character-creation-race');
    var $characterCreationBottom = $('#character-creation-bottom');
    var $backButton = $('#btn-back');
    var $characterName = $('#character-name');
    var $createButton = $('#btn-create');

    var realms = ['TDD', 'Viking', 'Arthurian'];

    var selectedRealm = null;
    var selectedRace = null;

    var serverRacesRequest = null;

    /* Both Character Selection and Character Creation Events */

    $modalWrapper.click(() => {
        if (!$('#server-select').is(':visible')) {
            hideModal();
        }
    });

    $modal.click(() => { return false; });

    /* Character Selection Events */

    $serversButton.click(showServerSelection);

    $deleteButton.click(() => {
        var deleteModal = createDeleteModal();

        if (!deleteModal) return;

        showModal(deleteModal);
    });

    $createNewButton.click(showCharacterCreationPage);

    $startButton.click(() => {
        var character = {
            id: $selectedCharacter.data('character-id'),
            name: $selectedCharacter.data('character-name')
        };
        $characterSelection.fadeOut(() => connect(character));
    });

    /* Character Creation Events */

    $arthuriansButton.click(() => selectRealm(realms[2], false));

    $tddButton.click(() => selectRealm(realms[0], false));

    $vikingsButton.click(() => selectRealm(realms[1], false));

    $characterCreationRaces.click(selectRace);

    $backButton.click(() => {
        selectedRealm = null;

        $characterCreation.fadeOut(() => {
            if ($characters.children().length) {
                showCharacterSelect();
            } else {
                showServerSelection();
            }
        });
    });

    $characterName.click(function() { $(this).select(); } );

    $characterName.bind('propertychange keyup input paste', function() {
        var name = $(this).val();

        $createButton.prop('disabled', name.length < 1 || name.length > 32);
    });

    $createButton.click(createCharacter);

    /* Both Character Selection and Character Creation Functions */

    function initialize() {
        // Required for cross-site ajax to work on IE
        $.support.cors = true;

        var loginInterval = setInterval(() => {
            loginToken = cu.HasAPI() ? cuAPI.loginToken : window.prompt('loginToken:','');

            if (!loginToken) return;

            clearInterval(loginInterval);

            showServerSelection();

            getServers();
        }, 100);
    }

    function getServers() {
        var channelID = cu.HasAPI() ? cuAPI.patchResourceChannel : 4;
        $.ajax({
            type: 'GET',
            url: 'http://api.citystateentertainment.com:8001/api/servers',
            data: { channelID: channelID },
            timeout: 6000
        }).done((data) => {
            servers = data;

            updateServerSelection();
        }).fail(getServers);
    }

    function hideModal(callback?) {
        $modal.animate({ 'margin-top': '-80px', 'opacity': 0 }, 200);

        if (_.isFunction(callback)) {
            $modalWrapper.fadeOut(300, callback);
        } else {
            $modalWrapper.fadeOut(300);
        }
    }

    function showModal(modalContent) {
        $modal.empty().append(modalContent);

        $modalWrapper.css('display', 'none');

        $modal.css({ 'margin-top': '-80px', 'opacity': 0 });

        $modalWrapper.fadeIn(200);

        $modal.animate({ 'margin-top': '-165px', 'opacity': 1 }, 300);
    }

    function connect(character) {
        if (_.isUndefined(selectedServer) || !_.isString(selectedServer.host)) {
            showModal(createErrorModal('No server selected.'));
        } else if (_.isUndefined(character) || !_.isString(character.id)) {
            showModal(createErrorModal('No character selected.'));
        } else {
            if (cu.HasAPI()) {
                cuAPI.Connect(selectedServer.host, character.id);
            } else {
                showModal(createErrorModal('Connected to: ' + selectedServer.host + ' - character: ' + character.id));
            }
        }
    }

    function getSelectedServerApiUrl() {
        return getServerApiUrl(selectedServer);
    }

    function getSecureSelectedServerApiUrl() {
        return getSecureServerApiUrl(selectedServer);
    }

    function getServerApiUrl(server) {
        return 'http://' + server.host + ':8000/api';
    }

    function getSecureServerApiUrl(server) {
        if (server.host === 'localhost') return getServerApiUrl(server);
        return 'https://' + server.host + ':4443/api';
    }

    /* Server Selection Functions */

    function showServerSelection() {
        selectedServer = null;

        // updateBackground(''); // cause the default bg to load

        $characterSelection.fadeOut(() => {
            if (!$serversModalContainer) {
                $serversModalContainer = createServersModal();
            } else {
                updateServerSelection();
            }

            showModal($serversModalContainer);
        });
    }

    function updateServerSelection() {
        var $tbody = $serversModalContainer['$content']['$table']['$tbody'];

        $tbody.empty();

        servers.forEach((server) => {
            var row = createServerModalRow(server);

            row.$row.appendTo($tbody);

            updateServerEntry(server, row);
        });
    }

    function createServersModal() {
        var $container = $('<div class="modal-container"></div>');

        var $content = $container['$content'] = $('<div class="modal-content"></div>').appendTo($container);

        var $table = $content['$table'] = $('<table id="server-select"></table>').appendTo($content);

        $('<thead><tr>' +
            '<th class="title">Choose your server</th>' +
            '<th class="arthurians">Arthurians</th>' +
            '<th class="tdd">Tuatha</th>' +
            '<th class="vikings">Vikings</th>' +
            '<th class="online">Online</th>' +
            '</tr></thead>').appendTo($table);

        var $tbody = $table['$tbody'] = $('<tbody></tbody>').appendTo($table);

        $table['$tfoot'] = $('<tfoot></tfoot>').appendTo($table);

        servers.forEach((server) => {
            createServerModalRow(server).$row.appendTo($tbody);
        });

        return $container;
    }

    function createServerModalRow(server) {
        var $row = $('<tr></tr>');

        $row[0].onclick = () => trySelectServer(server);

        if (!server.isOnline) {
            $row.addClass('offline');
        }

        $('<td class="name">' + _.escape(server.name) + '</td>').appendTo($row);

        var $arthurians = $('<td class="arthurians">?</td>').appendTo($row);
        var $tdd = $('<td class="tdd">?</td>').appendTo($row);
        var $vikings = $('<td class="vikings">?</td>').appendTo($row);
        var $total = $('<td class="online">?</td>').appendTo($row);

        if (server.playerCounts) {
            $arthurians.text(server.playerCounts.arthurians);
            $tdd.text(server.playerCounts.tuathaDeDanann);
            $vikings.text(server.playerCounts.vikings);
            $total.text(server.playerCounts.total);
        }

        return { $row: $row, $arthurians: $arthurians, $tdd: $tdd, $vikings: $vikings, $total: $total };
    }

    function updateServerEntry(server, row) {
        var start = new Date();

        var delay = 5000;

        $.ajax({
            type: 'GET',
            url: getServerApiUrl(server) + '/game/players',
            timeout: delay
        }).done((data) => {
            server.isOnline = true;

            server.playerCounts = data;
            server.playerCounts.total = (data.arthurians || 0) + (data.tuathaDeDanann || 0) + (data.vikings || 0);

            row.$row.removeClass('offline');
            row.$arthurians.text(server.playerCounts.arthurians);
            row.$tdd.text(server.playerCounts.tuathaDeDanann);
            row.$vikings.text(server.playerCounts.vikings);
            row.$total.text(server.playerCounts.total);

            if (!selectedServer) {
                var elapsed = new Date().getTime() - start.getTime();

                serverTimeouts.push(setTimeout(() => updateServerEntry(server, row), delay - elapsed));
            }
        }).fail(() => {
            server.isOnline = false;

            row.$row.addClass('offline');
            row.$arthurians.text('?');
            row.$tdd.text('?');
            row.$vikings.text('?');
            row.$total.text('?');

            if (!selectedServer) {
                var elapsed = new Date().getTime() - start.getTime();

                serverTimeouts.push(setTimeout(() => updateServerEntry(server, row), delay - elapsed));
            }
        });
    }

    function trySelectServer(server) {
        if (!server.isOnline) {
            return;
        }

        var request = serverCharacterRequests[server.host];

        if (!request) {
            var $tfoot = $serversModalContainer['$content']['$table']['$tfoot'];

            $tfoot.empty();

            var $row = $('<tr></tr>').appendTo($tfoot);

            var text = 'Loading..';

            var $td = $('<td colspan="5"></td>').text(text).appendTo($row);

            var attempts = 0;

            var loadingInterval = setInterval(() => {
                request = serverCharacterRequests[server.host];

                if (request && request.readyState === 4) {
                } else if (++attempts > 50) {
                    clearInterval(loadingInterval);
                } else {
                    text += '.';

                    $td.text(text);
                }
            }, 1000);

            var delay = 10000;

            serverCharacterRequests[server.host] = $.ajax({
                type: 'GET',
                url: getSecureServerApiUrl(server) + '/characters?loginToken=' + loginToken,
                timeout: delay
            }).done((data) => {
                server.characters = data;

                serverCharacterRequests[server.host] = null;

                clearInterval(loadingInterval);

                $row.remove();

                selectServer(server);
            }).fail(() => {
                serverCharacterRequests[server.host] = null;

                clearInterval(loadingInterval);

                $td.text('Failed to load characters. Please try again.');
            });
        }
    }

    function selectServer(server) {
        serverTimeouts.forEach(timeout => clearTimeout(timeout));
        serverTimeouts = [];

        selectedServer = servers.filter((s) => {
            return s.name === server.name;
        })[0];

        if (_.isUndefined(selectedServer)) {
            return;
        }

        hideModal(() => {
            if (selectedServer.characters && selectedServer.characters.length) {
                showCharacterSelect();
            } else {
                showCharacterCreationPage();
            }
        });
    }

    /* Character Selection Functions */

    function showCharacterCreationPage() {
        getRaces();

        $characterCreationRaces.hide();

        $characterCreationBottom.hide();

        $characterSelection.fadeOut(() => {
            $characterCreation.fadeIn();

            $characterCreationRealms.animate({ 'top': '40%' });
        });
    }

    function showCharacterSelect() {
        $characters.empty();

        $selectedCharacter = null;
        var $carousel: JQuery = $('#carousel');

        selectedServer.characters.forEach((character, index) => {
            var raceCssClass;

            try {
                raceCssClass = getRaceCssClass(character.race);
            } catch (ex) {
                alert(ex);
            }

            if (typeof raceCssClass == 'undefined') {
                raceCssClass = getRaceCssClass('Tuatha');
            }

            var $character: JQuery = $('<figure>').addClass('character').attr({
                'data-character-id': character.id,
                'data-character-name': _.escape(character.name),
                'data-character-realm': character.race.faction.name
            }).addClass(raceCssClass).css('background', getRaceBackgroundStyle(raceCssClass))
                .appendTo($carousel);

            var $name = $('<span>').addClass('character-name').text(character.name).appendTo($character);

            if (character.race.description && character.race.description.length && character.race.description !== character.race.name) {
                $name.css('bottom', '32px');
                $('<div>').addClass('character-description').text(character.race.description).appendTo($character);
            } else {
                $name.css('bottom', '8px');
            }

            if (index === 0) {
                $selectedCharacter = $character;
            }
        });

        if (selectedServer.characters.length > 1) {
            $previousButton.fadeIn();
            $nextButton.fadeIn();
        }

        carousel = $carousel.carousel3d({
            spread: 0.75, next: $nextButton, prev: $previousButton,
            onselected: function ($el) {
                $selectedCharacter = $el;
            }
        });

        $characterSelection.fadeIn();
    }

    function findRaceCssClass(raceValue) {
        var race = selectedServer.races.filter(r => r.value === raceValue)[0];
        if (!race) {
            throw new Error('Race ' + raceValue + ' does not exist');
        }
        return getRaceCssClass(race);
    }

    function getRaceCssClass(race) {
        return 'char-' + race.name.toLowerCase();
    }

    function getRaceBackgroundStyle(raceFilePath) {
        return 'url("../images/login/' + raceFilePath + '.jpg") no-repeat center center';
    }

    function createDeleteModal(): JQuery {
        var name = $selectedCharacter.data('character-name');

        var id = $selectedCharacter.data('character-id');

        var $container = $('<div class="modal-container"></div>');

        var $content = $('<div class="modal-content"></div>').appendTo($container);

        $('<h3>Are you sure you want to delete</h3>').appendTo($content);

        $('<h1 class="delete-modal-character-name">' + _.escape(name) + '</h1>').appendTo($content);

        var $buttons = $('<div class="modal-buttons"></div>').appendTo($container);

        var $yesButton = $('<button class="btn-normal btn-yes">Yes</button>').appendTo($buttons);

        $yesButton.click(() => {
            var selectedCharacter = {
                loginToken: loginToken,
                id: id
            };

            var options: JQueryAjaxSettings = {};
            options.url = getSecureSelectedServerApiUrl() + '/characters';
            options.type = 'DELETE';
            options.contentType = 'application/json; charset=utf-8';
            options.data = JSON.stringify(selectedCharacter);
            options.success = () => {
                hideModal();

                selectedServer.characters.splice($selectedCharacter.index(), 1);

                $selectedCharacter.remove();
                $selectedCharacter = null;

                if (selectedServer.characters.length) {
                    var charactersCount = $characters.children().length;

                    if (charactersCount <= 1) {
                        $previousButton.fadeOut();
                        $nextButton.fadeOut();
                    }

                    $nextButton.click();
                } else {
                    showCharacterCreationPage();
                }
            };
            options.error = (xhr, status, error) => {
                hideModal(() => showModal(createErrorModal(error)));
            };
            $.ajax(options);
        });

        var $noButton = $('<button class="btn-normal btn-no">No</button>').appendTo($buttons);

        $noButton.click(hideModal);

        return $container;
    }

    /* Character Creation Functions */

    function getRaces(callback?) {
        if (serverRacesRequest) {
            serverRacesRequest.abort();
        }

        var delay = 5000;

        serverRacesRequest = $.ajax({
            type: 'GET',
            url: getServerApiUrl(selectedServer) + '/game/races',
            timeout: delay
        }).done((data) => {
            selectedServer.races = data;

            serverRacesRequest = null;

            if (callback && _.isFunction(callback)) {
                callback();
            }
        }).fail(getRaces);
    }

    /*
    function updateBackground(selectedRealm) {
        var imgName = 'bg.jpg';

        if (realms[0] == selectedRealm) {
            imgName = 'bg-tdd.jpg';
        } else if (realms[1] == selectedRealm) {
            imgName = 'bg-viking.jpg';
        } else if (realms[2] == selectedRealm) {
            imgName = 'bg-arthurian.jpg';
        }

        var newBg = $bgLayer2;
        var currentBg = $bgLayer1;

        if ($bgLayer2 == $currentBg) {
            newBg = $bgLayer1;
            currentBg = $bgLayer2;
        }

        currentBg.css('z-index', -99);
        newBg.css('z-index', -100);

        newBg.css('background-image', 'url(../images/login/' + imgName + ')');
        newBg.show();

        currentBg.fadeOut();

        $currentBg = newBg;
    }
    */

    function selectRealm(realm, isForced) {
        if (selectedRealm === realm && !isForced) return;

        selectedRealm = realm;

        // updateBackground(selectedRealm);

        selectedRace = null;

        $arthuriansButton.toggleClass('active', realm === realms[2]);
        $tddButton.toggleClass('active', realm === realms[0]);
        $vikingsButton.toggleClass('active', realm === realms[1]);

        $characterCreationBottom.fadeOut();

        if (!selectedServer.races) {
            getRaces(() => selectRealm(realm, true));
            return;
        }

        $characterCreationRealms.animate({ 'top': '0%' }, () => {
            $characterCreationRaces.fadeOut().promise().done(() => {
                var allRaceCssClasses = selectedServer.races.map(r => getRaceCssClass(r)).join(' ');

                $characterCreationRaces.removeClass('selected ' + allRaceCssClasses);

                var racesCount = 0;

                selectedServer.races.forEach(race => {
                    if (race.faction.name === realm) {
                        var raceCssClass = getRaceCssClass(race);

                        var $race = $($characterCreationRaces[racesCount++]).css('background', getRaceBackgroundStyle(raceCssClass));

                        $race.data('race', race.value).addClass(raceCssClass);

                        try {
                            var raceName = race.name.replace(/([a-z])([A-Z])/g, '$1 $2');

                            var $name = $('<span>').addClass('character-name').text(raceName).appendTo($race.empty());

                            if (race.description && race.description.length && race.description !== race.name) {
                                $name.css('bottom', '32px');

                                $('<div>').addClass('character-description').text(race.description).appendTo($race);
                            } else {
                                $name.css('bottom', '8px');
                            }
                        } catch (e) {
                            alert(e);
                        }

                        $race.fadeIn().css('display', 'inline-block');
                    }
                });

                for (var i = racesCount, length = $characterCreationRaces.length; i < length; i++) {
                    $($characterCreationRaces[i]).empty().data('race', '').css('background', '').fadeIn().css('display', 'inline-block');
                }
            });
        });
    }

    function selectRace() {
        var $this = $(this);

        var race = $this.data('race');

        if (!_.isNumber(race)) return;

        selectedRace = race;

        $characterCreationRaces.removeClass('selected');

        $characterCreationRaces.each((i, element) => {
            var $race = $(element);

            var raceValue = $race.data('race');

            if (raceValue) {
                var raceCssClass = findRaceCssClass(raceValue);

                $race.css('background', getRaceBackgroundStyle(raceCssClass));
            }
        });

        $this.css('background', getRaceBackgroundStyle(findRaceCssClass(race) + '-select')).addClass('selected');

        $characterCreationBottom.fadeIn();
    }

    function createCharacter() {
        $createButton.prop('disabled', true).addClass('waiting');

        var character = {
            loginToken: loginToken,
            name: $characterName.val().trim(),
            faction: selectedRealm,
            race: selectedRace
        };

        var options: JQueryAjaxSettings = {};
        options.url = getSecureSelectedServerApiUrl() + '/characters';
        options.type = 'POST';
        options.contentType = 'application/json; charset=utf-8';
        options.data = JSON.stringify(character);
        options.success = result => {
            $createButton.prop('disabled', false).removeClass('waiting');

            if (result && result.result === 0 && result.status === 'Success' && result.character && result.character.id) {
                $characterCreation.fadeOut().promise().done(() => {
                    connect(result.character);
                });
            } else {
                showModal(createErrorModal('An unknown error occurred.'));
            }
        };
        options.error = (xhr, status, error) => {
            $createButton.prop('disabled', false).removeClass('waiting');

            showModal(createErrorModal(error));
        };
        $.ajax(options);
    }

    function createErrorModal(error) {
        if (!error || !error.length) {
            error = 'An unknown error occurred.';
        }

        var $container = $('<div class="modal-container"></div>');

        var $content = $('<div class="modal-content"></div>').appendTo($container);

        $('<h2 class="modal-error">' + _.escape(error) + '</h2>').appendTo($content);

        var $buttons = $('<div class="modal-buttons"></div>').appendTo($container);

        var $okButton = $('<button class="btn-normal btn-ok">OK</button>').appendTo($buttons);

        $okButton.click(hideModal);

        return $container;
    }

    if (typeof cuAPI !== 'undefined') {
        cuAPI.OnInitialized(initialize);
    } else {
        $(initialize);
    }
}