<?php
$load = sys_getloadavg();
if ($load[0] > 80) {
    header('HTTP/1.1 503 Too busy, try again later');
    die('var tracker = { error: "503 Too Busy, try again later" };');
}
$db = mysql_connect("localhost", "cu", "tracker");
if ($db) {
	echo 'var _cu_tracker={';
    mysql_select_db("cu",$db) || die("failed to select database");
	$q = mysql_query("select goal, name, timestamp FROM cu.stretch ORDER by timestamp DESC");
    if ($q) {
		echo 'goals: [';
		$comma = '';
		while ($r = mysql_fetch_row($q)) {
			$goal = $r[0];
			$name = $r[1];
			echo $comma.'{ goal:'.$r[0].',name:"'.$r[1].'"}';
			$comma = ',';
		}
		echo '],';
	}
	$q = mysql_query("select timestamp, current, delta, time_delta FROM cu.tracker ORDER by timestamp");
    if ($q) {
		echo 'data:[';
        while ($r = mysql_fetch_row($q)) {
			echo '["'.$r[0].'",'.$r[1].','.$r[2].','.$r[3].'],';
		}
		echo ']};';
	}
}
?>
