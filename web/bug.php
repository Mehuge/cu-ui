<?php
header("Content-Type: text/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: accept, content-type");
if (rand()%2==0) {
	echo '{ "status": 0, "ref": "20140913-0935-01" }';
} else {
	echo '{ "status": 1, "reason": "There was a problem submitting this report, please try again later" }';
}
?>
