var targets = {}, searching = 0, wanderer = 0;
function rand(n) {
    return Math.random() * n;
}
function run() {
    function walk(direction, duration) {
        for (var i = 0; i < duration; i++) {
            BOT.walk(direction, 1);
        }
    }
    BOT.health()
        .target()
        .start({
            done: function () {
                setTimeout(run, 1000);
            },
            health: function (characterName, hp, maxHP, selfEffects) {
                if (hp === 0) {
                    console.log("RESURECT!!!!");
                    BOT.reset().sleep(1).key(KR).sleep(2);
                    walk(FORWARDS, 30);
                } else if (hp < 25) {
                    BOT.reset().attack(Am, 20);
                } else {
                    console.log('HP GOOD');
                }
            },
            moving: function () {
                console.log('I AM WALKING = SPEED = ' + cuAPI.speed);
                if (cuAPI.speed < 1.0) {
                    BOT.reset().cancel().health().turn(200);
                    walk(FORWARDS, 5);
                    BOT.turn(-200);
                }
            },
            target: function (friendly, name, hp, max, effects) {
                if (friendly && name.indexOf(" Dummy") !== -1) {
                    console.log('Friendly target, find next target');
                    BOT.reset().attack(A7, 4);
                    return;
                }
                var turnAmount = -400 + rand(800);
                console.log("BOT: WANDER turn amount = " + turnAmount);
                BOT.reset().turn(wanderer % 2 == 0 ? -300 : 300).attack(A8, 3.5);
                wanderer++;
                walk(FORWARDS, 5 + rand(10));
            }
        });
}
run();