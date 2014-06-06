<?php
/*
 * Request looks like:
 * http://150.140.184.246:28017/webrtc/users/?filter_rtcIdentity=alice@imsserver.ece.upatras.gr&jsonp=returnIdentity
 */

header('Access-Control-Allow-Origin: *');
// TODO: harden the params check
$callback = isset($_GET['jsonp']) ? $_GET['jsonp'] : false;
$uri = isset($_GET['filter_rtcIdentity']) ? $_GET['filter_rtcIdentity'] : false;
header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');

// find corresponding file and read content from it 
$domain = $uri;
$user = "";
if (strpos($uri, "@"))
	list($user, $domain) = split("@", $uri);
$dataFile = "data/" . $user . "_at_" . $domain;
if (!file_exists($dataFile)) {
	// try fallback to domain defaults
	$dataFile = "data/" . $domain;
}
if (file_exists($dataFile)) {
	$data = json_decode(file_get_contents($dataFile));
}
// wrap json with function name if callback is set
echo ($callback ? $callback . '(' : '') . json_encode($data) . ($callback ? ')' : '');
?>
