/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/numeral.d.ts" />
/// <reference path="../vendor/jquery.d.ts" />

module Login {
    document.oncontextmenu = () => false;

    /* Both Character Selection and Character Creation Variables */

    var loginToken = null;
    var queuedModals = [];
    var isConnecting = false;

    var $modalWrapper = $('#modal-wrapper');
    var $modal = $('#modal');
    var $bgDefault = $('#bg-default');
    var $characters: JQuery = $('#characters-container'),
        $portraits: JQuery = $('#characters-portrait');
    var $bgLoading = $('#bg-loading');

    /* Server Selection Variables */

    // Keep in sync with /api/servers access levels
    enum AccessLevel {
        Invalid = -1,
        Public = 0,
        Beta3 = 1,
        Beta2 = 2,
        Beta1 = 3,
        Alpha = 4,
        IT = 5, // called InternalTest on /api/servers
        Devs = 6, // called Employees on /api/servers
    }

    var servers = [
        { name: 'localhost', host: 'localhost', isOnline: true, playerCounts: { arthurians: 0, tuathaDeDanann: 0, vikings: 0, total: 0 } }
    ];

    var selectedServer = null;

    var serverTimeouts = [];

    var $serversModalContainer = null;

    var serverCharacterRequests = {};

    /* Character Selection Variables */

    var $characterSelection = $('#character-selection');
    var $characterCreation = $('#character-creation');
    var $previousCharacterButton = $('#btn-previous-character');
    var $nextCharacterButton = $('#btn-next-character');
    var $serversButton = $('#btn-servers');
    var $deleteButton = $('#btn-delete');
    var $createNewButton = $('#btn-create-new');
    var $startButton = $('#btn-start');
    var $selectedCharacter = null;

    /* Both Character Selection and Character Creation Events */

    $modalWrapper.click(() => {
        if (!$('#server-select').is(':visible')) {
            hideModal();
        }
    });

    $modal.click(() => { return false; });

    /* Character Selection Events */

    $previousCharacterButton.click(() => selectCharacter(getPreviousCharacter()));

    $nextCharacterButton.click(() => selectCharacter(getNextCharacter()));

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
        $characterSelection.fadeOut(() => beginConnect(character));
    });

    /* Both Character Selection and Character Creation Functions */

    function initialize() {
        // Required for cross-site ajax to work on IE
        $.support.cors = true;

        var loginInterval = setInterval(() => {
            loginToken = cu.HasAPI() ? cuAPI.loginToken : window.prompt('login token?');

            if (!loginToken) return;

            clearInterval(loginInterval);

            showServerSelection();

            getServers();
        }, 100);
    }

    function getServers() {
        resetServerTimeouts();

        $.ajax({
            type: 'GET',
            url: 'http://api.citystateentertainment.com:8001/api/servers',
            data: { channelID: cu.HasAPI() ? cuAPI.patchResourceChannel : 4 },
            timeout: 1000 * 6
        }).done((data) => {
            servers = data;

            updateServerSelection();
        }).fail(getServers);

        setTimeout(getServers, 1000 * 60);
    }

    function hideModal(callback?) {
        $modal.animate({ 'margin-top': '-80px', 'opacity': 0 }, 200);

        if (_.isFunction(callback)) {
            $modalWrapper.fadeOut(300, callback);
        } else {
            $modalWrapper.fadeOut(300);
        }

        var modal = queuedModals.pop();

        if (modal) showModal(modal);
    }

    function showModal(modalContent) {
        $modal.empty().append(modalContent);

        $modalWrapper.css('display', 'none');

        $modal.css({ 'margin-top': '-80px', 'opacity': 0 });

        $modalWrapper.fadeIn(200);

        $modal.animate({ 'margin-top': '-165px', 'opacity': 1 }, 300);
    }

    function queueShowModal(modalContent) {
        if ($modalWrapper.css('display') == 'none') {
            showModal(modalContent);
        } else {
            queuedModals.push(modalContent);
        }
    }

    function beginConnect(character) {
        var options: JQueryAjaxSettings = {};
        options.url = getSecureSelectedServerApiUrl() + '/proxies';
        options.type = 'GET';
        options.contentType = 'application/json; charset=utf-8';
        options.success = result => {
            if (result && result.address && result.port) {
                finishConnect(result.address, result.port.toString(), character);
            } else {
                showModal(createErrorModal('Invalid or missing proxy'));
            }
        };
        options.error = (xhr, status, err) => {
            showModal(createErrorModal(err));
        };
        $.ajax(options);
    }

    function finishConnect(host, port, character) {
        isConnecting = true;

        if (!_.isString(host)) {
            showModal(createErrorModal('Invalid server host requested.'));
        } else if (!_.isString(port)) {
            showModal(createErrorModal('Invalid server port requested.'));
        } else if (_.isUndefined(character) || !_.isString(character.id)) {
            showModal(createErrorModal('No character selected.'));
        } else if (cu.HasAPI()) {
            cuAPI.Connect(host, port, character.id, selectedServer.host);
        } else {
            showModal(createErrorModal('Connected to: ' + host + ':' + port + ' - character: ' + character.id));
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

        if (servers) {
            servers.forEach((server) => {
                var row = createServerModalRow(server);

                row.$row.appendTo($tbody);

                updateServerEntry(server, row);
            });
        }
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

        var name;
        if (_.isNumber(server.accessLevel) && server.accessLevel >= AccessLevel.Public) {
            name = _.escape(server.name + ' - ' + AccessLevel[server.accessLevel]);
        } else {
            name = _.escape(server.name);
        }

        $('<td class="name">' + name + '</td>').appendTo($row);

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
        if (!server.isOnline) return;

        var request = tryFetchCharacters(server);

        if (!request) return;

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

        request.done(() => {
            clearInterval(loadingInterval);

            $row.remove();

            selectServer(server);
        }).fail(() => {
            clearInterval(loadingInterval);

            $td.text('Failed to load characters. Please try again.');
        });
    }

    function tryFetchCharacters(server): any {
        if (!server || !server.host || !loginToken) return false;

        var request = serverCharacterRequests[server.host];

        if (request) return false;

        return serverCharacterRequests[server.host] = $.ajax({
            type: 'GET',
            url: getSecureServerApiUrl(server) + '/characters?loginToken=' + loginToken,
            timeout: 10000
        }).done((data) => {
            server.characters = data;

            server.characters.sort((a, b) => {
                var aLastLogin = new Date(a.lastLogin);
                var bLastLogin = new Date(b.lastLogin);
                return (+bLastLogin) - (+aLastLogin);
            });

            serverCharacterRequests[server.host] = null;
        }).fail(() => {
            serverCharacterRequests[server.host] = null;
        });
    }

    function resetServerTimeouts() {
        serverTimeouts.forEach(timeout => clearTimeout(timeout));
        serverTimeouts = [];
    }

    function selectServer(server) {
        resetServerTimeouts();

        selectedServer = servers.filter((s) => {
            return s.name === server.name;
        })[0];

        if (_.isUndefined(selectedServer)) {
            return;
        }

        hasInitializedCharacterCreation = false;

        hideModal(showCharacterSelectionOrCreation);
    }

    function showCharacterSelectionOrCreation() {
        if (selectedServer && selectedServer.characters && selectedServer.characters.length) {
            showCharacterSelect();
        } else {
            showCharacterCreationPage();
        }
    }

    /* Character Selection Functions */

    function showCharacterCreationPage() {
        initializeCharacterCreation();

        $characterSelection.fadeOut();

        var loading = setInterval(() => {
            var hasLoaded = hasAllSuccessfulResponses();
            if (hasLoaded) {
                clearInterval(loading);
                loading = null;

                $characterCreation.fadeIn();

                resetChosenFaction();

                showChooseFactionPage();
            } else {
                showBackground($bgLoading);
            }
        }, 100);
    }

    function showCharacterSelect() {
        $characters.empty();

        $selectedCharacter = null;

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

            var $character: JQuery = $('<li>').addClass('character').attr({
                'data-character-id': character.id,
                'data-character-name': _.escape(character.name),
                'data-character-race': character.race.name
            }).addClass(raceCssClass).appendTo($characters);

            var $name = $('<span>').addClass('character-name').text(character.name).appendTo($character);
            $('<div>').addClass('character-description').text(character.race.name).appendTo($character);

            var $portrait: JQuery = $('<li>').addClass('portrait')
                .addClass(raceCssClass)
                .css('background', getRaceBackgroundStyle(raceCssClass))
                .appendTo($portraits);

            if (index === 0) {
                setSelectedCharacter(index);
            }
        });

        $characters.children().on('click', (e: JQueryEventObject) => {
            setSelectedCharacter($(e.currentTarget).index());
        });

        $characterSelection.fadeIn();
    }

    function setSelectedCharacter(index: number) {
        if ($selectedCharacter) {
            var old = $selectedCharacter.index();
            $portraits.children().eq(old).fadeOut();
            $characters.children().removeClass('selected');
        }
        $characters.children().eq(index).addClass('selected');
        $portraits.children().eq(index).fadeIn();
        $selectedCharacter = $characters.children().eq(index);
    }

    function getRaceCssClass(race) {
        return 'char-' + race.name.toLowerCase();
    }

    function getRaceBackgroundStyle(raceFilePath) {
        return 'url(../images/login/' + raceFilePath + '.jpg) no-repeat center center';
    }

    function selectCharacter($nextSelectedCharacter) {
        if (!$nextSelectedCharacter.length) {
            $selectedCharacter.fadeIn();
        } else {
            $selectedCharacter.fadeOut(() => {
                $selectedCharacter = $nextSelectedCharacter.fadeIn();
            });
        }
    }

    function getPreviousCharacter() {
        var $previous = $selectedCharacter.prev();
        if (!$previous.length) {
            $previous = $selectedCharacter.siblings().last();
        }
        return $previous;
    }

    function getNextCharacter() {
        var $next = $selectedCharacter.next();
        if (!$next.length) {
            $next = $selectedCharacter.siblings().first();
        }
        return $next;
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

                var $previous = getPreviousCharacter();

                selectedServer.characters.splice($selectedCharacter.index(), 1);

                $selectedCharacter.remove();

                $selectedCharacter = $previous;

                if ($previous.length) {
                    var charactersCount = $characters.children().length;

                    if (charactersCount <= 1) {
                        $previousCharacterButton.fadeOut();
                        $nextCharacterButton.fadeOut();
                    }

                    $nextCharacterButton.click();
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

    /* Character Creation */

    /* Enumerations */

    enum Page {
        Faction = 1,
        RaceArchetype = 2,
        Attributes = 3,
        BoonsBanes = 4
    };

    enum Faction {
        Factionless = 0,
        Arthurians = 3,
        TDD = 1,
        Vikings = 2
    };

    enum Category {
        General = 0,
        Faction = 1,
        Race = 2,
        Archetype = 3
    };

    enum RequestState {
        None,
        InProgress,
        Succeeded,
        Failed
    };
    
    /* Constants */

    var ANIMATION_DURATION = 400;

    var REQUIRED_CHOSEN_ATTRIBUTES = 20;

    var MINIMUM_CHOSEN_BOONS = 5;
    var MAXIMUM_CHOSEN_BOONS = 20;

    var BOON_BANE_OFFSET_X = 40;
    var BOON_BANE_OFFSET_Y = 40;

    var NAME_MIN_LENGTH = 2;
    var NAME_MAX_LENGTH = 25;

    var REQUEST_RETRY_DELAY = 5000;

    /* Variables */

    var currentPage = Page.Faction;

    var chosenFactionId;
    var chosenFaction;
    var chosenName;
    var chosenRace;
    var chosenArchetype;
    var chosenAttributes;
    var chosenBoonsGeneral;
    var chosenBoonsFaction;
    var chosenBoonsRace;
    var chosenBoonsArchetype;
    var chosenBanesGeneral;
    var chosenBanesFaction;
    var chosenBanesRace;
    var chosenBanesArchetype;

    var factionArthurians = {};
    var factionTdd = {};
    var factionVikings = {};
    var attributes = { primary: [], secondary: [], derived: [] };

    var boonsGeneral = [];
    var boonsFaction = [];
    var boonsRace = [];
    var boonsArchetype = [];
    var banesGeneral = [];
    var banesFaction = [];
    var banesRace = [];
    var banesArchetype = [];

    var hasInitializedCharacterCreation = false;
    var chooseFactionTimeout: number = null;
    var getFactionsState = RequestState.None;
    var getAttributesState = RequestState.None;
    var getBoonsState = RequestState.None;
    var getBanesState = RequestState.None;

    /* jQuery Elements */

    var $bgFactions = $('#bg-factions');
    var $bgArthurians = $('#bg-arthurians');
    var $bgTdd = $('#bg-tdd');
    var $bgVikings = $('#bg-vikings');

    var $chooseFaction = $('#choose-faction');
    var $shieldArthurians = $('#shield-arthurians');
    var $shieldTdd = $('#shield-tdd');
    var $shieldVikings = $('#shield-vikings');
    var $descriptionArthurians = $('#description-arthurians');
    var $descriptionTdd = $('#description-tdd');
    var $descriptionVikings = $('#description-vikings');

    var $characterFaction = $('#character-faction');
    var $characterRace = $('#character-race');
    var $characterParchment = $('#character-parchment');
    var $characterName = $('#character-name');
    var $characterTitle = $('#character-title');
    var $characterSummary = $('#character-summary');
    var $summaryPrimaryAttributes = $('#summary-primary-attributes', $characterSummary);
    var $summarySecondaryAttributes = $('#summary-secondary-attributes', $characterSummary);
    var $summaryDerivedAttributes = $('#summary-derived-attributes', $characterSummary);
    var $summaryBoons = $('#summary-boons', $characterSummary);
    var $summaryBanes = $('#summary-banes', $characterSummary);

    var $characterRaceArchetype = $('#character-race-archetype');
    var $chooseRace = $('#choose-race', $characterRaceArchetype);
    var $chooseArchetype = $('#choose-archetype', $characterRaceArchetype);
    var $chosenArchetypeAbilities = $('#chosen-archetype-abilities', $characterRaceArchetype).hide();
    var $races = $('#races', $chooseRace);
    var $archetypes = $('#archetypes', $chooseArchetype);
    var $abilities = $('#abilities', $chosenArchetypeAbilities).hide();

    var $characterAttributes = $('#character-attributes');
    var $chooseAttributes = $('#choose-attributes', $characterAttributes);
    var $attributes = $('#attributes', $chooseAttributes);

    var $characterBoonsBanes = $('#character-boons-banes');
    var $boonsBanesFrame = $('#boons-banes-frame', $characterBoonsBanes);
    var $boonsBanesBars = $('#boons-banes-bars', $boonsBanesFrame);
    var $boonsBar = $('#boons-bar', $boonsBanesFrame);
    var $banesBar = $('#banes-bar', $boonsBanesFrame);
    var $boonsCount = $('#boons-count', $boonsBanesFrame);
    var $banesCount = $('#banes-count', $boonsBanesFrame);
    var $chooseBoonsAndBanes = $('#choose-boons-and-banes', $characterBoonsBanes);
    var $boonsGeneralContainer = $('#boons-general-container', $chooseBoonsAndBanes);
    var $boonsGeneralCount = $('#boons-general-count', $boonsGeneralContainer);
    var $boonsGeneral = $('#boons-general', $boonsGeneralContainer);
    var $boonsFactionContainer = $('#boons-faction-container', $chooseBoonsAndBanes);
    var $boonsFactionCount = $('#boons-faction-count', $boonsFactionContainer);
    var $boonsFaction = $('#boons-faction', $boonsFactionContainer);
    var $boonsRaceContainer = $('#boons-race-container', $chooseBoonsAndBanes);
    var $boonsRaceCount = $('#boons-race-count', $boonsRaceContainer);
    var $boonsRace = $('#boons-race', $boonsRaceContainer);
    var $boonsArchetypeContainer = $('#boons-archetype-container', $chooseBoonsAndBanes);
    var $boonsArchetypeCount = $('#boons-archetype-count', $boonsArchetypeContainer);
    var $boonsArchetype = $('#boons-archetype', $boonsArchetypeContainer);
    var $banesGeneralContainer = $('#banes-general-container', $chooseBoonsAndBanes);
    var $banesGeneralCount = $('#banes-general-count', $banesGeneralContainer);
    var $banesGeneral = $('#banes-general', $banesGeneralContainer);
    var $banesFactionContainer = $('#banes-faction-container', $chooseBoonsAndBanes);
    var $banesFactionCount = $('#banes-faction-count', $banesFactionContainer);
    var $banesFaction = $('#banes-faction', $banesFactionContainer);
    var $banesRaceContainer = $('#banes-race-container', $chooseBoonsAndBanes);
    var $banesRaceCount = $('#banes-race-count', $banesRaceContainer);
    var $banesRace = $('#banes-race', $banesRaceContainer);
    var $banesArchetypeContainer = $('#banes-archetype-container', $chooseBoonsAndBanes);
    var $banesArchetypeCount = $('#banes-archetype-count', $banesArchetypeContainer);
    var $banesArchetype = $('#banes-archetype', $banesArchetypeContainer);

    var $characterTopFrame = $('#character-top-frame');
    var $topFrameTitle = $('#top-frame-title', $characterTopFrame);
    var $topFrameButtons = $('#top-frame-buttons', $characterTopFrame);
    var $topFramePoints = $('#top-frame-points', $characterTopFrame);
    var $btnRaceArchetypePage = $('#btn-race-archetype-page', $topFrameButtons);
    var $btnAttributesPage = $('#btn-attributes-page', $topFrameButtons);
    var $btnBoonsBanesPage = $('#btn-boons-banes-page', $topFrameButtons);

    var $btnReset = $('#btn-reset');
    var $characterNext = $('#character-next');
    var $btnNext = $('#btn-next', $characterNext);
    var $characterComplete = $('#character-complete');
    var $btnComplete = $('#btn-complete', $characterComplete);
    var $btnBack = $('#btn-back');
    var $btnBackLabel = $('#btn-back-label', $btnBack);

    /* Functions */

    function getFactions() {
        getFactionsState = RequestState.InProgress;

        var start = new Date();

        return $.ajax({
            type: 'GET',
            url: getSelectedServerApiUrl() + '/game/factions'
        }).done((factions) => {
            getFactionsState = RequestState.Succeeded;

            factions.forEach(faction => {
                switch (faction.name) {
                    case 'Arthurian':
                        factionArthurians = faction;
                        break;
                    case 'TDD':
                        factionTdd = faction;
                        break;
                    case 'Viking':
                        factionVikings = faction;
                        break;
                }
            });
        }).fail((xhr) => {
            getFactionsState = RequestState.Failed;

            queueShowModal(createErrorModal('Error Fetching Factions: ' + xhr.status + ' ' + xhr.statusText));

            setTimeout(getFactions, REQUEST_RETRY_DELAY - (new Date().getTime() - start.getTime()));
        });
    }

    function getAttributes() {
        getAttributesState = RequestState.InProgress;

        var start = new Date();

        return $.ajax({
            type: 'GET',
            url: getSelectedServerApiUrl() + '/game/attributes'
        }).done((attrs) => {
            getAttributesState = RequestState.Succeeded;

            attributes = attrs;
        }).fail((xhr) => {
            getAttributesState = RequestState.Failed;

            queueShowModal(createErrorModal('Error Fetching Attributes: ' + xhr.status + ' ' + xhr.statusText));

            setTimeout(getAttributes, REQUEST_RETRY_DELAY - (new Date().getTime() - start.getTime()));
        });
    }

    function getBoons() {
        getBoonsState = RequestState.InProgress;

        var start = new Date();

        return $.ajax({
            type: 'GET',
            url: getSelectedServerApiUrl() + '/game/boons'
        }).done((boons) => {
            getBoonsState = RequestState.Succeeded;

            boons.forEach((boon) => {
                if (!boon.category) boon.category = Category.General;

                switch (boon.category) {
                    case Category.General:
                        boonsGeneral.push(boon);
                        break;
                    case Category.Faction:
                        boonsFaction.push(boon);
                        break;
                    case Category.Race:
                        boonsRace.push(boon);
                        break;
                    case Category.Archetype:
                        boonsArchetype.push(boon);
                        break;
                }
            });
        }).fail((xhr) => {
            getBoonsState = RequestState.Failed;

            queueShowModal(createErrorModal('Error Fetching Boons: ' + xhr.status + ' ' + xhr.statusText));

            setTimeout(getBoons, REQUEST_RETRY_DELAY - (new Date().getTime() - start.getTime()));
        });
    }

    function getBanes() {
        getBanesState = RequestState.InProgress;
        
        var start = new Date();

        return $.ajax({
            type: 'GET',
            url: getSelectedServerApiUrl() + '/game/banes'
        }).done((banes) => {
            getBanesState = RequestState.Succeeded;

            banes.forEach((bane) => {
                if (!bane.category) bane.category = Category.General;

                switch (bane.category) {
                    case Category.General:
                        banesGeneral.push(bane);
                        break;
                    case Category.Faction:
                        banesFaction.push(bane);
                        break;
                    case Category.Race:
                        banesRace.push(bane);
                        break;
                    case Category.Archetype:
                        banesArchetype.push(bane);
                        break;
                }
            });
        }).fail((xhr) => {
            getBanesState = RequestState.Failed;

            queueShowModal(createErrorModal('Error Fetching Banes: ' + xhr.status + ' ' + xhr.statusText));

            setTimeout(getBanes, REQUEST_RETRY_DELAY - (new Date().getTime() - start.getTime()));
        });
    }

    function getValidationErrors() {
        var errors = [];
        var hasRaceArchetypePageActive = isRaceArchetypePageActive();
        var hasAttributesPageActive = isAttributesPageActive();
        var hasBoonsBanesPageActive = isBoonsBanesPageActive();

        if (hasRaceArchetypePageActive) {
            var hasRace = hasChosenRace();
            var hasArchetype = hasChosenArchetype();
            if (!hasRace && !hasArchetype) {
                errors.push('Please choose a race and archetype.');
            } else if (!hasRace) {
                errors.push('Please choose a race.');
            } else if (!hasArchetype) {
                errors.push('Please choose a archetype.');
            }
        }

        if (hasAttributesPageActive) {
            if (!hasChosenAllAttributes()) {
                var available = REQUIRED_CHOSEN_ATTRIBUTES - sumChosenAttributes();
                errors.push('Please spend your ' + available + ' available attribute point' + (available == 1 ? '' : 's') + '.');
            }
        }

        if (hasBoonsBanesPageActive) {
            if (!hasChosenBoonsAndBanes()) {
                var boons = sumChosenBoons().total;
                var banes = sumChosenBanes().total;

                if (boons < MINIMUM_CHOSEN_BOONS) {
                    errors.push('Please choose at least ' + MINIMUM_CHOSEN_BOONS + ' points in Boons.');
                } else if (boons > MAXIMUM_CHOSEN_BOONS) {
                    errors.push('Please choose at most ' + MAXIMUM_CHOSEN_BOONS + ' points in Boons.');
                }

                if (banes < MINIMUM_CHOSEN_BOONS) {
                    errors.push('Please choose at least ' + MINIMUM_CHOSEN_BOONS + ' points in Banes.');
                } else if (banes > MAXIMUM_CHOSEN_BOONS) {
                    errors.push('Please choose at most ' + MAXIMUM_CHOSEN_BOONS + ' points in Banes.');
                }

                if (boons - banes !== 0) {
                    errors.push('Please choose an equal amount of points in Boons and Banes.');
                }
            }
        }

        if (hasRaceArchetypePageActive && hasAttributesPageActive && hasBoonsBanesPageActive) {
            if (!hasChosenName()) {
                errors.push('Please choose a name between ' + NAME_MIN_LENGTH + ' and ' + NAME_MAX_LENGTH + ' characters long.');
            }
        }

        return errors;
    }

    function initBoonsBanesContainer(container, list, otherContainers, otherLists) {
        $('h3', container).unbind('click').click(() => {
            if (list.is(':visible')) {
                list.stop().slideUp();
            } else {
                otherLists.forEach(otherList => {
                    otherList.stop().slideUp();
                });
                list.stop().slideDown();
            }
        });
    }

    function showBackground($bg) {
        var allBgs = [$bgDefault, $bgLoading, $bgFactions, $bgArthurians, $bgTdd, $bgVikings];

        allBgs.forEach($background => {
            if ($background !== $bg) {
                $background.stop().animate({ opacity: 0 }, { duration: ANIMATION_DURATION, queue: false });
            }
        });

        $bg.stop().animate({ opacity: 1 }, { duration: ANIMATION_DURATION, queue: false });
    }

    function resetChosenFaction() {
        chosenFactionId = undefined;
        chosenFaction = undefined;

        showBackground($bgFactions);

        [$shieldArthurians, $shieldTdd, $shieldVikings].forEach($shield => {
            if (!$shield.is(':visible')) {
                $shield.css({ display: 'block', opacity: 0 });
            }

            $shield.stop().animate({ opacity: 1 }, { duration: ANIMATION_DURATION, queue: false });
        });

        $descriptionArthurians.stop().animate({ opacity: 0, left: '-800px' }, {
            duration: ANIMATION_DURATION, queue: false, complete: () => {
                $descriptionArthurians.css('display', 'none');
            }
        });

        $descriptionTdd.stop().animate({ opacity: 0, right: '-800px' }, {
            duration: ANIMATION_DURATION, queue: false, complete: () => {
                $descriptionTdd.css('display', 'none');
            }
        });

        $descriptionVikings.stop().animate({ opacity: 0 }, {
            duration: ANIMATION_DURATION, queue: false, complete: () => {
                $descriptionVikings.css('display', 'none');
            }
        });
    }

    function getFactionName(factionId) {
        switch (factionId) {
            case Faction.Arthurians: return 'The Arthurians';
            case Faction.TDD: return 'Tuatha Dé Danann';
            case Faction.Vikings: return 'The Vikings';
        }
        return '';
    }

    function getFactionCssClassName(factionId) {
        for (var name in Faction) {
            if (Faction[name] === factionId) {
                return name.toLowerCase();
            }
        }
        return '';
    }

    function getOtherFactionCssClassNames(factionId) {
        var names = [];
        for (var name in Faction) {
            if (Faction[name] !== factionId) {
                names.push(name.toLowerCase());
            }
        }
        return names;
    }

    function changeFaction(factionId) {
        var cssClass = getFactionCssClassName(factionId) + '-bg';

        if ($('.' + cssClass).is(':visible')) return;

        var isArthurians = factionId == Faction.Arthurians;
        var isTdd = factionId == Faction.TDD;
        var isVikings = factionId == Faction.Vikings;

        var $bg = $bgDefault;

        if (isArthurians) {
            $bg = $bgArthurians;
        } else if (isTdd) {
            $bg = $bgTdd;
        } else if (isVikings) {
            $bg = $bgVikings;
        }

        showBackground($bg);

        $shieldArthurians.stop().animate({ opacity: isArthurians ? 1 : 0 }, {
            duration: ANIMATION_DURATION, queue: false, complete: () => {
                $shieldArthurians.css('display', isArthurians ? 'block' : 'none');
            }
        });

        $shieldTdd.stop().animate({ opacity: isTdd ? 1 : 0 }, {
            duration: ANIMATION_DURATION, queue: false, complete: () => {
                $shieldTdd.css('display', isTdd ? 'block' : 'none');
            }
        });

        $shieldVikings.stop().animate({ opacity: isVikings ? 1 : 0 }, {
            duration: ANIMATION_DURATION, queue: false, complete: () => {
                $shieldVikings.css('display', isVikings ? 'block' : 'none');
            }
        });

        if (isArthurians) {
            if (!$descriptionArthurians.is(':visible')) {
                $descriptionArthurians.css({ display: 'block', opacity: 0 });
            }
            $descriptionArthurians.stop().animate({ opacity: 1, left: 0 }, { duration: ANIMATION_DURATION, queue: false });
        } else {
            $descriptionArthurians.stop().animate({ opacity: 0, left: '-800px' }, {
                duration: ANIMATION_DURATION, queue: false, complete: () => {
                    $descriptionArthurians.css('display', 'none');
                }
            });
        }

        if (isTdd) {
            if (!$descriptionTdd.is(':visible')) {
                $descriptionTdd.css({ display: 'block', opacity: 0 });
            }
            $descriptionTdd.stop().animate({ opacity: 1, right: 0 }, { duration: ANIMATION_DURATION, queue: false });
        } else {
            $descriptionTdd.stop().animate({ opacity: 0, right: '-800px' }, {
                duration: ANIMATION_DURATION, queue: false, complete: () => {
                    $descriptionTdd.css('display', 'none');
                }
            });
        }

        if (isVikings) {
            if (!$descriptionVikings.is(':visible')) {
                $descriptionVikings.css({ display: 'block', opacity: 0 });
            }
            $descriptionVikings.stop().animate({ opacity: 1 }, { duration: ANIMATION_DURATION, queue: false });
        } else {
            $descriptionVikings.stop().animate({ opacity: 0 }, {
                duration: ANIMATION_DURATION, queue: false, complete: () => {
                    $descriptionVikings.css('display', 'none');
                }
            });
        }
    }

    function getFaction(factionId) {
        switch (factionId) {
            case Faction.Arthurians: return factionArthurians;
            case Faction.TDD: return factionTdd;
            case Faction.Vikings: return factionVikings;
        }
        return null;
    }

    function hasAllSuccessfulResponses() {
        return getFactionsState == RequestState.Succeeded && getAttributesState == RequestState.Succeeded &&
            getBoonsState == RequestState.Succeeded && getBanesState == RequestState.Succeeded;
    }

    function tryChooseFaction(factionId) {
        clearTimeout(chooseFactionTimeout);
        chooseFactionTimeout = null;

        if (hasAllSuccessfulResponses()) {
            chooseFaction(factionId);
        } else {
            chooseFactionTimeout = setTimeout(() => {
                tryChooseFaction(factionId);
            }, 500);
        }
    }

    function chooseFaction(factionId) {
        if (chosenFactionId !== factionId) {
            chosenFactionId = factionId;
            chosenFaction = getFaction(factionId);

            resetChosenRace();
            resetChosenArchetype();
            resetAbilities();
            resetChosenAttributes();
            resetChosenBoons();
            resetChosenBanes();
        }

        showChooseRaceArchetypePage();
    }

    function setChosenName() {
        chosenName = $characterName.val();
    }

    function setChosenRace() {
        chosenRace = chosenFaction.races[$('input:radio[name=race]:checked').val()];

        // TODO: begin - remove later when choosing archetypes is allowed

        var archetypeIndex = getArchetypeIndexForChosenRace();
        chosenArchetype = chosenFaction.archetypes[archetypeIndex];

        $('input:radio[name=archetype]').prop('checked', false);
        $('input:radio[name=archetype][value=' + archetypeIndex + ']').prop('checked', true);

        // TODO: end - remove later when choosing archetypes is allowed
    }

    // TODO: begin - remove this function later when choosing archetypes is allowed
    function getArchetypeIndexForChosenRace() {
        if (!chosenRace) return 0;
        switch (chosenRace.value) {
            case Race.Hamadryad: return 1; // Hamadryad = Fighter
            case Race.Luchorpan: return 2; // Luchorpan = Healer
            case Race.Firbog: return 0; // Firbog = Earth Mage
            case Race.Valkyrie: return 0; // Valkyrie = Water Mage
            case Race.Helbound: return 2; // Helbound = Healer
            case Race.FrostGiant: return 1; // Frost Giant = Fighter
            case Race.Strm: return 0; // Strm = Fire Mage
            case Race.CaitSith: return 1; // Cait Sith = Fighter
            case Race.Golem: return 2; // Golem = Healer
            case Race.StormRiderA: return 3; // StormRiderA = MeleeCombatTest
            case Race.StormRiderT: return 3; // StormRiderT = MeleeCombatTest
            case Race.StormRiderV: return 3; // StormRiderV = MeleeCombatTest
        }
        return 0;
    }
    // TODO: end - remove this function later when choosing archetypes is allowed

    function setChosenArchetype() {
        chosenArchetype = chosenFaction.archetypes[$('input:radio[name=archetype]:checked').val()];

        chosenRace = chosenFaction.races[$('input:radio[name=race]:checked').val()];

        // TODO: begin - remove later when choosing archetypes is allowed

        var raceIndex = getRaceIndexForChosenArchetype();
        chosenRace = chosenFaction.races[raceIndex];

        $('input:radio[name=race]').prop('checked', false);
        $('input:radio[name=race][value=' + raceIndex + ']').prop('checked', true);

        // TODO: end - remove later when choosing archetypes is allowed
    }

    // TODO: begin - remove this function later when choosing archetypes is allowed
    function getRaceIndexForChosenArchetype() {
        if (!chosenFaction || !chosenArchetype) return 0;
        switch (chosenFaction.value) {
        case Faction.Arthurians:
            switch (chosenArchetype.value) {
            case Archetype.FireMage: return 0; // Fire Mage = Strm
            case Archetype.Fighter: return 1; // Fighter = Cait Sith
            case Archetype.Healer: return 2; // Healer = Golem
            case Archetype.MeleeCombatTest: return 3; // MeleeCombatTest = StormRiderA
            }
            break;
        case Faction.TDD:
            switch (chosenArchetype.value) {
            case Archetype.EarthMage: return 2; // Earth Mage = Firbog
            case Archetype.Fighter: return 0; // Fighter = Hamadryad
            case Archetype.Healer: return 1; // Healer = Luchorpan
            case Archetype.MeleeCombatTest: return 3; // MeleeCombatTest = StormRiderT
            }
            break;
        case Faction.Vikings:
            switch (chosenArchetype.value) {
            case Archetype.WaterMage: return 0; // Water Mage = Valkyrie
            case Archetype.Fighter: return 2; // Fighter = Frost Giant
            case Archetype.Healer: return 1; // Healer = Helbound
            case Archetype.MeleeCombatTest: return 3; // MeleeCombatTest = StormRiderV
            }
            break;
        }
        return 0;
    }
    // TODO: end - remove this function later when choosing archetypes is allowed

    function setChosenAttributes() {
        chosenAttributes = getCurrentAttributes();
    }

    function getCurrentAttributes() {
        var attrs = [];

        $('input:text[name=attribute]').each((i, element) => {
            var $attribute = $(element);
            var attribute = attributes.primary[i];
            var value = parseInt($attribute.val(), 10);
            if (attribute && value) {
                attrs.push({
                    name: attribute.name,
                    description: attribute.description,
                    value: value
                });
            }
        });

        return attrs;
    }

    function sumCurrentAttributes() {
        return getCurrentAttributes().reduce((sum, attr) => sum + attr.value, 0);
    }

    function sumOtherAttributes(attribute) {
        return getCurrentAttributes().reduce((sum, attr) => sum + (attr.name == attribute.name ? 0 : attr.value), 0);
    }

    function setChosenBoons() {
        chosenBoonsGeneral = [];

        $('input:hidden[name=boon][data-category=general]').each(function () {
            var chosenBoon = getChosenBoon('general', this);
            if (chosenBoon) chosenBoonsGeneral.push(chosenBoon);
        });

        chosenBoonsFaction = [];

        $('input:hidden[name=boon][data-category=faction]').each(function () {
            var chosenBoon = getChosenBoon('faction', this);
            if (chosenBoon) chosenBoonsFaction.push(chosenBoon);
        });

        chosenBoonsRace = [];

        $('input:hidden[name=boon][data-category=race]').each(function () {
            var chosenBoon = getChosenBoon('race', this);
            if (chosenBoon) chosenBoonsRace.push(chosenBoon);
        });

        chosenBoonsArchetype = [];

        $('input:hidden[name=boon][data-category=archetype]').each(function () {
            var chosenBoon = getChosenBoon('archetype', this);
            if (chosenBoon) chosenBoonsArchetype.push(chosenBoon);
        });
    }

    function getChosenBoon(category, element) {
        var $boon = $(element);
        var index = parseInt($boon.attr('data-index'), 10);
        var ranks = parseInt($boon.val(), 10);
        var boons = getBoonsForCategory(category);
        if (!boons || !boons.length) return null;
        var boon = boons[index];
        if (!ranks || !boon || ranks > boon.maxRanks) return null;
        return {
            id: boon.id,
            name: boon.name,
            description: boon.description,
            category: boon.category,
            icon: boon.icon,
            costPerRank: boon.costPerRank,
            maxRanks: boon.maxRanks,
            x: boon.x,
            y: boon.y,
            prerequisite: boon.prerequisite,
            ranks: ranks
        };
    }

    function setChosenBanes() {
        chosenBanesGeneral = [];

        $('input:hidden[name=bane][data-category=general]').each(function () {
            var chosenBane = getChosenBane('general', this);
            if (chosenBane) chosenBanesGeneral.push(chosenBane);
        });

        chosenBanesFaction = [];

        $('input:hidden[name=bane][data-category=faction]').each(function () {
            var chosenBane = getChosenBane('faction', this);
            if (chosenBane) chosenBanesFaction.push(chosenBane);
        });

        chosenBanesRace = [];

        $('input:hidden[name=bane][data-category=race]').each(function () {
            var chosenBane = getChosenBane('race', this);
            if (chosenBane) chosenBanesRace.push(chosenBane);
        });

        chosenBanesArchetype = [];

        $('input:hidden[name=bane][data-category=archetype]').each(function () {
            var chosenBane = getChosenBane('archetype', this);
            if (chosenBane) chosenBanesArchetype.push(chosenBane);
        });
    }

    function getChosenBane(category, element) {
        var $bane = $(element);
        var index = parseInt($bane.attr('data-index'), 10);
        var ranks = parseInt($bane.val(), 10);
        var banes = getBanesForCategory(category);
        if (!banes || !banes.length) return null;
        var bane = banes[index];
        if (!ranks || !bane || ranks > bane.maxRanks) return null;
        return {
            id: bane.id,
            name: bane.name,
            description: bane.description,
            category: bane.category,
            icon: bane.icon,
            costPerRank: bane.costPerRank,
            maxRanks: bane.maxRanks,
            x: bane.x,
            y: bane.y,
            prerequisite: bane.prerequisite,
            ranks: ranks
        };
    }

    function getRaceIcon(race) {
        return '../images/races/' + race.name.toLowerCase() + '.jpg';
    }

    function getRaceStandingImage(race) {
        return '../images/races/' + race.name.toLowerCase() + '-stand.png';
    }

    function resetChosenRace() {
        chosenRace = undefined;

        $races.empty();

        if (!hasChosenFaction()) return;

        var races = chosenFaction.races;

        if (!races || !races.length) return;

        races.forEach((race, index) => {
            var $li = $('<li>').appendTo($races);

            $('<input>').attr({
                id: 'choose-race-' + index, type: 'radio', name: 'race'
            }).val(index).click(function () {
                $(this).closest('form').submit();
            }).appendTo($li);

            var raceName = addSpaceBetweenCapitalLetters(race.name);

            var $label = $('<label>').attr({
                'for': 'choose-race-' + index,
                'data-tooltip-title': raceName,
                'data-tooltip-content': race.description
            }).appendTo($li);

            new Tooltip($label, { showDelay: 0, hideDelay: 100, topOffset: -25 });

            $('<img>').attr('src', getRaceIcon(race)).appendTo($label);
        });
    }

    function getArchetypeIcon(archetype) {
        return '../images/archetypes/' + archetype.name.toLowerCase() + '.jpg';
    }

    function resetChosenArchetype() {
        chosenArchetype = undefined;

        $archetypes.empty();

        if (!hasChosenFaction()) return;

        var archetypes = chosenFaction.archetypes;

        if (!archetypes || !archetypes.length) return;

        archetypes.forEach((archetype, index) => {
            var $li = $('<li>').appendTo($archetypes);

            $('<input>').attr({
                id: 'choose-archetype-' + index,
                type: 'radio',
                name: 'archetype'
            }).click(function() {
                $(this).closest('form').submit();
            }).val(index).appendTo($li);

            var $label = $('<label>').attr({
                'for': 'choose-archetype-' + index,
                'data-tooltip-title': addSpaceBetweenCapitalLetters(archetype.name),
                'data-tooltip-content': archetype.description
            }).appendTo($li);

            new Tooltip($label, { showDelay: 0, hideDelay: 100, topOffset: -25 });

            $('<img>').attr('src', getArchetypeIcon(archetype)).appendTo($label);
        });
    }

    function resetAbilities() {
        /*
        $abilities.empty();

        // TODO: get from archetype when abilities are not on race
        // if (!hasChosenArchetype()) {
        if (!hasChosenRace()) {
            $abilities.parent().fadeOut();
            return;
        }
        
        // TODO: get from archetype when abilities are not on race
        //var abilities = chosenArchetype.abilities;
        var abilities = chosenRace.abilities;

        if (!abilities || !abilities.length) {
            $abilities.parent().fadeOut();
            return;
        }

        abilities.forEach(ability => {
            var $li = $('<li>').attr({
                'data-tooltip-title': ability.name,
                'data-tooltip-content': ability.tooltip
            }).appendTo($abilities);

            new Tooltip($li, { showDelay: 0, hideDelay: 100, topOffset: -25 });

            $('<img>').attr('src', ability.icon).appendTo($li);
        });

        $abilities.parent().fadeIn();
        */
    }

    function resetChosenAttributes() {
        chosenAttributes = undefined;

        $attributes.empty();

        $btnAttributesPage.removeClass('active');

        var attrs = attributes.primary;

        if (!attrs || !attrs.length) return;

        attrs.forEach(attribute => {
            var $tr = $('<tr>').appendTo($attributes);

            var $td = $('<td>').attr({
                'data-tooltip-title': attribute.name,
                'data-tooltip-content': attribute.description
            }).text(attribute.name).appendTo($tr);

            new Tooltip($td, { showDelay: 0, hideDelay: 0, topOffset: -25 });

            $('<td>').text(attribute.min).appendTo($tr);

            $('<td>').text(attribute.max).appendTo($tr);

            $('<td>').text(attribute.cap).appendTo($tr);

            $td = $('<td>').appendTo($tr);

            var $input = $('<input>').attr({
                type: 'text', name: 'attribute', 'data-min': attribute.min, 'data-max': attribute.max
            }).val(attribute.min).change(() => {
                var value = parseInt($input.val(), 10);
                updateCurrentValue(isNaN(value) ? attribute.min : value);
                $(this).closest('form').submit();
            }).appendTo($td);

            $td = $('<td>').appendTo($tr);

            var $increase = $('<button>').attr('type', 'submit').addClass('attribute-increase').appendTo($td).click(() => {
                var value = parseInt($input.val(), 10) + 1;
                updateCurrentValue(value);
            });

            $td = $('<td>').appendTo($tr);

            var $decrease = $('<button>').attr('type', 'submit').addClass('attribute-decrease').prop('disabled', true).appendTo($td).click(() => {
                var value = parseInt($input.val(), 10) - 1;
                updateCurrentValue(value);
            });

            function updateCurrentValue(value) {
                if (value < attribute.min) {
                    value = attribute.min;
                } else if (value > attribute.max) {
                    value = attribute.max;
                }

                var availablePoints = REQUIRED_CHOSEN_ATTRIBUTES - sumOtherAttributes(attribute);

                if (value > availablePoints) {
                    value = availablePoints;
                }

                var isDecreaseDisabled = value == attribute.min;
                var isIncreaseDisabled = value == attribute.max;

                $decrease.prop('disabled', isDecreaseDisabled);

                $increase.prop('disabled', isIncreaseDisabled);

                $input.val(value);

                if (isDecreaseDisabled || isIncreaseDisabled) {
                    $chooseAttributes.submit();
                }
            }
        });
    }

    function resetChosenBoonsBanesList(type, category, container, boonBanes, isBoon, showHide = false, hasElements: any = true) {
        container.empty();

        var isInitial = container.attr('data-height') === undefined;

        if (isInitial) container[showHide ? 'show' : 'hide']();

        var maxY = 0;

        if (hasElements) {
            boonBanes.forEach((boonBane, index) => {
                if (hasElements.value && boonBane.categoryID !== hasElements.value) return;

                createBoonBaneElement(type, category, boonBane, index, isBoon).appendTo(container);

                if (boonBane.y > maxY) maxY = boonBane.y;
            });
        }

        container.css('overflow-y', maxY > 5 ? 'scroll' : 'hidden');

        var height = getBoonsBanesListHeight(maxY);

        container.attr('data-height', height).css('height', height);
    }

    function resetChosenBoonsGeneral() {
        chosenBoonsGeneral = undefined;

        resetChosenBoonsBanesList('boon', 'general', $boonsGeneral, boonsGeneral, true, true);
    }

    function resetChosenBoonsFaction() {
        chosenBoonsFaction = undefined;

        resetChosenBoonsBanesList('boon', 'faction', $boonsFaction, boonsFaction, true, false, chosenFaction);
    }

    function resetChosenBoonsRace() {
        chosenBoonsRace = undefined;

        resetChosenBoonsBanesList('boon', 'race', $boonsRace, boonsRace, true, false, chosenRace);
    }

    function resetChosenBoonsArchetype() {
        chosenBoonsArchetype = undefined;

        resetChosenBoonsBanesList('boon', 'archetype', $boonsArchetype, boonsArchetype, true, false, chosenArchetype);
    }

    function resetChosenBoons() {
        $btnBoonsBanesPage.removeClass('active');

        resetChosenBoonsGeneral();
        resetChosenBoonsFaction();
        resetChosenBoonsRace();
        resetChosenBoonsArchetype();
    }

    function resetChosenBanesGeneral() {
        chosenBanesGeneral = undefined;

        resetChosenBoonsBanesList('bane', 'general', $banesGeneral, banesGeneral, false, true);
    }

    function resetChosenBanesFaction() {
        chosenBanesFaction = undefined;

        resetChosenBoonsBanesList('bane', 'faction', $banesFaction, banesFaction, false, false, chosenFaction);
    }

    function resetChosenBanesRace() {
        chosenBanesRace = undefined;

        resetChosenBoonsBanesList('bane', 'race', $banesRace, banesRace, false, false, chosenRace);
    }

    function resetChosenBanesArchetype() {
        chosenBanesArchetype = undefined;

        resetChosenBoonsBanesList('bane', 'archetype', $banesArchetype, banesArchetype, false, false, chosenArchetype);
    }

    function resetChosenBanes() {
        $btnBoonsBanesPage.removeClass('active');

        resetChosenBanesGeneral();
        resetChosenBanesFaction();
        resetChosenBanesRace();
        resetChosenBanesArchetype();
    }

    function createBoonBaneTooltipContent(boonBane) {
        var $content = createBoonBaneSummaryTooltipContent(boonBane);
        $('<div>').addClass('help').text('Left click to increase. Right click to decrease.').appendTo($content);
        return $content;
    }

    function createBoonBaneSummaryTooltipContent(boonBane) {
        var $content = $('<div>').addClass('boon-bane-tooltip');
        $('<div>').text(boonBane.description).appendTo($content);
        if (boonBane.costPerRank) {
            var $cost = $('<div>').addClass('cost').appendTo($content);
            $('<span>').addClass('label').text('Cost: ').appendTo($cost);
            $('<span>').addClass('value').text(boonBane.costPerRank).appendTo($cost);
        }
        return $content;
    }

    function createBoonBaneElement(type, category, boonBane, index, isBoon) {
        var $li = $('<li>').css({
            position: 'absolute',
            left: boonBane.x * BOON_BANE_OFFSET_X,
            top: boonBane.y * BOON_BANE_OFFSET_Y
        }).attr({
            'data-tooltip-title': boonBane.name
        }).addClass(category);

        new Tooltip($li, {
            showDelay: 0,
            hideDelay: 100,
            topOffset: -25,
            content: () => createBoonBaneTooltipContent(boonBane)
        });

        $('<img>').attr('src', boonBane.icon).appendTo($li);

        if (boonBane.costPerRank) {
            $('<span>').addClass('cost').text(boonBane.costPerRank).appendTo($li);
        }

        var $ranks = $('<span>').addClass('ranks').text('0 / ' + boonBane.maxRanks).appendTo($li);

        var hasPrerequisite = !_.isEmpty(boonBane.prerequisite);

        if (hasPrerequisite) {
            $li.addClass('disabled has-prereq');
        }

        var $input = $('<input>').attr({
            type: 'hidden', name: type, 'data-category': category, 'data-index': index, 'data-id': boonBane.id
        }).prop('disabled', hasPrerequisite).val('0').appendTo($li);

        $li.mousedown((e) => {
            if ($input.prop('disabled')) return false;

            var ranks = parseInt($input.val(), 10);

            if (e.button == 0) { // left mouse
                var isUnderMax = isBoon ? isUnderMaximumChosenBoons() : isUnderMaximumChosenBanes();

                if (!isUnderMax) {
                    return false;
                }

                ranks++;
            } else if (e.button == 2) { // right mouse
                ranks--;
            }

            if (ranks >= 0 && ranks <= boonBane.maxRanks) {
                $input.val(ranks.toString());

                $ranks.text(ranks + ' / ' + boonBane.maxRanks);

                $chooseBoonsAndBanes.submit();
            }

            $li.toggleClass('active', ranks >= 1);

            return false;
        });

        return $li;
    }

    function getBoonsBanesListHeight(maxY) {
        return maxY ? ((maxY + 1) * BOON_BANE_OFFSET_Y) - 10 : 0;
    }

    function capitalizeFirstLetter(value) {
        return value.charAt(0).toUpperCase() + value.substring(1);
    }

    function accumulateAttributes(attrs, accumulator) {
        if (!attrs) return;
        for (var attribute in attrs) {
            var value = attrs[attribute];
            if (accumulator.hasOwnProperty(attribute)) {
                accumulator[attribute].value += value;
            } else {
                attribute = capitalizeFirstLetter(attribute);
                if (accumulator.hasOwnProperty(attribute)) {
                    accumulator[attribute].value += value;
                }
            }
        }
    }

    function getInitialAttributes(attrs) {
        return attrs.reduce((results, attribute) => {
            var result: any = {};
            result.name = attribute.name;
            result.description = attribute.description;
            result.value = 0;
            result.format = attribute.format;
            results[attribute.name] = result;
            return results;
        }, {});
    }

    function getAllAttributes() {
        var attrs: any = {};
        attrs.primary = getInitialAttributes(attributes.primary);
        attrs.secondary = getInitialAttributes(attributes.secondary);
        attrs.derived = getInitialAttributes(attributes.derived);

        if (hasChosenFaction()) {
            var chosenFactionAttributes = chosenFaction.attributes;
            if (chosenFactionAttributes) {
                accumulateAttributes(chosenFactionAttributes.primary, attrs.primary);
                accumulateAttributes(chosenFactionAttributes.secondary, attrs.secondary);
                accumulateAttributes(chosenFactionAttributes.derived, attrs.derived);
            }
        }

        if (hasChosenRace()) {
            var chosenRaceAttributes = chosenRace.attributes;
            if (chosenRaceAttributes) {
                accumulateAttributes(chosenRaceAttributes.primary, attrs.primary);
                accumulateAttributes(chosenRaceAttributes.secondary, attrs.secondary);
                accumulateAttributes(chosenRaceAttributes.derived, attrs.derived);
            }
        }

        if (hasChosenArchetype()) {
            var chosenArchetypeAttributes = chosenArchetype.attributes;
            if (chosenArchetypeAttributes) {
                accumulateAttributes(chosenArchetypeAttributes.primary, attrs.primary);
                accumulateAttributes(chosenArchetypeAttributes.secondary, attrs.secondary);
                accumulateAttributes(chosenArchetypeAttributes.derived, attrs.derived);
            }
        }

        if (hasChosenAttributes()) {
            var choseAttr = chosenAttributes.reduce((result, attribute) => {
                if (attribute.value) result[attribute.name] = attribute.value;
                return result;
            }, {});

            accumulateAttributes(choseAttr, attrs.primary);
        }

        return attrs;
    }

    function getAllBoons() {
        var boons = [];
        var boon;

        if (hasChosenFaction()) {
            var chosenFactionBoons = chosenFaction.boons;
            if (chosenFactionBoons) {
                for (boon in chosenFactionBoons) {
                    boons.push(chosenFactionBoons[boon]);
                }
            }
        }

        if (hasChosenRace()) {
            var chosenRaceBoons = chosenRace.boons;
            if (chosenRaceBoons) {
                for (boon in chosenRaceBoons) {
                    boons.push(chosenRaceBoons[boon]);
                }
            }
        }

        if (hasChosenArchetype()) {
            var chosenArchetypeBoons = chosenArchetype.boons;
            if (chosenArchetypeBoons) {
                for (boon in chosenArchetypeBoons) {
                    boons.push(chosenArchetypeBoons[boon]);
                }
            }
        }

        if (hasChosenBoonsGeneral()) {
            for (boon in chosenBoonsGeneral) {
                boons.push(chosenBoonsGeneral[boon]);
            }
        }

        if (hasChosenBoonsFaction()) {
            for (boon in chosenBoonsFaction) {
                boons.push(chosenBoonsFaction[boon]);
            }
        }

        if (hasChosenBoonsRace()) {
            for (boon in chosenBoonsRace) {
                boons.push(chosenBoonsRace[boon]);
            }
        }

        if (hasChosenBoonsArchetype()) {
            for (boon in chosenBoonsArchetype) {
                boons.push(chosenBoonsArchetype[boon]);
            }
        }

        return boons;
    }

    function getAllBanes() {
        var banes = [];
        var bane;

        if (hasChosenFaction()) {
            var chosenFactionBanes = chosenFaction.banes;
            if (chosenFactionBanes) {
                for (bane in chosenFactionBanes) {
                    banes.push(chosenFactionBanes[bane]);
                }
            }
        }

        if (hasChosenRace()) {
            var chosenRaceBanes = chosenRace.banes;
            if (chosenRaceBanes) {
                for (bane in chosenRaceBanes) {
                    banes.push(chosenRaceBanes[bane]);
                }
            }
        }

        if (hasChosenArchetype()) {
            var chosenArchetypeBanes = chosenArchetype.banes;
            if (chosenArchetypeBanes) {
                for (bane in chosenArchetypeBanes) {
                    banes.push(chosenArchetypeBanes[bane]);
                }
            }
        }

        if (hasChosenBanesGeneral()) {
            for (bane in chosenBanesGeneral) {
                banes.push(chosenBanesGeneral[bane]);
            }
        }

        if (hasChosenBanesFaction()) {
            for (bane in chosenBanesFaction) {
                banes.push(chosenBanesFaction[bane]);
            }
        }

        if (hasChosenBanesRace()) {
            for (bane in chosenBanesRace) {
                banes.push(chosenBanesRace[bane]);
            }
        }

        if (hasChosenBanesArchetype()) {
            for (bane in chosenBanesArchetype) {
                banes.push(chosenBanesArchetype[bane]);
            }
        }

        return banes;
    }

    function getTitle() {
        var title = '';

        var hasRace = hasChosenRace();
        var hasArchetype = hasChosenArchetype();
        var hasFaction = hasChosenFaction();

        if (hasRace) {
            title += chosenRace.name;
        }

        if (hasArchetype) {
            if (hasRace) {
                title += ' ';
            }

            title += chosenArchetype.name;
        }

        if (hasFaction) {
            if (hasRace || hasArchetype) {
                title += ' of ';
            }

            title += getFactionName(chosenFaction.value);
        }

        return title;
    }

    function updateView() {
        updateCharacterName();

        updateCharacterFaction();

        updateCharacterTitle();

        updateCharacterSummary();

        updateCharacterRace();

        updateBoonsBanes();

        updateTopFrame();

        updateVisiblePage();

        updateButtons();
    }

    function updateCharacterName() {
        if (hasChosenBoonsAndBanes() && !hasChosenName() && !$characterName.hasClass('has-focused')) {
            flashCharacterName();
        }
    }

    function flashCharacterName() {
        setTimeout(() => $characterName.addClass('highlight'), 0);
        setTimeout(() => $characterName.removeClass('highlight'), 150);
        setTimeout(() => $characterName.addClass('highlight'), 300);
        setTimeout(() => $characterName.removeClass('highlight'), 450);
        setTimeout(() => $characterName.addClass('highlight'), 600);
        setTimeout(() => $characterName.removeClass('highlight'), 750);
        setTimeout(() => $characterName.addClass('highlight'), 900);
    }

    function updateCharacterFaction() {
        var factionName = getFactionCssClassName(chosenFactionId);

        var otherFactions = getOtherFactionCssClassNames(chosenFactionId).join(' ');

        $characterFaction.removeClass(otherFactions).addClass(factionName).html(getFactionName(chosenFactionId));
    }

    function updateCharacterTitle() {
        var title = getTitle();

        if (title) {
            $characterTitle.html(title).show();
        } else {
            $characterTitle.hide();
        }
    }

    function updateCharacterSummary() {
        var attrs: any = getAllAttributes();
        var boons = getAllBoons();
        var banes = getAllBanes();

        updateSummaryList($summaryPrimaryAttributes, attrs.primary, createSummaryAttributeElement);
        updateSummaryList($summarySecondaryAttributes, attrs.secondary, createSummaryAttributeElement);
        updateSummaryList($summaryDerivedAttributes, attrs.derived, createSummaryAttributeElement);
        updateSummaryBoonBaneList($summaryBoons, boons, createSummaryBoonElement);
        updateSummaryBoonBaneList($summaryBanes, banes, createSummaryBaneElement);
    }

    function updateSummaryList(list, elements, callback) {
        list.empty();

        for (var element in elements) {
            callback(element, elements[element]).appendTo(list);
        }
    }

    function updateSummaryBoonBaneList(list, elements, callback) {
        var boonBaneIDs = [];
        
        list.children().each((i, boon) => {
            var $boon = $(boon);
            var id = $boon.attr('data-id');

            if (!hasBoonBaneID(elements, id)) {
                $boon.remove();
            } else {
                boonBaneIDs.push(id);
            }
        });

        for (var element in elements) {
            var boonBane = elements[element];
            if (boonBaneIDs.indexOf(boonBane.id) === -1) {
                callback(element, boonBane).appendTo(list);
            }
        }
    }

    function hasBoonBaneID(elements, id) {
        var hasID = false;
        for (var element in elements) {
            if (elements[element].id === id) {
                hasID = true;
                break;
            }
        }
        return hasID;
    }

    function updateCharacterRace() {
        if (hasChosenRace()) {
            var src = getRaceStandingImage(chosenRace);
            if ($characterRace.attr('src') == src) return;
            $characterRace.stop().fadeOut(() => {
                $characterRace.attr('src', src).fadeIn();
            });
        }
    }

    function getBoonsForCategory(category) {
        switch (category) {
            case 'general': return boonsGeneral;
            case 'faction': return boonsFaction;
            case 'race': return boonsRace;
            case 'archetype': return boonsArchetype;
        }
        return null;
    }

    function getBanesForCategory(category) {
        switch (category) {
            case 'general': return banesGeneral;
            case 'faction': return banesFaction;
            case 'race': return banesRace;
            case 'archetype': return banesArchetype;
        }
        return null;
    }

    function getChosenBoonsForCategory(category) {
        switch (category) {
            case 'general': return chosenBoonsGeneral;
            case 'faction': return chosenBoonsFaction;
            case 'race': return chosenBoonsRace;
            case 'archetype': return chosenBoonsArchetype;
        }
        return null;
    }

    function getChosenBanesForCategory(category) {
        switch (category) {
            case 'general': return chosenBanesGeneral;
            case 'faction': return chosenBanesFaction;
            case 'race': return chosenBanesRace;
            case 'archetype': return chosenBanesArchetype;
        }
        return null;
    }

    function isUsingBoonPrereq(category, id) {
        var boons = getChosenBoonsForCategory(category);
        if (!boons) return false;
        return boons.filter(boon => boon.prerequisite && boon.prerequisite === id).length > 0;
    }

    function isUsingBanePrereq(category, id) {
        var banes = getChosenBanesForCategory(category);
        if (!banes) return false;
        return banes.filter(bane => bane.prerequisite && bane.prerequisite === id).length > 0;
    }

    function isUnderMaximumChosenBoons() {
        return sumChosenBoons().total < MAXIMUM_CHOSEN_BOONS;
    }

    function isUnderMaximumChosenBanes() {
        return sumChosenBanes().total < MAXIMUM_CHOSEN_BOONS;
    }

    function updateBoonsBanes() {
        var isUnderMaxBoons = isUnderMaximumChosenBoons();

        var isUnderMaxBanes = isUnderMaximumChosenBanes();

        $('input:hidden[name=boon]').each(function () {
            var $this = $(this);
            var id = $this.attr('data-id');
            var category = $this.attr('data-category');
            var hasPoints = hasChosenBoonPoints(category, id);
            var isUsingPrereq = false;
            var hasNotUnlockedPrereqs = false;
            if (isUnderMaxBoons) {
                isUsingPrereq = isUsingBoonPrereq(category, id);
                hasNotUnlockedPrereqs = !hasBoonPrereqsUnlocked(category, id);
            }
            var isNotUnderMaxBoonsAndHasPoints = !isUnderMaxBoons && !hasPoints;
            $this.prop('disabled', isNotUnderMaxBoonsAndHasPoints || isUsingPrereq || hasNotUnlockedPrereqs);
            $this.parent().toggleClass('disabled', isNotUnderMaxBoonsAndHasPoints || hasNotUnlockedPrereqs).toggleClass('prevent-decrease', isUsingPrereq);
        });

        $('input:hidden[name=bane]').each(function () {
            var $this = $(this);
            var id = $this.attr('data-id');
            var category = $this.attr('data-category');
            var hasPoints = hasChosenBanePoints(category, id);
            var isUsingPrereq = false;
            var hasNotUnlockedPrereqs = false;
            if (isUnderMaxBanes) {
                isUsingPrereq = isUsingBanePrereq(category, id);
                hasNotUnlockedPrereqs = !hasBanePrereqsUnlocked(category, id);
            }
            var isNotUnderMaxBanesAndHasPoints = !isUnderMaxBanes && !hasPoints;
            $this.prop('disabled', isNotUnderMaxBanesAndHasPoints || isUsingPrereq || hasNotUnlockedPrereqs);
            $this.parent().toggleClass('disabled', isNotUnderMaxBanesAndHasPoints || hasNotUnlockedPrereqs).toggleClass('prevent-decrease', isUsingPrereq);
        });
    }

    function updateBoonsBanesCount(sum, category, element) {
        if (sum.hasOwnProperty(category)) {
            element.text(sum[category]).show();
        } else {
            element.hide();
        }
    }

    function updateTopFrame() {
        $topFrameTitle.text(getTopFrameTitle());

        var $li;
        if (currentPage == Page.RaceArchetype) {
            $btnRaceArchetypePage.addClass('active');
            $btnRaceArchetypePage.addClass('current');
            $btnAttributesPage.removeClass('current');
            $btnBoonsBanesPage.removeClass('current');

            $topFramePoints.removeClass('attributes').removeClass('boons-banes').hide();
        } else if (currentPage == Page.Attributes) {
            $btnAttributesPage.addClass('active');
            $btnAttributesPage.addClass('current');
            $btnRaceArchetypePage.removeClass('current');
            $btnBoonsBanesPage.removeClass('current');

            var currentAttributes = sumCurrentAttributes();
            var availablePoints = REQUIRED_CHOSEN_ATTRIBUTES - currentAttributes;

            $topFramePoints.addClass('attributes').removeClass('boons-banes').empty();

            $li = $('<li>').attr('data-tooltip-content', 'You must spend ' + REQUIRED_CHOSEN_ATTRIBUTES + ' attribute points.').appendTo($topFramePoints);
            $('<span>').addClass('label').text('Available points').appendTo($li);
            $('<span>').addClass('value').text(availablePoints).appendTo($li);

            new Tooltip($li, { showDelay: 0, hideDelay: 100, topOffset: -25 });

            $topFramePoints.fadeIn();

            var hasNoAvailablePoints = availablePoints <= 0;
            var hasMaxAvailablePoints = availablePoints >= REQUIRED_CHOSEN_ATTRIBUTES;

            function isMax($element) {
                var $attribute = $element.parent().prev().children().first();
                var value = parseInt($attribute.val(), 10);
                var max = parseInt($attribute.attr('data-max'), 10);
                return value >= max;
            }

            function isMin($element) {
                var $attribute = $element.parent().prev().prev().children().first();
                var value = parseInt($attribute.val(), 10);
                var min = parseInt($attribute.attr('data-min'), 10);
                return value <= min;
            }

            $('.attribute-increase').each((i, element) => {
                var $element = $(element);
                var isDisabled = hasNoAvailablePoints || isMax($element);
                $element.prop('disabled', isDisabled);
            });

            $('.attribute-decrease').each((i, element) => {
                var $element = $(element);
                var isDisabled = hasMaxAvailablePoints || isMin($element);
                $element.prop('disabled', isDisabled);
            });
        } else if (currentPage == Page.BoonsBanes) {
            $btnBoonsBanesPage.addClass('active');
            $btnBoonsBanesPage.addClass('current');
            $btnAttributesPage.removeClass('current');
            $btnRaceArchetypePage.removeClass('current');

            var sumBoons = sumChosenBoons();
            var sumBanes = sumChosenBanes();

            updateBoonsBanesCount(sumBoons, Category.General, $boonsGeneralCount);
            updateBoonsBanesCount(sumBoons, Category.Faction, $boonsFactionCount);
            updateBoonsBanesCount(sumBoons, Category.Race, $boonsRaceCount);
            updateBoonsBanesCount(sumBoons, Category.Archetype, $boonsArchetypeCount);

            updateBoonsBanesCount(sumBanes, Category.General, $banesGeneralCount);
            updateBoonsBanesCount(sumBanes, Category.Faction, $banesFactionCount);
            updateBoonsBanesCount(sumBanes, Category.Race, $banesRaceCount);
            updateBoonsBanesCount(sumBanes, Category.Archetype, $banesArchetypeCount);

            var totalBoons = sumBoons.total;
            var totalBanes = sumBanes.total;

            var maxBoonsOrBanes = totalBoons < totalBanes ? totalBoons : totalBanes;

            var minimumPoints = MINIMUM_CHOSEN_BOONS - maxBoonsOrBanes;
            if (minimumPoints < 0) minimumPoints = 0;

            var maximumPoints = MAXIMUM_CHOSEN_BOONS - maxBoonsOrBanes;
            if (maximumPoints < 0) maximumPoints = 0;

            $boonsCount.text(totalBoons);
            $banesCount.text(totalBanes);

            var boonsPercent = 0;
            var banesPercent = 0;

            var hasMinimalBoonsAndBanes = totalBoons + totalBanes < MINIMUM_CHOSEN_BOONS * 2;

            if (totalBanes == 0 || hasMinimalBoonsAndBanes) {
                boonsPercent = (totalBoons / MINIMUM_CHOSEN_BOONS) / 2;
            } else if (totalBoons) {
                boonsPercent = totalBoons / (totalBoons + totalBanes);
            }

            if (boonsPercent > 1) boonsPercent = 1;

            if (totalBoons == 0 || hasMinimalBoonsAndBanes) {
                banesPercent = (totalBanes / MINIMUM_CHOSEN_BOONS) / 2;
            } else if (totalBanes) {
                banesPercent = totalBanes / (totalBoons + totalBanes);
            }

            if (banesPercent > 1) banesPercent = 1;

            if (boonsPercent == banesPercent) {
                if (hasMinimalBoonsAndBanes) {
                    $boonsBanesFrame.removeClass('balanced left right');
                } else {
                    $boonsBanesFrame.removeClass('left right').addClass('balanced');
                }
            } else if (boonsPercent > banesPercent) {
                $boonsBanesFrame.removeClass('balanced right').addClass('left');
            } else if (banesPercent > boonsPercent) {
                $boonsBanesFrame.removeClass('balanced left').addClass('right');
            }

            $boonsBar.stop().animate({ width: (boonsPercent * 100) + '%' }, { duration: ANIMATION_DURATION, queue: false });
            $banesBar.stop().animate({ width: (banesPercent * 100) + '%' }, { duration: ANIMATION_DURATION, queue: false });

            $topFramePoints.addClass('boons-banes').removeClass('attributes').empty();

            $li = $('<li>').attr('data-tooltip-content', 'You must spend at least ' + MINIMUM_CHOSEN_BOONS + ' points on both Boons and Banes.').appendTo($topFramePoints);
            $('<span>').addClass('label').text('Minimum points').appendTo($li);
            $('<span>').addClass('value').text(minimumPoints).appendTo($li);

            new Tooltip($li, { showDelay: 0, hideDelay: 100, topOffset: -25 });

            $li = $('<li>').attr('data-tooltip-content', 'You must spend at most ' + MAXIMUM_CHOSEN_BOONS + ' points on both Boons and Banes.').appendTo($topFramePoints);
            $('<span>').addClass('label').text('Maximum points').appendTo($li);
            $('<span>').addClass('value').text(maximumPoints).appendTo($li);

            new Tooltip($li, { showDelay: 0, hideDelay: 100, topOffset: -25 });

            $topFramePoints.fadeIn();
        } else {
            $topFramePoints.removeClass('attributes').removeClass('boons-banes').hide();
        }

        $btnAttributesPage.prop('disabled', !isValid(Page.RaceArchetype));

        $btnBoonsBanesPage.prop('disabled', !isValid(Page.Attributes));

        $btnNext.prop('disabled', !isValid(currentPage));

        $btnComplete.prop('disabled', !isValid());
    }

    function getTopFrameTitle() {
        switch (currentPage) {
            case Page.RaceArchetype: return 'Character';
            case Page.Attributes: return 'Attributes';
            case Page.BoonsBanes: return 'Boons & Banes';
        }
        return '';
    }

    function isRaceArchetypePageActive() {
        return $btnRaceArchetypePage.hasClass('active');
    }

    function isAttributesPageActive() {
        return $btnAttributesPage.hasClass('active');
    }

    function isBoonsBanesPageActive() {
        return $btnBoonsBanesPage.hasClass('active');
    }

    function updateVisiblePage() {
        var hasRace = hasChosenRace();
        $chooseFaction[currentPage == Page.Faction ? 'fadeIn' : 'fadeOut']();
        $characterFaction[currentPage >= Page.RaceArchetype ? 'fadeIn' : 'fadeOut']();
        $characterRaceArchetype[currentPage == Page.RaceArchetype ? 'fadeIn' : 'fadeOut']();
        $chooseArchetype[currentPage == Page.RaceArchetype && hasRace ? 'fadeIn' : 'fadeOut']();
        //$chosenArchetypeAbilities[currentPage == Page.RaceArchetype && hasRace ? 'fadeIn' : 'fadeOut']();
        $characterRace[currentPage >= Page.RaceArchetype && hasRace ? 'fadeIn' : 'fadeOut']();
        $characterParchment[currentPage >= Page.RaceArchetype ? 'fadeIn' : 'fadeOut']();
        $characterAttributes[currentPage == Page.Attributes ? 'fadeIn' : 'fadeOut']();
        $characterBoonsBanes[currentPage == Page.BoonsBanes ? 'fadeIn' : 'fadeOut']();
        $characterTopFrame[currentPage >= Page.RaceArchetype ? 'fadeIn' : 'fadeOut']();
        var isComplete = isRaceArchetypePageActive() && isAttributesPageActive() && isBoonsBanesPageActive();
        $characterNext[currentPage >= Page.RaceArchetype && !isComplete ? 'fadeIn' : 'fadeOut']();
        $characterComplete[currentPage >= Page.RaceArchetype && isComplete ? 'fadeIn' : 'fadeOut']();
    }

    function updateButtons() {
        $btnReset[currentPage >= Page.Attributes ? 'fadeIn' : 'fadeOut']();

        $btnBackLabel.text(currentPage >= Page.RaceArchetype ? 'Realms' : 'Back');
    }

    function isPreferredAttribute(attribute) {
        return chosenArchetype && chosenArchetype.preferredAttributes && chosenArchetype.preferredAttributes.indexOf(attribute.name) !== -1;
    }

    function createSummaryAttributeElement(name, attribute) {
        var attributeName = addSpaceBetweenCapitalLetters(attribute.name);

        var $li = $('<li>');

        if (isPreferredAttribute(attribute)) $li.addClass('preferred-attribute');

        var $name = $('<span>').addClass('summary-attribute-name').text(attributeName).attr({
            'data-tooltip-title': attributeName,
            'data-tooltip-content': attribute.description
        }).appendTo($li);

        new Tooltip($name, { showDelay: 0, hideDelay: 200, topOffset: -31, leftOffset: -40 });

        $('<span>').addClass('summary-attribute-value').text(numeral(attribute.value).format(attribute.format)).appendTo($li);

        return $li;
    }

    function createSummaryBoonElement(index, boon) {
        var $li = $('<li>').attr({
            'data-id': boon.id,
            'data-tooltip-title': boon.name
        });

        $('<img>').attr('src', boon.icon).appendTo($li);

        new Tooltip($li, { showDelay: 0, hideDelay: 100, topOffset: -25, content: () => createBoonBaneSummaryTooltipContent(boon) });

        return $li;
    }

    function createSummaryBaneElement(index, bane) {
        var $li = $('<li>').attr({
            'data-id': bane.id,
            'data-tooltip-title': bane.name
        });

        $('<img>').attr('src', bane.icon).appendTo($li);

        new Tooltip($li, { showDelay: 0, hideDelay: 100, topOffset: -25, content: () => createBoonBaneSummaryTooltipContent(bane) });

        return $li;
    }

    function hasChosenFaction() {
        return !_.isUndefined(chosenFaction);
    }

    function hasChosenName() {
        return _.isString(chosenName) && chosenName.length >= NAME_MIN_LENGTH && chosenName.length <= NAME_MAX_LENGTH;
    }

    function hasChosenRace() {
        return !_.isUndefined(chosenRace);
    }

    function hasChosenArchetype() {
        return !_.isUndefined(chosenArchetype);
    }

    function hasChosenAttributes() {
        return !_.isUndefined(chosenAttributes) && chosenAttributes.length;
    }

    function hasChosenAllAttributes() {
        return REQUIRED_CHOSEN_ATTRIBUTES === sumChosenAttributes();
    }

    function sumChosenAttributes() {
        if (!hasChosenAttributes()) return 0;
        return chosenAttributes.reduce((sum, attribute) => sum + attribute.value, 0);
    }

    function hasChosenBoonsGeneral() {
        return !_.isUndefined(chosenBoonsGeneral) && chosenBoonsGeneral.length;
    }

    function hasChosenBoonsFaction() {
        return !_.isUndefined(chosenBoonsFaction) && chosenBoonsFaction.length;
    }

    function hasChosenBoonsRace() {
        return !_.isUndefined(chosenBoonsRace) && chosenBoonsRace.length;
    }

    function hasChosenBoonsArchetype() {
        return !_.isUndefined(chosenBoonsArchetype) && chosenBoonsArchetype.length;
    }

    function hasChosenBoons() {
        return hasChosenBoonsGeneral() || hasChosenBoonsFaction() || hasChosenBoonsRace() || hasChosenBoonsArchetype();
    }

    function hasChosenBanesGeneral() {
        return !_.isUndefined(chosenBanesGeneral) && chosenBanesGeneral.length;
    }

    function hasChosenBanesFaction() {
        return !_.isUndefined(chosenBanesFaction) && chosenBanesFaction.length;
    }

    function hasChosenBanesRace() {
        return !_.isUndefined(chosenBanesRace) && chosenBanesRace.length;
    }

    function hasChosenBanesArchetype() {
        return !_.isUndefined(chosenBanesArchetype) && chosenBanesArchetype.length;
    }

    function hasChosenBanes() {
        return hasChosenBanesGeneral() || hasChosenBanesFaction() || hasChosenBanesRace() || hasChosenBanesArchetype();
    }

    function hasChosenBoonsAndBanes() {
        if (!hasChosenBoons() || !hasChosenBanes()) return false;
        var boons = sumChosenBoons().total;
        var banes = sumChosenBanes().total;
        return boons >= MINIMUM_CHOSEN_BOONS && boons <= MAXIMUM_CHOSEN_BOONS && boons - banes === 0;
    }

    function accumulateChosenBoonBanes(chosenBoonBanes, result) {
        if (!chosenBoonBanes) return result;
        return chosenBoonBanes.reduce((sum, boonBane) => {
            var amount = (boonBane ? boonBane.costPerRank * boonBane.ranks : 0);
            var category = boonBane.category || Category.General;
            if (sum.hasOwnProperty(category)) {
                sum[category] += amount;
            } else {
                sum[category] = amount;
            }
            sum.total += amount;
            return sum;
        }, result);
    }

    function sumChosenBoons() {
        var result = { total: 0 };
        accumulateChosenBoonBanes(chosenBoonsGeneral, result);
        accumulateChosenBoonBanes(chosenBoonsFaction, result);
        accumulateChosenBoonBanes(chosenBoonsRace, result);
        accumulateChosenBoonBanes(chosenBoonsArchetype, result);
        return result;
    }

    function sumChosenBanes() {
        var result = { total: 0 };
        accumulateChosenBoonBanes(chosenBanesGeneral, result);
        accumulateChosenBoonBanes(chosenBanesFaction, result);
        accumulateChosenBoonBanes(chosenBanesRace, result);
        accumulateChosenBoonBanes(chosenBanesArchetype, result);
        return result;
    }

    function hasChosenBoonPoints(category, id) {
        var boons = getChosenBoonsForCategory(category);
        if (boons) {
            var boon;
            for (var i = 0, length = boons.length; i < length; i++) {
                boon = boons[i];
                if (boon.id === id) return true;
            }
        }
        return false;
    }

    function hasChosenBanePoints(category, id) {
        var banes = getChosenBanesForCategory(category);
        if (banes) {
            var bane;
            for (var i = 0, length = banes.length; i < length; i++) {
                bane = banes[i];
                if (bane.id === id) return true;
            }
        }
        return false;
    }

    function hasBoonUnlocked(category, id) {
        var boons = getChosenBoonsForCategory(category);
        if (!boons || !boons.length) return false;
        for (var i = 0, length = boons.length; i < length; i++) {
            var boon = boons[i];
            if (boon.id === id) return boon.ranks === boon.maxRanks;
        }
        return false;
    }

    function hasBaneUnlocked(category, id) {
        var banes = getChosenBanesForCategory(category);
        if (!banes || !banes.length) return false;
        for (var i = 0, length = banes.length; i < length; i++) {
            var bane = banes[i];
            if (bane.id === id) return bane.ranks === bane.maxRanks;
        }
        return false;
    }

    function hasBoonPrereqsUnlocked(category, id) {
        var boon = getBoonById(category, id);
        if (!boon) return false;
        if (!boon.prerequisite || _.isEmpty(boon.prerequisite)) return true;
        return hasBoonUnlocked(category, boon.prerequisite);
    }

    function hasBanePrereqsUnlocked(category, id) {
        var bane = getBaneById(category, id);
        if (!bane) return false;
        if (!bane.prerequisite || _.isEmpty(bane.prerequisite)) return true;
        return hasBaneUnlocked(category, bane.prerequisite);
    }

    function getBoonById(category, id) {
        var boons = getBoonsForCategory(category);
        if (!boons) return null;
        return boons.filter(boon => boon.id === id)[0];
    }

    function getBaneById(category, id) {
        var banes = getBanesForCategory(category);
        if (!banes) return null;
        return banes.filter(bane => bane.id === id)[0];
    }

    function addSpaceBetweenCapitalLetters(value) {
        return value.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    function isValid(page?: Page): boolean {
        if ((!page || page >= Page.Faction) && !hasChosenFaction()) return false;
        if ((!page || page >= Page.RaceArchetype) && (!hasChosenRace() || !hasChosenArchetype())) return false;
        if ((!page || page >= Page.Attributes) && !hasChosenAllAttributes()) return false;
        if ((!page || page >= Page.BoonsBanes) && (!hasChosenBoonsAndBanes() || !hasChosenName())) return false;
        return true;
    }

    function showChooseFactionPage() {
        currentPage = Page.Faction;

        updateView();
    }

    function showChooseRaceArchetypePage() {
        if (!isValid(Page.Faction)) return;

        currentPage = Page.RaceArchetype;

        updateView();
    }

    function showChooseAttributesPage() {
        if (!isValid(Page.RaceArchetype)) return;

        currentPage = Page.Attributes;

        updateView();
    }

    function showChooseBoonsBanesPage() {
        if (!isValid(Page.Attributes)) return;

        currentPage = Page.BoonsBanes;

        updateView();
    }

    /* Character Creation Events */

    function initializeCharacterCreation() {
        if (hasInitializedCharacterCreation) return;

        hasInitializedCharacterCreation = true;

        boonsGeneral = [];
        boonsFaction = [];
        boonsRace = [];
        boonsArchetype = [];
        banesGeneral = [];
        banesFaction = [];
        banesRace = [];
        banesArchetype = [];
        getFactionsState = RequestState.None;
        getAttributesState = RequestState.None;
        getBoonsState = RequestState.None;
        getBanesState = RequestState.None;

        $shieldArthurians.unbind('mouseenter mouseleave').hover(() => {
            changeFaction(Faction.Arthurians);
        }, () => {
            if (!hasChosenFaction()) resetChosenFaction();
        }).click(() => {
            tryChooseFaction(Faction.Arthurians);
        });

        $shieldTdd.unbind('mouseenter mouseleave').hover(() => {
            changeFaction(Faction.TDD);
        }, () => {
            if (!hasChosenFaction()) resetChosenFaction();
        }).click(() => {
            tryChooseFaction(Faction.TDD);
        });

        $shieldVikings.unbind('mouseenter mouseleave').hover(() => {
            changeFaction(Faction.Vikings);
        }, () => {
            if (!hasChosenFaction()) resetChosenFaction();
        }).click(() => {
            tryChooseFaction(Faction.Vikings);
        });

        getFactions();
        getAttributes();
        getBoons();
        getBanes();

        $boonsBanesBars.attr('data-tooltip-content', 'You must choose an equal amount of boons and banes.');

        new Tooltip($boonsBanesBars, { showDelay: 0, hideDelay: 100, topOffset: -25, leftOffset: 77 });

        new Tooltip($characterNext, {
            showDelay: 0,
            hideDelay: 100,
            topOffset: -25,
            content: () => {
                return $btnNext.is(':disabled') ? getValidationErrors().join(' ') : '';
            }
        });

        new Tooltip($characterComplete, {
            showDelay: 0,
            hideDelay: 100,
            topOffset: -25,
            content: () => {
                return $btnComplete.is(':disabled') ? getValidationErrors().join(' ') : '';
            }
        });

        initBoonsBanesContainer($boonsGeneralContainer, $boonsGeneral,
            [$boonsFactionContainer, $boonsRaceContainer, $boonsArchetypeContainer],
            [$boonsFaction, $boonsRace, $boonsArchetype]);
        initBoonsBanesContainer($boonsFactionContainer, $boonsFaction,
            [$boonsGeneralContainer, $boonsRaceContainer, $boonsArchetypeContainer],
            [$boonsGeneral, $boonsRace, $boonsArchetype]);
        initBoonsBanesContainer($boonsRaceContainer, $boonsRace,
            [$boonsGeneralContainer, $boonsFactionContainer, $boonsArchetypeContainer],
            [$boonsGeneral, $boonsFaction, $boonsArchetype]);
        initBoonsBanesContainer($boonsArchetypeContainer, $boonsArchetype,
            [$boonsGeneralContainer, $boonsFactionContainer, $boonsRaceContainer],
            [$boonsGeneral, $boonsFaction, $boonsRace]);

        initBoonsBanesContainer($banesGeneralContainer, $banesGeneral,
            [$banesFactionContainer, $banesRaceContainer, $banesArchetypeContainer],
            [$banesFaction, $banesRace, $banesArchetype]);
        initBoonsBanesContainer($banesFactionContainer, $banesFaction,
            [$banesGeneralContainer, $banesRaceContainer, $banesArchetypeContainer],
            [$banesGeneral, $banesRace, $banesArchetype]);
        initBoonsBanesContainer($banesRaceContainer, $banesRace,
            [$banesGeneralContainer, $banesFactionContainer, $banesArchetypeContainer],
            [$banesGeneral, $banesFaction, $banesArchetype]);
        initBoonsBanesContainer($banesArchetypeContainer, $banesArchetype,
            [$banesGeneralContainer, $banesFactionContainer, $banesRaceContainer],
            [$banesGeneral, $banesFaction, $banesRace]);

        $characterName.unbind('keypress keyup keydown focus').bind('keypress keyup keydown', () => {
            setChosenName();

            updateView();
        }).focus(() => {
            $characterName.addClass('has-focused').removeClass('highlight');
        });

        $chooseRace.unbind('submit').submit(() => {
            setChosenRace();

            resetChosenBoonsRace();
            resetChosenBanesRace();

            // TODO: begin - remove later when choosing archetypes is allowed

            resetAbilities();

            resetChosenBoonsArchetype();
            resetChosenBanesArchetype();

            // TODO: end - remove later when choosing archetypes is allowed

            updateView();

            return false;
        });

        $chooseArchetype.unbind('submit').submit(() => {
            setChosenArchetype();

            resetAbilities();

            // TODO: begin - remove later when choosing archetypes is allowed

            resetChosenBoonsRace();
            resetChosenBanesRace();

            // TODO: end - remove later when choosing archetypes is allowed

            resetChosenBoonsArchetype();
            resetChosenBanesArchetype();

            updateView();

            return false;
        });

        $chooseAttributes.unbind('submit').submit(() => {
            setChosenAttributes();

            updateView();

            return false;
        });

        $chooseBoonsAndBanes.unbind('submit').submit(() => {
            setChosenBoons();
            setChosenBanes();

            updateView();

            return false;
        });

        $btnReset.unbind('click').click(() => {
            switch (currentPage) {
            case Page.RaceArchetype:
                if (hasChosenRace()) {
                    resetChosenRace();
                    resetChosenArchetype();
                    resetAbilities();
                }
                break;
            case Page.Attributes:
                if (hasChosenAttributes()) resetChosenAttributes();
                break;
            case Page.BoonsBanes:
                if (hasChosenBoons()) resetChosenBoons();
                if (hasChosenBanes()) resetChosenBanes();
                break;
            }

            updateView();
        });

        $characterNext.unbind('submit').submit(() => {
            switch (currentPage) {
            case Page.RaceArchetype:
                showChooseAttributesPage();
                break;
            case Page.Attributes:
                showChooseBoonsBanesPage();
                break;
            }

            return false;
        });

        $characterComplete.unbind('click submit').click(() => {
            if (!hasChosenName()) {
                flashCharacterName();
            }
        }).submit(() => {
            if (!isValid()) return false;

            $btnComplete.prop('disabled', true).addClass('waiting');

            var attrs = chosenAttributes.reduce((result, attribute) => {
                result[attribute.name] = attribute.value;
                return result;
            }, {});

            var boons = {};

            boons = chosenBoonsGeneral.reduce((result, boon) => {
                result[boon.id] = boon.ranks;
                return result;
            }, boons);

            boons = chosenBoonsFaction.reduce((result, boon) => {
                result[boon.id] = boon.ranks;
                return result;
            }, boons);

            boons = chosenBoonsRace.reduce((result, boon) => {
                result[boon.id] = boon.ranks;
                return result;
            }, boons);

            boons = chosenBoonsArchetype.reduce((result, boon) => {
                result[boon.id] = boon.ranks;
                return result;
            }, boons);

            var banes = {};

            banes = chosenBanesGeneral.reduce((result, bane) => {
                result[bane.id] = bane.ranks;
                return result;
            }, banes);

            banes = chosenBanesFaction.reduce((result, bane) => {
                result[bane.id] = bane.ranks;
                return result;
            }, banes);

            banes = chosenBanesRace.reduce((result, bane) => {
                result[bane.id] = bane.ranks;
                return result;
            }, banes);

            banes = chosenBanesArchetype.reduce((result, bane) => {
                result[bane.id] = bane.ranks;
                return result;
            }, banes);

            var character = {
                loginToken: loginToken,
                name: chosenName,
                faction: chosenFaction.name,
                race: chosenRace.name,
                archetype: chosenArchetype.name,
                attributes: attrs,
                boons: boons,
                banes: banes
            };

            var options: JQueryAjaxSettings = {};
            options.url = getSecureSelectedServerApiUrl() + '/characters';
            options.type = 'POST';
            options.contentType = 'application/json; charset=utf-8';
            options.data = JSON.stringify(character);
            options.success = result => {
                $btnComplete.prop('disabled', false).removeClass('waiting');

                if (result && result.results) {
                    if (result.results.success && result.character && result.character.id) {
                        $characterCreation.fadeOut().promise().done(() => {
                            beginConnect(result.character);
                        });
                    } else {
                        showModal(createErrorModal(result.results.join(' ')));
                    }
                } else {
                    showModal(createErrorModal('An unknown error occurred.'));
                }
            };
            options.error = (xhr, status, err) => {
                $btnComplete.prop('disabled', false).removeClass('waiting');

                showModal(createErrorModal(err));
            };
            $.ajax(options);

            return false;
        });

        $btnRaceArchetypePage.unbind('click').click(() => {
            showChooseRaceArchetypePage();
        });

        $btnAttributesPage.unbind('click').click(() => {
            showChooseAttributesPage();
        });

        $btnBoonsBanesPage.unbind('click').click(() => {
            showChooseBoonsBanesPage();
        });

        $btnBack.unbind('click').click(() => {
            if (currentPage >= Page.RaceArchetype) {
                resetChosenFaction();

                showChooseFactionPage();
            } else {
                showBackground($bgDefault);

                $characterCreation.fadeOut(() => {
                    if ($characters.children().length) {
                        showCharacterSelect();
                    } else {
                        showServerSelection();
                    }
                });
            }
        });
    }

    /* End Character Creation */

    if (typeof cuAPI !== 'undefined') {
        cuAPI.OnInitialized(initialize);

        cuAPI.OnServerConnected((isConnected) => {
            if (selectedServer && isConnecting && !isConnected) {
                isConnecting = false;

                queueShowModal(createErrorModal('Failed connecting to server.'));

                tryFetchCharacters(selectedServer).done(showCharacterSelectionOrCreation);
            }
        });
    } else {
        $(initialize);
    }
}
