var Castbar;
(function (Castbar) {

    var $progress = cu.FindElement('#progress');
    var $timeRemaining = cu.FindElement('#timeRemaining');
    var $bar = cu.FindElement('#bar');
    var $im = cu.FindElement('#im');
    var $abilityName = cu.FindElement('#abilityName');

    var loginToken = '';
    var characterID = '';
    var animate = null;
    var progval = 0;
    var totalCastTime = 0;
    var currentAbilityID = '';
    var decimalPlaces = 1;

    var currentStart = 0;
    var currentTrigger = 0;

    var abilities = [];
    var currentAbility = null;

    function log(message) {
        console.log(message + '\r\n', null);
    }

    function findById(source, id) {
        for (var i = 0; i < source.length; i++) {
            if (source[i].id === id) {
                return source[i];
            }
        }
    }

    function GetDuration(id) {
        var abil = findById(abilities, id);
        return abil.duration;
    }

    function logAbility(id) {
        log('logAbility: ' + id);
        log('abilities.len: ' + abilities.length);
        var abil = findById(abilities, id);
        for (var key in abil) {
            var value = abil[key];
            log(key + ': ' + value);
        }
    }

    function logAbil(a) {
        log('logAbil: ' + a);
        for (var key in a) {
            var value = a[key];
            log(key + ': ' + value);
        }
    }

    function cancelBar(message) {
        
        log('\r\n\r\n*****End current cast event***** server time: ' + cuAPI.serverTime);
        clearInterval(animate);
        animate = null;
        $progress.hide();
    }

    cu.gameClient.OnAbilityError(function (message) {
        log('\r\n\r\n*****HandleAbilityError***** server time: ' + cuAPI.serverTime);
        cancelBar();
    });

    var regressionDuration = 0;
    var regressionTriggerTime = 0;
    var regressionStart = 0;

    var focusing = function () {

        if (cuAPI.serverTime > regressionTriggerTime) {
            log('\r\n\r\n*****server time > regressionTriggerTime ***** server time: ' + cuAPI.serverTime);
            cancelBar();
        }

        var remainingTime = regressionTriggerTime - cuAPI.serverTime;
        var castingTime = cuAPI.serverTime - regressionStart;
        progval = 100 - ((castingTime / regressionDuration) * 100);

        var tRemaining = Math.max(0, (regressionDuration - castingTime)).toFixed(decimalPlaces);
        $timeRemaining.text(tRemaining);


        if (progval >= 100) {
            progval = 100;
        }

        if (0 > progval) {
            progval = 0;
        }

        $bar.css('width', progval + '%');

        if (0 == tRemaining) {
            cancelBar('no time remaining');
        }
    }

    function SetBarStyle(baseComponentID)
    {
        switch (GetBarClass(baseComponentID))
        {
            case 'regress':
                //$bar.css({
                //    background: "-webkit-linear-gradient(45deg, rgba(0,20,26,1) 1%,rgba(1,158,255,1) 41%,rgba(57,100,255,1) 100%)"
                //});
                $bar.css({
                    background: "-webkit-linear-gradient(left, rgba(30,87,153,1) 0%,rgba(89,148,202,1) 62%,rgba(108,167,218,0.7) 82%,rgba(125,185,232,0) 100%)"
                });
                break;
            case 'gcd':
                //$bar.css({
                //    background: "-webkit-linear-gradient(45deg, rgba(13,13,13,1) 1%,rgba(128,128,128,1) 41%,rgba(156,156,156,1) 100%)"
                //});
                $bar.css({
                    background: "-webkit-linear-gradient(left, rgba(92,92,92,1) 0%,rgba(146,146,146,1) 62%,rgba(163,163,163,0.7) 81%,rgba(179,179,179,0) 100%)"
                });
                break;
            default:
                $bar.css({
                    background: "-webkit-linear-gradient(45deg, #1a0000 1%,#490200 3%,#ff2600 41%,#ffa538 100%)"
                });
                break;
        }
    }

    function GetBarClass(baseComponentID)
    {
        //back to the progress bar
        if (-1 == baseComponentID) { //hopefully CSE wont use -1...
            return 'progress';
        }

        //catch the bandage...
        if ('000000000000001f' == currentAbility.id) {
            return 'regress';
        }

        if (!baseComponentID) {
            return 'gcd';
        }

        switch (baseComponentID) {
            case 97: //fountain
                return 'regress'; //channel type spell
            default:
                return 'gcd'; //assume its a GCD
        }
    }


    var casting = function () {

        if (cuAPI.serverTime > currentTrigger) {
            log('\r\n\r\n*****server time > current trigger***** server time: ' + cuAPI.serverTime);
            //cancelBar();

            clearInterval(animate);
            animate = null;

            logAbil(currentAbility);
            log('**currentAbility.stats:**')
            logAbil(currentAbility.stats);
            log('**currentAbility.rootComponentSlot:**')
            logAbil(currentAbility.rootComponentSlot);
            //log('**currentAbility.rootComponentSlot.children:**')
            //logAbil(currentAbility.rootComponentSlot.children);
            //log('**currentAbility.rootComponentSlot.children[0]:**')
            //logAbil(currentAbility.rootComponentSlot.children[0]);
            
            //regressionDuration = currentAbility.duration;
            regressionDuration = currentAbility.stats['recoveryTime'];            
            regressionTriggerTime = cuAPI.serverTime + regressionDuration;
            regressionStart = currentTrigger;

            log('\r\n\r\n*****Start new focusing interval*****    ID:' + currentAbility.id);
            var baseCmpId = -2;
            if ('000000000000001f' != currentAbility.id) { //bandage special case...
                baseCmpId = currentAbility.rootComponentSlot.children[0].baseComponentID;
            }

            //var barClass = GetBarClass(baseCmpId)
            //log('barclass: ' + barClass);
            //$bar.css('background-color', barColor);
            //$bar.removeClass('progress').removeClass('regress').removeClass('gcd');
            //$bar.addClass(barClass);

            //$bar.css({
            //    background: "-webkit-linear-gradient(45deg, rgba(0,20,26,1) 1%,rgba(1,158,255,1) 41%,rgba(57,100,255,1) 100%)"
            //});

            SetBarStyle(baseCmpId);

            animate = setInterval(function () {
                focusing();
            }, 1000 / 60);
        }

        var remainingTime = currentTrigger - cuAPI.serverTime;
        var castingTime = cuAPI.serverTime - currentStart;
        progval = (castingTime / totalCastTime) * 100;

        $timeRemaining.text(castingTime.toFixed(decimalPlaces) + ' / ' + totalCastTime.toFixed(decimalPlaces));


        if (progval >= 100) {
            progval = 100;
        }

        if (0 > progval) {
            progval = 0;
        }

        $bar.css('width', progval + '%');
    }

    function oaa(curr, start, trigger, queue) {

        if (queue || -1 == start) {
            return;
        }
        
        log('\r\n\r\n*****Start new cast event*****    ID:' + curr);
        log('\r\ncurr: ' + curr);
        log('\r\nstart: ' + start);
        log('\r\ntrigger: ' + trigger);
        log('\r\nqueue: ' + queue);
        log('\r\nserver time: ' + cuAPI.serverTime);

        currentAbility = findById(abilities, curr);
        $im.attr("src", currentAbility.icon);

        currentAbilityID = curr;
        progval = 0;
        totalCastTime = trigger - cuAPI.serverTime

        $abilityName.text(currentAbility.name);

        currentStart = start;
        currentTrigger = trigger;

        if (null != animate) {
            clearInterval(animate);
            animate = null;
        }

        //$progress.show();
        log('\r\n\r\n*****Start new interval*****    ID:' + curr);
        animate = setInterval(function () {
            casting();
        }, 1000 / 60);

        //$bar.css('background-color', 'green');
        SetBarStyle(-1);
        $progress.show();
    }

    cu.gameClient.OnAbilityActive(oaa);

    function fixIdStr(id) {
        return ("000000000000000" + id.toString(16)).substr(-16);
    }

    function onCharacterIDChanged(characterID) {
        cu.RequestAllAbilities(cuAPI.loginToken, characterID, function (abils) {
            //abilities = abils;

            //updateSkillbar();
        }).then(function (abils) {
            if (!abils || !abils.length)
                return;

            //abils.sort(sortByAbilityID);

            abils.forEach(function (abil) {

                abil.id = fixIdStr(abil.id);

                log('Pushing ability: ' + abil.id);
                abilities.push(abil);
            });

            var BANDAGE_ABILITY_ID = (31).toString(16);
            log('request ability: ' + BANDAGE_ABILITY_ID);
            cu.RequestAbility(BANDAGE_ABILITY_ID, function (ability) {
                log('Pushing ability: ' + ability.id);
                ability.id = fixIdStr(ability.id);
                ability.stats = [];
                ability.stats['recoveryTime'] = 15;
                //logAbil(ability);
                abilities.push(ability);
            }, true);

        });
    }

    function onAbilityCreated(id, a) {
        log('\r\n\r\n*****ability added***** passed in id: ' + id);
        var craftedAbility = JSON.parse(a);
        craftedAbility.id = fixIdStr(craftedAbility.id);        

        logAbil(craftedAbility);
        //log('**currentAbility.stats:**')
        //logAbil(currentAbility.stats);
        //log('**currentAbility.rootComponentSlot:**')
        //logAbil(currentAbility.rootComponentSlot);
        log('Pushing ability: ' + craftedAbility.id);
        abilities.push(craftedAbility);
    }

    function initialize() {

        if (typeof cuAPI === 'object') {
            cuAPI.OnInitialized(function () {

                log('\r\n\r\n\r\n***************************************loading castbar***************************************');

                cuAPI.OnCharacterIDChanged(onCharacterIDChanged);
                cuAPI.OnAbilityCreated(onAbilityCreated);

                loginToken = cuAPI.loginToken;
            });
        }
    }

    $progress.hide();
    initialize();

})(Castbar || (Castbar = {}));
