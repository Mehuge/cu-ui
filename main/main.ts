/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

module Main {
    var cu = new CU();

    // Our update function, and how often we should call it
    var updateFPS = 5;
    function Update() {
        var maxWidth = $(".maxHPBar").width();
        var hpRatio = cu.HasAPI() ? cuAPI.hp / cuAPI.maxHP : Math.random();
        var newWidth = hpRatio * maxWidth;
        $(".hpBar").width(newWidth);
        $(".hpPct").text(Math.round(hpRatio * 100) + "%");
        if (cu.HasAPI()) {
            $(".perfHud").html(cuAPI.characters + "/" + cuAPI.maxCharacters + " characters<br/>" +
                cuAPI.terrain + "/" + cuAPI.maxTerrain + " terrain<br/>" +
                cuAPI.fps.toFixed(1) + " fps<br/>" + cuAPI.frameTime.toFixed(1) + " msec/frame<br/>");
            $(".raceCounts").html("Tuatha: " + cuAPI.numTuatha + "<br/>Viking: " + cuAPI.numViking + "<br/>St'rm: " + cuAPI.numStrm);
        }
    }
    if (updateFPS > 0) self.setInterval(Update, 1000 / updateFPS);

    // Binds F5 (keyCode 116) to reload the page
    function F5Refresh(e) { if ((e.which || e.keyCode) == 116) location.reload(true); };
    $(document).bind("keyup", F5Refresh);

    //Disable or enable the chat
    var chatVisible = false;
    function ToggleChat() {
        if (chatVisible) {
            chatVisible = !chatVisible;
            $(".chatWindow").css("display", "none");
            var button = $(".toggleButton");
            button.text("Show Chat");
            button.css({
                position: "absolute",
                top: "0px",
                right: "0px"
            });
        } else {
            chatVisible = !chatVisible;
            $(".chatWindow").css("display", "inline");
            var button = $(".toggleButton");
            button.text("Hide Chat");
            button.css({
                position: "absolute",
                top: "300px",
                right: "420px"
            });
        }
    }

    var cuVisible = false;
    function ToggleCU() {
        if (cuVisible) {
            cuVisible = !cuVisible;
            $(".cuWindow").css("display", "none");
        } else {
            cuVisible = !cuVisible;
            $(".cuWindow").css("display", "inline");
        }
    }

    $(() => {
        $('.hpPct').click(ToggleCU);

        $('.toggleButton').click(ToggleChat);
    });
}