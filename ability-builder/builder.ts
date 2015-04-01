/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../ability-crafting/networks/physicalNetwork.ts" />
/// <reference path="../vendor/soundjs.d.ts" />

module AbilityBuilder {
    /* Constants */

     var ABILITY_ICONS = [
        'default.jpg',
        'cast-b.jpg',
        'cast-g.jpg',
        'cast-p.jpg',
        'cast-r.jpg',
        'charging-b.jpg',
        'charging-g.jpg',
        'charging-p.jpg',
        'charging-r.jpg',
        'shout-lead.jpg',
        'shout-p.jpg',
        'shower.jpg',
        'lightning-mace.jpg',
        'kameha.jpg',
        'hammer-smash.jpg',
        'energy-sword.jpg',
        'eclipse.jpg',
        'doom-swirl.jpg',
        'all-heal.jpg',
        'earth-Ball.jpg',
        'earth-Cone.jpg',
        'earth-Dart.jpg',
        'earth-ExplosiveBall.jpg',
        'earth-LargeBall.jpg',
        'earth-LargeDart.jpg',
        'earth-SmallDart.jpg',
        'earth-Strike.jpg',
        'earth-Wall.jpg',
        'earth-Wave.jpg',
        'f-Bash.jpg',
        'f-DazingStrike.jpg',
        'f-DespeateResiliance.jpg',
        'f-GiftofSpeed.jpg',
        'f-Grapple.jpg',
        'f-HeavyStrike.jpg',
        'f-LaceratingSlash.jpg',
        'f-LegSlash.jpg',
        'f-powerstrike.jpg',
        'f-quickstrike.jpg',
        'fire-Ball.jpg',
        'fire-Cone.jpg',
        'fire-Dart.jpg',
        'fire-ExplosiveBall.jpg',
        'fire-LargeBall.jpg',
        'fire-LargeDart.jpg',
        'fire-SmallDart.jpg',
        'fire-Strike.jpg',
        'fire-Wall.jpg',
        'fire-Wave.jpg',
        'h-DrainBlood.jpg',
        'h-HealingBall.jpg',
        'h-HealingFountain.jpg',
        'h-HealingStrike.jpg',
        'h-HealingTouch.jpg',
        'h-HealingWave.jpg',
        'h-QuickEscape.jpg',
        'h-RestoreBlood.jpg',
        'h-TransfuseBlood.jpg',
        'status-Fatigue.jpg',
        'water-Ball.jpg',
        'water-Cone.jpg',
        'water-Dart.jpg',
        'water-ExplosiveBall.jpg',
        'water-LargeBall.jpg',
        'water-LargeDart.jpg',
        'water-SmallDart.jpg',
        'water-Strike.jpg',
        'water-Wall.jpg',
        'water-Wave.jpg'
    ];

    /* jQuery Elements */

    var $window = $(window);
    var $document = $(document);
    var $btnClose = $('.window-close');
    export var $builder = $('#builder');
    var $abilityName = $('#ability-name');
    var $abilityNotes = $('#ability-notes');
    var $stats = $('#stats');
    var $network = $('#network');
    var $btnSelectIcon = $('#btn-select-icon');
    var $btnReset = $('#btn-reset');
    var $btnBuild = $('#btn-build');
    var $selectIconModal = $('#select-icon-modal');
    var $componentSelectionModal = $('#component-selection-modal');
    var $errorModal = $('#error-modal');
    var $errorModalMessage = $('#error-modal-message');
    var $errorModalErrors = $('#error-modal-errors');
    var $btnCloseErrorModal = $('#btn-close-error-modal');
    var $abilityNameRequired = $('#ability-name-required');
    var $abilityIconRequired = $('#ability-icon-required');
    var $abilityComponentsRequired = $('#ability-components-required');
    var $hiddenLayer = null;

    /* Variables */

    var loginToken = '';
    var characterID = '';
    var nameIsAutogen = true;

    var selectedAbilityIcon = '';

    var networks = [physical, magic, comboA, comboB, rangeA, rangeB, shout, song];

    var trainedComponents = [];

    var selectedSlot = null;
    var selectedComponents = [];

    var networkOffset = $network.offset();

    var currentScale = 1;
    var scaleFactor = 0.1;
    var minScale = 0.5;
    var maxScale = 1.5;
    var networkLocation = { x: 0, y: 0 };
    var previousNetworkLocation = { x: 0, y: 0 };
    var mouseLocation = { x: 0, y: 0 };
    var previousMouseLocation = mouseLocation;

    var defaultNetwork = new ComponentNetwork({
        name: 'default',
        slots: [
            new ComponentSlot({
                type: ComponentType.Primary,
                subType: ComponentSubType.None,
                x: 6,
                y: 5
            })
        ]
    });

    var currentNetwork, previousCurrentNetwork;

    var ADJECTIVE_LIST = [
        'Adamant',
        'Adroit',
        'Adumbrated',
        'Alluring',
        'Animalistic',
        'Antediluvian',
        'Archaic',
        'Authentic',
        'Awesome',
        'Backwards',
        'Baleful',
        'Bellicose',
        'Bilious',
        'Bitter',
        'Blasphemous',
        'Bleak',
        'Blue',
        'Brave',
        'Brutish',
        'Bulbous',
        'Bumpy',
        'Calamitous',
        'Catawampus',
        'Caustic',
        'Cold-brewed',
        'Comely',
        'Corpulent',
        'Consuming',
        'Crapulous',
        'Crazy',
        'Cringeworthy',
        'Cruel',
        'Daft',
        'Daunting',
        'Deceptive',
        'Decrepit',
        'Deep',
        'Defamatory',
        'Demoniac',
        'Dirty',
        'Disappointed',
        'Doughty',
        'Draconian',
        'Effervescent',
        'Egregious',
        'Electric',
        'Elusive',
        'Enchanting',
        'Endemic',
        'Enduring',
        'Enormous',
        'Ephemeral',
        'Excruciating',
        'Execrable',
        'Existential',
        'Fantastic',
        'Fastidious',
        'Feckless',
        'Fecund',
        'Fierce',
        'Fleeting',
        'Fortuitous',
        'Fractious',
        'Friendly',
        'Fungal',
        'Fuzzy',
        'Garrulous',
        'Gelatinous',
        'Gibbous',
        'Gleaming',
        'Greasy',
        'Groovy',
        'Grueling',
        'Grumpy',
        'Guileless',
        'Hairy',
        'Hard',
        'Hilarious',
        'Hip',
        'Hissing',
        'Histrionic',
        'Hot',
        'Hubristic',
        'Husky',
        'Ill-Conceived',
        'Illusive',
        'Improbable',
        'Inconsequential',
        'Insidious',
        'Insolent',
        'Intransigent',
        'Ironic',
        'Irksome',
        'Itchy',
        'Jocular',
        'Judicious',
        'Juicy',
        'Lachrymose',
        'Limp',
        'Loquacious',
        'Loving',
        'Lugubrious',
        'Luminous',
        'Mad',
        'Manic',
        'Meaty',
        'Mendacious',
        'Menial',
        'Mesmeric',
        'Moist',
        'Narcissistic',
        'Naughty',
        'Nefarious',
        'Nervous',
        'Non-Euclidean',
        'Noxious',
        'Nutritious',
        'Obnoxious',
        'Obtuse',
        'Obvious',
        'Octarine',
        'Odd',
        'Outlandish',
        'Parasitic',
        'Parsimonious',
        'Pedantic',
        'Pendulous',
        'Perilous',
        'Pernicious',
        'Pervasive',
        'Petulant',
        'Platitudinous',
        'Prickly',
        'Puckish',
        'Pugnacious',
        'Querulous',
        'Quilted',
        'Radical',
        'Raucous',
        'Redolent',
        'Repulsive',
        'Resounding',
        'Resplendent',
        'Ripe',
        'Ruminative',
        'Sad',
        'Sagacious',
        'Seaworthy',
        'Serendipitous',
        'Serpentine',
        'Shaggy',
        'Slippery',
        'Smarmy',
        'Spasmodic',
        'Strident',
        'Succulent',
        'Sundered',
        'Sisyphean',
        'Taciturn',
        'Tenacious',
        'Testy',
        'Throbbing',
        'Tight',
        'Titillating',
        'Tremulous',
        'Trenchant',
        'Tubular',
        'Turbulent',
        'Turgid',
        'Ubiquitous',
        'Unholy',
        'Unlikely',
        'Unrelenting',
        'Unwise',
        'Verdant',
        'Visceral',
        'Voluble',
        'Voracious',
        'Warty',
        'Well-mannered',
        'Wet',
        'Wheedling',
        'Whimsical',
        'Wicked',
        'Withering',
        'Wretched',
        'Wondrous',
        'Zealous'
    ];

    /* Audio */

    //var audioPath = "../audio/ability-builder/";
    var soundAddSelection = "UI_AbilityCrafting_AddSelection";
    var soundSidePanel_Open = "UI_AbilityCrafting_SidePanel_Open";
    var soundBuildAbility1 = "UI_AbilityCrafting_Build_v1_01";
    var soundBuildAbility2 = "UI_AbilityCrafting_Build_v1_02";
    var soundBuildAbility3 = "UI_AbilityCrafting_Build_v1_03";
    var soundBuildAbility4 = "UI_AbilityCrafting_Build_v1_04";
    var soundBuildAbility5 = "UI_AbilityCrafting_Build_v1_05";
    
    var soundArrayBuildAbility = [soundBuildAbility1,
        soundBuildAbility2,
        soundBuildAbility3,
        soundBuildAbility4,
        soundBuildAbility5
    ];

    /*var soundsAbilityBuild = [
        { id: "soundBuildAbility1", src: "UI_AbilityCrafting_Build_v1_01" },
        { id: "soundBuildAbility2", src: "UI_AbilityCrafting_Build_v1_02" },
        { id: "soundBuildAbility3", src: "UI_AbilityCrafting_Build_v1_03" },
        { id: "soundBuildAbility4", src: "UI_AbilityCrafting_Build_v1_04" },
        { id: "soundBuildAbility5", src: "UI_AbilityCrafting_Build_v1_05" },
    ];
    */


    function loadSound() {      
        createjs.Sound.registerSound("../audio/ability-builder/UI_AbilityCrafting_AddSelection_v1_01.ogg", soundAddSelection);
        createjs.Sound.registerSound("../audio/ability-builder/UI_AbilityCrafting_SidePanel_Open_v1_01.ogg", soundSidePanel_Open);
        createjs.Sound.registerSound("../audio/ability-builder/UI_AbilityCrafting_Build_v1_01.ogg", soundBuildAbility1);
        createjs.Sound.registerSound("../audio/ability-builder/UI_AbilityCrafting_Build_v1_02.ogg", soundBuildAbility2);
        createjs.Sound.registerSound("../audio/ability-builder/UI_AbilityCrafting_Build_v1_03.ogg", soundBuildAbility3);
        createjs.Sound.registerSound("../audio/ability-builder/UI_AbilityCrafting_Build_v1_04.ogg", soundBuildAbility4);
        createjs.Sound.registerSound("../audio/ability-builder/UI_AbilityCrafting_Build_v1_05.ogg", soundBuildAbility5);
        //load an array for random sound option
    }

    function playSound(soundID: string) {
        createjs.Sound.play(soundID);
    }

    /* Functions */

    function ignoreEvent(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function toggleErrorClassRepeatedly($element) {
        setTimeout(() => {
            $element.addClass('error');
        }, 0);

        setTimeout(() => {
            $element.removeClass('error');
        }, 100);

        setTimeout(() => {
            $element.addClass('error');
        }, 200);

        setTimeout(() => {
            $element.removeClass('error');
        }, 300);

        setTimeout(() => {
            $element.addClass('error');
        }, 400);
    }

    function getPrimaryComponent(ability) {
        if (!ability) return null;
        return getSelectedPrimaryComponent();
    }

    function getSelectedPrimaryComponent() {
        for (var i = 0, length = selectedComponents.length; i < length; i++) {
            var component = selectedComponents[i];

            if (component.type === ComponentType.Primary) {
                return component;
            }
        }
    }

    function getSecondaryComponent(ability) {
        if (!ability) return null;
        return getSelectedSecondaryComponent();
    }

    function getSelectedSecondaryComponent() {
        for (var i = 0, length = selectedComponents.length; i < length; i++) {
            var component = selectedComponents[i];

            if (component.type === ComponentType.Secondary) {
                return component;
            }
        }
    }

    function selectRandomAdjective() {
        var selectedIndex = Math.floor((Math.random() * ADJECTIVE_LIST.length));
        return ADJECTIVE_LIST[selectedIndex];
    }

    function generateRandomAbilityName() {
        var primary = getSelectedPrimaryComponent();
        var secondary = getSelectedSecondaryComponent();
        if (!primary || !secondary) {
            return '';
        }

        var s1, s2, s3, s4;
        s1 = ComponentSubType[primary.subType].replace(/([A-Z])/g, ' $1');

        s2 = secondary.name;
        if (secondary.name.indexOf('e', secondary.name.length - 1) !== -1) {
            s2 = secondary.name.slice(0, -1);
        }
        s3 = primary.name;
        if (primary.name.indexOf('ness', primary.name.length - 4) !== -1) {
            s3 = primary.name.slice(0, -4);
        }

        s4 = selectRandomAdjective();
        var whole = s2.concat('ing').concat(s1).concat(' of ').concat(s4).concat(' ').concat(s3).concat('ness');
        return whole;
    }

    function tryBuildAbility() {
        var abilityName = $abilityName.val();

        var hasAbilityName = abilityName.length > 0;
        nameIsAutogen = nameIsAutogen || !hasAbilityName;

        $abilityName.removeClass('error');

        if (!hasAbilityName) {
            $abilityNameRequired.fadeIn();

            toggleErrorClassRepeatedly($abilityName);
        } else {
            $abilityNameRequired.hide();
        }

        var hasAbilityIcon = selectedAbilityIcon.length > 0;

        $btnSelectIcon.removeClass('error');

        if (!hasAbilityIcon) {
            $abilityIconRequired.fadeIn();

            toggleErrorClassRepeatedly($btnSelectIcon);
        } else {
            $abilityIconRequired.hide();
        }

        var abilityNotes = $abilityNotes.val();

        var primaryComponent = null;
        var secondaryComponent = null;

        selectedComponents.forEach(component => {
            if (_.isNull(primaryComponent)) {
                var isRootComponent = component.slot.parents.length === 0;
                var isPrimaryComponent = component.type === ComponentType.Primary;
                if (isRootComponent && isPrimaryComponent) {
                    primaryComponent = component;
                    return;
                }
            }

            if (_.isNull(secondaryComponent)) {
                var isSecondaryComponent = component.type === ComponentType.Secondary;
                if (isSecondaryComponent) {
                    secondaryComponent = component;
                    return;
                }
            }
        });

        var hasPrimaryComponent = !_.isNull(primaryComponent);

        var hasSecondaryComponent = !_.isNull(secondaryComponent);

        $network.removeClass('error');

        if (!hasPrimaryComponent || !hasSecondaryComponent) {
            $abilityComponentsRequired.fadeIn();
            
            toggleErrorClassRepeatedly($network);
        } else {
            $abilityComponentsRequired.hide();
        }

        if (hasAbilityName && hasAbilityIcon && hasPrimaryComponent && hasSecondaryComponent) {
            $btnBuild.prop('disabled', true).addClass('waiting');

            buildAbility({
                loginToken: loginToken,
                characterID: characterID,
                name: abilityName,
                notes: abilityNotes,
                icon: selectedAbilityIcon,
                rootComponentSlot: getComponentSlotViewModel(primaryComponent)
            }).then(ability => {
                $btnBuild.prop('disabled', false).removeClass('waiting');

                if (ability && ability.id && typeof cuAPI === 'object') {
                    abilityCreated(ability);
                }
            }, xhr => {
                $btnBuild.prop('disabled', false).removeClass('waiting');
                if (xhr.responseText) {
                    showErrorModal('Building ability failed!', [xhr.responseText]);
                } else {
                    var errors = [];
                    var json = xhr.responseJSON;
                    if (json) {
                        for (var key in json) {
                            if (json.hasOwnProperty(key)) {
                                errors.push(json[key]);
                            }
                        }
                    }
                    showErrorModal('Building ability failed!', errors);
                }
            });
        }
    }

    function abilityCreated(ability) {
        console.log('ability created ' + ability.id, ability);

        /*Audio playback for ability creation
        */
        var randomSound = Math.floor(Math.random() * (soundArrayBuildAbility.length));
        playSound(soundArrayBuildAbility[randomSound]);
        //playSound(soundBuildAbility1);

        var primaryComponent = getPrimaryComponent(ability);
        var primaryBaseComponentID = primaryComponent && primaryComponent.baseComponentID ? primaryComponent.baseComponentID.toString(16) : '';

        var secondaryComponent = getSecondaryComponent(ability);
        var secondaryBaseComponentID = secondaryComponent && secondaryComponent.baseComponentID ? secondaryComponent.baseComponentID.toString(16) : '';

        cuAPI.AbilityCreated(ability.id.toString(16), primaryBaseComponentID, secondaryBaseComponentID, JSON.stringify(ability));

        // TODO: what should the flow here be?
        /*
        cuAPI.ReleaseInputOwnership();
        cuAPI.HideUI('ability-builder');
        cuAPI.ShowAbility(ability.id.toString());
        cuAPI.ShowUI('spellbook');
        */

        resetComponentNetwork();
    }

    function getComponentSlotViewModel(component) {
        var children = [];

        if (component.slot && component.slot.children && component.slot.children.length) {
            component.slot.children.forEach(slot => {
                if (slot.component) {
                    children.push(getComponentSlotViewModel(slot.component));
                }
            });
        }

        return {
            baseComponentID: component.baseComponentID,
            componentID: component.id,
            children: children
        };
    }

    function buildAbility(ability) {
        if (!ability.loginToken || !ability.characterID) return Promise.reject();

        return new Promise((resolve, reject) => {
            console.log('build ability', ability);

            var options: JQueryAjaxSettings = {};
            options.url = cu.SecureApiUrl('api/craftedabilities');
            options.type = 'POST';
            options.contentType = 'application/json; charset=utf-8';
            options.data = JSON.stringify(ability);
            options.success = resolve;
            options.error = reject;
            $.ajax(options);
        });
    }

    function showErrorModal(message, errors?) {
        addHiddenLayer();
        ignoreHiddenLayerEvents();

        $builder.addClass('error');

        $errorModalMessage.text(message);

        $errorModalErrors.empty();

        if (errors && errors.length) {
            errors.forEach(error => {
                $('<li>').text(error).appendTo($errorModalErrors);
            });
        }

        $errorModal.fadeIn();
    }

    function hideErrorModal(e) {
        e.preventDefault();
        e.stopPropagation();

        removeHiddenLayer();

        $builder.removeClass('error');

        $errorModal.fadeOut();

        return false;
    }

    function loadTrainedComponents() {
        if (!loginToken || !characterID) return null;

        $network.addClass('loading');

        var options: JQueryAjaxSettings = {};
        options.url = cu.SecureApiUrl('api/craftedabilities/components');
        options.type = 'GET';
        options.contentType = 'application/json; charset=utf-8';
        options.data = {
            loginToken: loginToken,
            characterID: characterID
        };
        options.success = components => {
            $network.removeClass('loading');

            components.forEach(addTrainedComponent);
        };
        options.error = () => {
            showErrorModal('Failed loading trained components. Please try again later.');
        };

        return $.ajax(options);
    }

    function addTrainedComponent(component) {
        var trainedComponent = new Component({
            id: component.id,
            baseComponentID: component.baseComponentID,
            type: component.type,
            subType: component.subType,
            name: component.name,
            description: component.description,
            icon: component.icon,
            stats: component.stats,
            tags: mapTags(component.tags),
            tagConstraints: mapTagConstraints(component.tagConstraints),
            isTrained: true
        }).createElement().appendTo($componentSelectionModal);

        trainedComponent.slot = new ComponentSlot({
            type: component.type,
            subType: component.subType,
            component: trainedComponent,
            x: 0,
            y: 0
        }).createElement().on('mousedown', e => chooseComponent(e, trainedComponent)).appendTo($componentSelectionModal);

        trainedComponents.push(trainedComponent);
    }

    function mapTags(tags) {
        return tags.map(tag => AbilityTags[tag]);
    }

    function mapTagConstraints(tagConstraints) {
        return tagConstraints.map(tagConstraint => {
            var ct: string = tagConstraint.constraintType.toString();
            var constraintType = TagConstraintType[ct];
            var tags = tagConstraint.tags.map(tag => AbilityTags[tag]);
            return new TagConstraint(constraintType, tags);
        });
    }

    function createAbilityIcon(icon) {
        $('<div>').addClass('ability-icon').css('background-image', 'url(' + icon + ')').click(e => {
            return selectAbilityIcon(e, icon);
        }).appendTo($selectIconModal);
    }

    function selectAbilityIcon(e, icon) {
        selectedAbilityIcon = icon;

        if (icon && icon.length) {
            setSelectIcon(icon);
            cuAPI.Fire("iconselect");
            $abilityIconRequired.hide();
        } else {
            $abilityIconRequired.fadeIn();
        }

        return hideSelectIconModal(e);
    }

    function setSelectIcon(icon) {
        $btnSelectIcon.removeClass('error').css('background-image', 'url(' + icon + ')');
    }

    function showSelectIconModal(e) {
        e.preventDefault();
        e.stopPropagation();

        $selectIconModal.stop().fadeIn({ duration: 200 }).scrollTop(0);

        //Audio -- play panel open sound
        playSound(soundSidePanel_Open);

        return false;
    }

    function hideSelectIconModal(e?) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        $selectIconModal.stop().fadeOut({ duration: 150 });

        return false;
    }

    function toggleSelectIconModal(e) {
        $selectIconModal.is(':visible') ? hideSelectIconModal(e) : showSelectIconModal(e);
    }

    function showComponentSelectionModal(e) {
        //Audio -- play a sound for the pop out window
        playSound(soundSidePanel_Open);

        e.preventDefault();
        e.stopPropagation();

        if (selectedSlot && selectedSlot.tooltip) selectedSlot.tooltip.hide();

        var offset = $(e.target).offset();

        createComponentSelectionElements();

        $componentSelectionModal.css({
            top: (offset.top + 32) * 2,
            left: (offset.left + 32) * 2
        }).stop().fadeIn({ duration: 200 }).scrollTop(0);

        return false;
    }

    function hideComponentSelectionModal() {
        $componentSelectionModal.stop().fadeOut({ duration: 150 });
    }

    function createComponentSelectionElements() {
        var selectedComponentIDs = selectedComponents.map(component => component.id);

        var filteredComponents = trainedComponents.slice(0).filter(component => {
            if (selectedComponentIDs.indexOf(component.id) !== -1) return false;

            var hasValidTags = selectedComponents.filter(c => !c.tagCheck(component.tags)).length === 0;

            return hasValidTags;
        });

        console.log('find components: ' + ComponentType[selectedSlot.type] + ' ' + (selectedSlot.parents.length === 0 ? 'N/A' : ComponentSubTypeValues.filter(t => (selectedSlot.subType & t) === t).map(t => ComponentSubType[t]).join(', ')));

        if (selectedSlot) {
            filteredComponents = filteredComponents.filter(component => {
                if (!component || component.type !== selectedSlot.type) return false;
                if (selectedSlot.type !== ComponentType.IndependantModal && selectedSlot.parents.length === 0) return true;
                return selectedSlot[selectedSlot.originalSubType ? 'hasOriginalType' : 'hasSubType'](component.subType);
            });
        }

        $componentSelectionModal.children().hide();

        new ComponentSlot({
            type: selectedSlot.type,
            subType: ComponentSubType.None,
            x: 1,
            y: 1
        }).createElement().on('mousedown', e => chooseComponent(e, undefined)).appendTo($componentSelectionModal);

        var x = 6; // account for 1 reset slot
        var y = 1;
        var maxX = 30;

        filteredComponents.forEach(component => {
            if (x >= maxX) {
                x = 1;
                y += 5;
            }

            if (component.slot) {
                component.slot.x = x;
                component.slot.y = y;
                component.slot.updateElement().show();
                component.updateElement().show();
            }

            x += 5;
        });
    }

    function chooseComponent(e, component) {
        e.preventDefault();
        e.stopPropagation();

        hideComponentSelectionModal();

        if (!selectedSlot || (!selectedSlot.component && !component)) return false;

        if (selectedSlot && selectedSlot.type === ComponentType.Primary && selectedSlot.component && selectedSlot.isRoot()) {
            selectedComponents = [];
        } else {
            removeSelectedComponentFromSlot(selectedSlot);
        }

        if (component) {
            //Audio -- plays a sound for when you select an ability component from the popup menu
            playSound(soundAddSelection);

            console.log('chosen component: ' + ComponentType[component.type] + ' ' + ComponentSubType[component.subType]);

            var clone = component.clone();

            selectedComponents.push(clone);

            clone.setSlot(selectedSlot);

            selectedSlot.setComponent(clone);

            clone.createElement().appendTo(selectedSlot.parent());
        } else {
            console.log('reset chosen component.');
        }

        if (selectedComponents.length === 0) {
            showDefaultNetwork();
        } else {
            showPotentialNetwork();
        }

        updateStats();

        if (nameIsAutogen) {
            $abilityName.val(generateRandomAbilityName());
        }

        var hasComponents = selectedComponents.length > 0;

        if (hasComponents) {
            $network.removeClass('error');

            $abilityComponentsRequired.hide();
        }

        if (component) {
            console.log("FIRE: chosen something");

            if (component.type === ComponentType.Primary) {
                console.log("FIRE: primary chosen");
                cuAPI.Fire("primarychosen");

            } else if (component.type === ComponentType.Secondary) {
                console.log("FIRE: Secondary chosen");
                cuAPI.Fire("secondarychosen");
            }
        }

        return false;
    }

    function showDefaultNetwork() {
        setCurrentNetwork(defaultNetwork.clone());
    }

    function showPotentialNetwork() {
        var potentialNetworks = getPotentialNetworks();

        if (potentialNetworks.length === 0) {
            showDefaultNetwork();
            return;
        }

        console.log('potential networks: ' + potentialNetworks.map(n => n.name).join(', '));

        var network;
        potentialNetworks.forEach(n => {
            if (network) {
                network = network.merge(n.clone());
            } else {
                network = n.clone();
            }
        });

        setCurrentNetwork(network);
    }

    function setCurrentNetwork(network) {
        console.log('set current network: ' + (network.name || ''));

        previousCurrentNetwork = currentNetwork;

        currentNetwork = network;

        currentNetwork.createElement();

        updateCurrentNetwork();

        if (selectedComponents && selectedComponents.length) {
            var availableSlots = currentNetwork.slots.slice(0);

            selectedComponents.forEach(component => {
                var depth = component.slot.depth();

                for (var i = availableSlots.length - 1; i >= 0; i--) {
                    var slot = availableSlots[i];

                    if (slot &&
                        slot.isSameType(component.type) &&
                        slot.hasSubType(component.subType) &&
                        slot.isSameDepth(depth)) { // slot.isSameLocation(component.slot.x, component.slot.y)
                        slot.setComponent(component);

                        component.setSlot(slot).createElement().appendTo(slot.parent());

                        availableSlots.splice(i, 1);

                        break;
                    }
                }
            });
        }

        currentNetwork.slots.forEach(slot => {
            var previousSlot = getSlotFromPreviousCurrentNetwork(slot);
            if (slot.hasComponent()) {
                if (previousSlot) previousSlot.queuedAnimation = 'show';
                slot.queuedAnimation = 'show';
            } else {
                if (slot.allParentsHaveComponents()) {
                    if (previousSlot && previousSlot.isVisible()) {
                        previousSlot.queuedAnimation = 'show';
                        slot.queuedAnimation = 'show';
                    } else {
                        slot.queuedAnimation = 'fadeIn';
                    }
                } else {
                    if (previousSlot && previousSlot.isVisible()) {
                        previousSlot.queuedAnimation = 'fadeOut';
                    }
                    slot.queuedAnimation = slot.isRoot() ? 'show' : 'hide';
                }
            }
        });

        if (previousCurrentNetwork) previousCurrentNetwork.remove();

        currentNetwork.hide().appendTo($network);

        currentNetwork.slots.forEach(slot => {
            slot.off('mousedown').on('mousedown', e => {
                selectedSlot = slot;

                if (e.button == 2) {
                    if (selectedSlot && selectedSlot.tooltip) selectedSlot.tooltip.hide();

                    return chooseComponent(e, undefined);
                }

                return true;
            }).off('click').on('click', e => {
                showComponentSelectionModal(e);
            });

            slot.updateElement().tryPlayQueuedAnimation();
        });
    }

    function removeSelectedComponentFromSlot(slot) {
        if (!slot || !slot.component) return;

        var index = selectedComponents.indexOf(slot.component);

        if (index !== -1) selectedComponents.splice(index, 1);

        slot.component.remove();

        slot.setComponent(undefined);

        if (slot.children) {
            slot.children.forEach(childSlot => {
                removeSelectedComponentFromSlot(childSlot);
            });
        }
    }

    function getPotentialNetworks() {
        if (!selectedComponents || !selectedComponents.length) return networks;
        return networks.filter(network => {
            return selectedComponents.filter(component => {
                return component.slot && network.hasAnyCompatibleSlot(component);
            }).length === selectedComponents.length;
        });
    }

    function getSlotFromPreviousCurrentNetwork(slot) {
        if (!slot || !previousCurrentNetwork) return false;

        var previousSlot;
        for (var i = 0, length = previousCurrentNetwork.slots.length; i < length; i++) {
            previousSlot = previousCurrentNetwork.slots[i];

            if (previousSlot.isSameType(slot.type) &&
                previousSlot.isSameLocation(slot.x, slot.y) &&
                previousSlot.isSameDepth(slot.depth())) {
                return previousSlot;
            }
        }

        return false;
    }

    function updateCurrentNetwork() {
        if (!currentNetwork) return;

        var x = networkLocation.x;
        var y = networkLocation.y;

        var compat = ['-o-', '-ms-', '-moz-', '-webkit-', ''];
        var newCss = {};
        for (var i = compat.length - 1; i; i--) {
            newCss[compat[i] + 'transform-origin'] = (128 - x) + 'px ' + (128 - y) + 'px';
            newCss[compat[i] + 'transform'] = 'translate(' + x + 'px, ' + y + 'px) scale(' + currentScale + ')';
        }
        currentNetwork.$network.css(newCss);
    }

    function addHiddenLayer() {
        if (!$hiddenLayer) {
            $hiddenLayer = $('<div>').addClass('hidden-layer').css({
                'z-index': 9999,
                position: 'absolute',
                top: 0,
                left: 0,
                width: $window.width(),
                height: $window.height()
            }).appendTo($network.parent());
        }
    }

    function bindHiddenLayerEvents() {
        if (!$hiddenLayer) return;

        $hiddenLayer.on('mouseover', ignoreEvent).on('mouseout', ignoreEvent).on('mousemove', e => {
            e.preventDefault();
            e.stopPropagation();

            if (!currentNetwork || !currentNetwork.$network) return false;

            previousMouseLocation = mouseLocation;

            mouseLocation = { x: e.pageX - networkOffset.left, y: e.pageY - networkOffset.top };

            var diffMouseX = mouseLocation.x - previousMouseLocation.x;
            var diffMouseY = mouseLocation.y - previousMouseLocation.y;

            previousNetworkLocation = networkLocation;

            networkLocation = {
                x: networkLocation.x + diffMouseX,
                y: networkLocation.y + diffMouseY
            };

            var width = currentNetwork.$network.width();
            var height = currentNetwork.$network.height();

            if (networkLocation.x < -width) networkLocation.x = -width;
            else if (networkLocation.x > width) networkLocation.x = width;

            if (networkLocation.y < -height) networkLocation.y = -height;
            else if (networkLocation.y > height) networkLocation.y = height;

            updateCurrentNetwork();

            return false;
        });
    }

    function ignoreHiddenLayerEvents() {
        if (!$hiddenLayer) return;

        $hiddenLayer.on('mouseover', ignoreEvent).on('mouseout', ignoreEvent).on('mousemove', ignoreEvent);
    }

    function removeHiddenLayer() {
        if ($hiddenLayer) {
            $hiddenLayer.remove();
            $hiddenLayer = undefined;
        }
    }

    function updateStats() {
        $stats.empty();

        var combinedStats = selectedComponents.reduce((results, component) => {
            if (!component.stats) return results;

            for (var cs in component.stats) {
                if (component.stats.hasOwnProperty(cs)) {
                    var componentStat = component.stats[cs];
                    var smodType: string = componentStat.modType;
                    var modType = ValueModifierType[smodType];

                    if (results.hasOwnProperty(cs)) {
                        if (modType === ValueModifierType.Additive) {
                            results[cs].count++;
                            results[cs].value += componentStat.value;
                        } else if (modType === ValueModifierType.Multiplicative) {
                            results[cs].count++;
                            results[cs].multiplier += componentStat.value;
                        }
                    } else {
                        if (modType === ValueModifierType.Additive) {
                            results[cs] = { count: 1, value: componentStat.value, multiplier: 1 };
                        } else if (modType === ValueModifierType.Multiplicative) {
                            results[cs] = { count: 1, value: 0, multiplier: 1 + componentStat.value };
                        }
                    }
                }
            }

            return results;
        }, {});

        for (var combinedStat in combinedStats) {
            if (combinedStats.hasOwnProperty(combinedStat)) {
                var stat = combinedStats[combinedStat];

                if (stat.count <= 1) continue;

                var statName = combinedStat.charAt(0).toUpperCase() + combinedStat.substring(1).replace(/([A-Z])/g, ' $1');

                var value: any = stat.value * stat.multiplier;

                if (value % 1 !== 0) value = value.toFixed(2);

                $('<li>').text(statName + ': ' + value).appendTo($stats);
            }
        }
    }

    function hideAbilityBuilder(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        $builder.fadeOut(() => {
            if (typeof cuAPI === 'object') {
                cuAPI.HideUI('ability-builder');
                setTimeout(() => {
                    $builder.css({ display: 'block' });
                }, 100);
            }
        });

        return false;
    }

    function loadAbility(id) {
        if (!loginToken || !characterID) return Promise.reject();

        return new Promise((resolve, reject) => {
            var options: JQueryAjaxSettings = {};
            options.url = cu.SecureApiUrl('api/craftedabilities/' + id);
            options.type = 'GET';
            options.contentType = 'application/json; charset=utf-8';
            options.data = {
                loginToken: loginToken,
                characterID: characterID
            };
            options.success = ability => {
                resolve(mapAbility(ability));
            };
            options.error = reject;
            return $.ajax(options);
        });
    }

    function mapAbility(ability) {
        var componentSlots = mapComponentSlots([ability.rootComponentSlot], []);

        var components = getComponentsFromSlots(componentSlots);

        return {
            id: ability.id,
            name: ability.name,
            icon: ability.icon,
            notes: ability.notes,
            componentSlots: componentSlots,
            components: components
        };
    }

    function getComponentsFromSlots(componentSlots) {
        var components = [];

        componentSlots.forEach(slot => {
            if (!slot) return;

            if (slot.component) {
                components.push(slot.component);
            }

            if (slot.children) {
                components = components.concat(getComponentsFromSlots(slot.children));
            }
        });

        return components;
    }

    function mapComponentSlots(componentSlots, componentSlotParents) {
        return componentSlots.map(componentSlot => {
            if (!componentSlot) return null;

            var component = trainedComponents.filter(c => c.id === componentSlot.componentID)[0];

            if (!component) return null;

            var clonedComponent = component.clone();
            var clonedComponentSlot = component.slot.clone();

            clonedComponentSlot.parents = componentSlotParents;

            if (componentSlot.children && componentSlot.children.length) {
                clonedComponentSlot.children = mapComponentSlots(componentSlot.children, [clonedComponentSlot]);
            }

            clonedComponent.slot = clonedComponentSlot;
            clonedComponentSlot.component = clonedComponent;

            return clonedComponentSlot;
        }).filter(componentSlot => componentSlot != null);
    }

    function showAbility(ability) {
        selectedSlot = undefined;

        selectedComponents = ability.components;

        $abilityName.val(ability.name);
        $abilityNotes.val(ability.notes);
        setSelectIcon(ability.icon);

        showPotentialNetwork();

        cuAPI.RequestInputOwnership();
    }

    function handleMouseWheel(e) {
        var evt: any = e.originalEvent;

        var delta = evt.wheelDelta;

        currentScale += (delta > 0 ? 1 : -1) * scaleFactor;

        if (currentScale < minScale) currentScale = minScale;
        else if (currentScale > maxScale) currentScale = maxScale;

        updateCurrentNetwork();
    }

    function handleWindowMouseDown(e) {
        if ($errorModal.is(':visible')) return;

        mouseLocation = { x: e.pageX - networkOffset.left, y: e.pageY - networkOffset.top };

        $network.mousemove(evt => {
            evt.preventDefault();
            evt.stopPropagation();

            hideComponentSelectionModal();

            addHiddenLayer();
            bindHiddenLayerEvents();

            return false;
        });
    }

    function handleWindowMouseUp() {
        $network.unbind('mousemove');

        if (!$errorModal.is(':visible')) {
            removeHiddenLayer();
        }
    }

    function handleAbilityNameKeyUp() {
        var abilityName = $abilityName.val();

        var hasAbilityName = abilityName.length > 0;
        nameIsAutogen = !hasAbilityName;

        if (hasAbilityName) {
            $abilityName.removeClass('error');

            $abilityNameRequired.hide();
        }
    }

    function resetComponentNetwork() {
        $network.removeClass('error');

        $abilityNameRequired.hide();
        $abilityIconRequired.hide();
        $abilityComponentsRequired.hide();

        $abilityName.val('').removeClass('error');
        $abilityNotes.val('');

        setSelectIcon('');

        $stats.empty();

        selectedSlot = null;
        selectedComponents = [];
        selectedAbilityIcon = '';
        showDefaultNetwork();
        nameIsAutogen = true;

        hideComponentSelectionModal();
    }

    function handleResetButtonClick(e) {
        e.preventDefault();
        e.stopPropagation();

        resetComponentNetwork();

        return false;
    }

    function handleBuildButtonClick(e) {
        e.preventDefault();
        e.stopPropagation();

        tryBuildAbility();

        return false;
    }

    var inputOwnershipTimer: number;
    function handleInputOwnership(e: any) {
        if (e.type === "focus") {
            if (inputOwnershipTimer) {
                clearTimeout(inputOwnershipTimer);
                inputOwnershipTimer = null;
            } else {
                cuAPI.RequestInputOwnership();
            }
        } else {
            inputOwnershipTimer = setTimeout(() => {
                inputOwnershipTimer = null;
                cuAPI.ReleaseInputOwnership();
            }, 10);
        }
    }

    function initialize() {
        // Load sounds
        loadSound();

        $document.click(() => {
            hideSelectIconModal();
            hideComponentSelectionModal();
        });

        $document.on('contextmenu', ignoreEvent);

        $btnClose.click(hideAbilityBuilder);

        $btnSelectIcon.click(toggleSelectIconModal);

        $selectIconModal.click(ignoreEvent);

        $componentSelectionModal.click(ignoreEvent);

        $network.bind('mousewheel', handleMouseWheel);

        $window.mousedown(handleWindowMouseDown).mouseup(handleWindowMouseUp);

        $abilityName.keyup(handleAbilityNameKeyUp);

        $abilityName.focus(handleInputOwnership);
        $abilityNotes.focus(handleInputOwnership);
        $abilityName.blur(handleInputOwnership);
        $abilityNotes.blur(handleInputOwnership);

        $btnReset.click(handleResetButtonClick);
        $btnBuild.click(handleBuildButtonClick);

        $btnCloseErrorModal.click(hideErrorModal);

        ABILITY_ICONS.forEach(icon => {
            createAbilityIcon('../images/skills/' + icon);
        });

        if (typeof cuAPI === 'object') {
            cuAPI.OnInitialized(() => {
                if (typeof builderTourInitialize === 'function') {
                    builderTourInitialize();
                }

                // start hidden
                cuAPI.HideUI('ability-builder');
                $builder.hide();

                cuAPI.OnEditAbility(abilityID => {
                    if (trainedComponents.length === 0) {
                        showErrorModal('Failed to load ability components.');
                    } else {
                        loadAbility(abilityID).then(showAbility, () => {
                            showErrorModal('Failed to load ability.');
                        });
                    }
                });

                loginToken = cuAPI.loginToken;

                cuAPI.OnCharacterIDChanged(id => {
                    characterID = id;

                    var loadTrainedComponentsPromise = loadTrainedComponents();

                    if (loadTrainedComponentsPromise) loadTrainedComponentsPromise.done(showDefaultNetwork);

                    $builder.fadeIn();
                });
            });
        }
    }

    initialize();
}