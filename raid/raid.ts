/// <reference path="../vendor/jquery.d.ts" />

module Raid {
    // Binds F5 (keyCode 116) to reload the page
    function F5Refresh(e) { if ((e.which || e.keyCode) == 116) location.reload(true); };
    $(document).bind("keyup", F5Refresh);
}