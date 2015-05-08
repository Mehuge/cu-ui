/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

module Health {
    var cu = new CU();

    var $maxHPBar = null;
    var $hpBar = null;
    var $hpPct = null;

    // Our update function, and how often we should call it
    var updateFPS = 5;
    function Update() {
        var maxWidth = $maxHPBar.width();
        var hpRatio = cu.HasAPI() ? cuAPI.hp / cuAPI.maxHP : Math.random();
        var newWidth = hpRatio * maxWidth;
        $hpBar.width(newWidth);
        $hpPct.text(Math.round(hpRatio * 100) + "%");
    }

    if (updateFPS > 0) self.setInterval(Update, 1000 / updateFPS);

    // Binds F5 (keyCode 116) to reload the page
    function F5Refresh(e) {
        if ((e.which || e.keyCode) == 116) location.reload(true);
    }
    $(document).bind("keyup", F5Refresh);

    $(() => {
        $maxHPBar = $(".maxHPBar");
        $hpBar = $(".hpBar");
        $hpPct = $(".hpPct");

        $hpPct.click(() => {
            window.open('http://camelotunchained.com');
        });
    });
}