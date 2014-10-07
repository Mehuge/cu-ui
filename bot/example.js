var targets = {}, searching = 0;
function rand(n) {
    return Math.random() * n;
}
function run() {
    BOT.health()
        .nextTarget()
        .target()
        .start({
            done: function () {
                setTimeout(run, 1000);
            },
            health: function (characterName, hp, maxHP, selfEffects) {
                if (hp == 0) {
                    BOT.reset().sleep(1).key(KR).sleep(2).walk(FORWARDS, 20);
                } else if (hp < 25) {
                    BOT.reset().attack(Am, 20);
                } else {
                    console.log('HP GOOD');
                }
            },
            target: function (friendly, name, hp, max, effects) {
                console.log((friendly ? "Friendly " : "Hostile ") + "Target: " + name + " " + hp + "/" + max + " effects: " + effects);
                var nextTarget = function () {
                    BOT.nextTarget().sleep(0.3).health().target();
                };
                var wander = function () {
                    BOT.reset().click().walk(BACKWARDS, 5).turn((1 - rand(2)) * (200 + rand(200))).walk(FORWARDS, 5);
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
                if (hp == -1) {
                    console.log('No Target, Wander about ... ');
                    locate();
                } else {
                    var target = targets[name] = targets[name] || { ohp: 0, lastAttacked: 0, fails: 0 }, now = Date.now();
                    console.log('have target: oldHP ' + target.ohp + ' hp ' + hp);
                    if (hp > 0) {
                        console.log('TARGET is not DEAD!!!   Just Attacked ' + target.lastAttacked);
                        if (now - target.lastAttacked > 10000 || hp !== target.ohp) {
                            console.log('ATTACK!!!');
                            var skill = A3;
                            BOT.reset().attack(A3).sleep(2).health().target();
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