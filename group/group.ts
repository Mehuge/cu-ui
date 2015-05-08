/// <reference path="../vendor/jquery.d.ts" />

module Group {
    // Binds F5 (keyCode 116) to reload the page
    function F5Refresh(e) { if ((e.which || e.keyCode) == 116) location.reload(true); }
    $(document).bind("keyup", F5Refresh);

    function UpdateHealth(index) {
        var groupMember = $("#groupMember" + index);
        var healthBar = $(".healthBar", groupMember);
        var hp = Math.round(Math.random() * 100);
        var maxHP = 100;
        var hpRatio = hp / maxHP;
        var newWidth = hpRatio * healthBar.width();
        healthBar.css("clip", "rect(0, " + newWidth + ", " + healthBar.height() + ", 0)");
        $(".healthText", groupMember).text(hp + "/" + maxHP);
    }

    // Our update function, and how often we should call it
    var updateFPS = 1;
    function Update() {
        for (var i = 0; i < 4; ++i) {
            UpdateHealth(i);
        }
    }
    if (updateFPS > 0) self.setInterval(Update, 1000 / updateFPS);
}