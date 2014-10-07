var targets = {}, searching = 0;
function rand(n) {
    return Math.random() * n;
}
function run() {
    BOT.health()
        .target()
        .start({
            done: function () {
                setTimeout(run, 1000);
            },
            health: function (characterName, hp, maxHP, selfEffects) {
                if (hp === 0) {
                    console.log("RESURECT!!!!");
                    BOT.reset().sleep(1).key(KR).sleep(2).walk(FORWARDS, 30);
                } else if (hp < 25) {
                    BOT.reset().attack(Am, 20);
                } else {
                    console.log('HP GOOD');
                }
            },
            target: function (friendly, name, hp, max, effects) {
                console.log((friendly ? "Friendly " : "Hostile ") + "Target: " + name + " " + hp + "/" + max + " effects: " + effects);
                var nextTarget = function () {
                    BOT.nextTarget().sleep(0.3);
                };
                var wander = function () {
                    var turnAmount = -400 + rand(800);
                    console.log("BOT: WANDER turn amount = " + turnAmount);
                    BOT.reset().click().walk(BACKWARDS, 2).turn(turnAmount).walk(FORWARDS, 5);
                    nextTarget();
                };
                var locate = function () {
                    searching++;
                    if (searching == 13) {
                        console.log('searching too long, wander about!');
                        wander();
                        searching = 0;
                    } else {
                        console.log('searching...');
                        BOT.reset().turn(100);
                        nextTarget();
                    }
                };
                if (friendly) {
                    console.log('Friendly target, find next target');
                    BOT.reset();
                    nextTarget();
                    return;
                }
                if (name.indexOf(" Dummy") !== -1) {
                    console.log('Ignore target dummies');
                    wander();
                    return;
                }
                if (hp == -1) {
                    console.log('No Target, try and find a target ... ');
                    locate();
                } else {
                    var target = targets[name] = targets[name] || { ohp: 0, lastAttacked: 0, fails: 0 }, now = Date.now();
                    console.log('have target: oldHP ' + target.ohp + ' hp ' + hp);
                    if (hp > 0) {
                        console.log('TARGET is not DEAD!!!   Last Attacked ' + (now - target.lastAttacked));
                        if ((now - target.lastAttacked) > 20000 || hp < target.ohp) {
                            console.log('ATTACK!!!');
                            var attack = A3, duration = 3;
                            if (rand(10) < 3) { attack = A6; duration = 12; }
                            BOT.reset().attack(attack, duration).sleep(2);
                            target.lastAttacked = now;
                            target.ohp = hp;
                        } else {
                            if (target.fails == 2) {
                                console.log('hummm cant get to target, walkabout');
                                wander();
                                target.fails = 0;
                            } else {
                                console.log('Target not loosing HPs.  Get closer?');
                                BOT.reset().sleep(0.5).walk(FORWARDS, 2).click();
                                nextTarget();
                                target.fails++;
                                target.lastAttacked = 0;
                            }
                        }
                    } else {
                        console.log('FIND ANOTHER TARGET');
                        wander();
                        target.lastAttacked = 0;
                    }
                }
            }
        });
}
run();