/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../cu/cu.ts" />

module RaceCounts {
    var cu = new CU();

    // Our update function, and how often we should call it
    var updateFPS = 5;
    function Update() {
        if (cu.HasAPI()) {
            $(".raceCounts").html("Tuatha: " + cuAPI.numTuatha + "<br/>Viking: " + cuAPI.numViking + "<br/>St'rm: " + cuAPI.numStrm);
        }
    }
    if (updateFPS > 0) self.setInterval(Update, 1000 / updateFPS);

    // Binds F5 (keyCode 116) to reload the page
    function F5Refresh(e) { if ((e.which || e.keyCode) == 116) location.reload(true); };
    $(document).bind("keyup", F5Refresh);
}