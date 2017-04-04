<?php
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate"); // HTTP/1.1
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); // HTTP/1.0
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

$host = "localhost";
$user = "vgs";
$pass = "servirvgs";
$db = "vgs";

$stationID = $_GET['id'];
$start = $_GET['start'];
$end = $_GET['end'];

//$stationID = "1";
//$start = "2016-01-01";
//$end   = "2016-08-01";
//*
$con = pg_connect("host=$host dbname=$db user=$user password=$pass") or die ("Could not connect to server\n");

$id = substr($stationID, 4);

$query = "select datetime, height from vgs_height where location_id='".$id."' and datetime > '".$start."' and datetime < '".$end."' order by datetime asc";
//$query = "select datetime, height from vgs_height where location_id='1' and datetime > '2016-01-01' and datetime < '2016-08-01' order by datetime asc";
//echo "$query\n";
$json = "mycallback('{\"streamflow\":[";

$rs = pg_query($con, $query) or die ("Cannot Execute query: $query\n");
$ind = 0;
while ($row = pg_fetch_row($rs)) {
//	echo "$row[0] $row[1] \n";;
	$dt = substr($row[0], 5,2) . "/".substr($row[0],8,2)."/".substr($row[0], 0,4);
	if($ind == 0) {
		$json = $json . "{\"Date\":\"".$dt."\",\"Value\":".$row[1]."}"; 
	}else{  $json = $json . ",{\"Date\":\"".$dt."\",\"Value\":".$row[1]."}";
	}
	$ind++;
}
$json = $json . "]}')";
pg_close($con);
//*/
//       mycallback('{"streamflow":[{"Date":"01/01/2016","Value":284.373687744141},{"Date":"01/02/2016","Value":282.178985595703},{"Date":"01/03/2016","Value":280.003784179688},
//$json = "mycallback('{\"streamflow\":[{\"Date\":\"01/01/2016\",\"Value\":1.40888},{\"Date\":\"01/16/2016\",\"Value\":2.0946},{\"Date\":\"01/26/2016\",\"Value\":2.27057},{\"Date\":\"02/05/2016\",\"Value\":2.28288},{\"Date\":\"02/15/2016\",\"Value\":2.23422},{\"Date\":\"02/25/2016\",\"Value\":1.86151},{\"Date\":\"03/06/2016\",\"Value\":0.617214},{\"Date\":\"03/16/2016\",\"Value\":1.37598},{\"Date\":\"03/26/2016\",\"Value\":2.15183},{\"Date\":\"04/05/2016\",\"Value\":2.46335},{\"Date\":\"04/15/2016\",\"Value\":2.05284},{\"Date\":\"04/24/2016\",\"Value\":2.14873},{\"Date\":\"05/04/2016\",\"Value\":1.13896},{\"Date\":\"05/14/2016\",\"Value\":1.91045},{\"Date\":\"05/24/2016\",\"Value\":5.75929},{\"Date\":\"06/03/2016\",\"Value\":4.72102},{\"Date\":\"06/13/2016\",\"Value\":5.05295},{\"Date\":\"06/23/2016\",\"Value\":3.19581},{\"Date\":\"07/03/2016\",\"Value\":4.00013},{\"Date\":\"07/13/2016\",\"Value\":3.75076},{\"Date\":\"07/23/2016\",\"Value\":4.53224}]}')";
//$json = "mycallback('{\"streamflow\":[{\"Date\":\"2016-01-06 20:16:12.626445\",\"Value\":1.40888}{\"Date\":\"2016-01-16 18:14:43.689938\",\"Value\":2.0946}{\"Date\":\"2016-01-26 16:13:15.487899\",\"Value\":2.27057}{\"Date\":\"2016-02-05 14:11:47.745852\",\"Value\":2.28288}{\"Date\":\"2016-02-15 12:10:19.786129\",\"Value\":2.23422}{\"Date\":\"2016-02-25 10:08:51.64371\",\"Value\":1.86151}{\"Date\":\"2016-03-06 08:07:23.509264\",\"Value\":0.617214}{\"Date\":\"2016-03-16 06:05:55.24654\",\"Value\":1.37598}{\"Date\":\"2016-03-26 04:04:26.644938\",\"Value\":2.15183}{\"Date\":\"2016-04-05 02:02:57.749873\",\"Value\":2.46335}{\"Date\":\"2016-04-15 00:01:28.505006\",\"Value\":2.05284}{\"Date\":\"2016-04-24 21:59:59.139624\",\"Value\":2.14873}{\"Date\":\"2016-05-04 19:58:31.392848\",\"Value\":1.13896}{\"Date\":\"2016-05-14 17:57:03.907399\",\"Value\":1.91045}{\"Date\":\"2016-05-24 15:55:36.22419\",\"Value\":5.75929}{\"Date\":\"2016-06-03 13:54:08.298044\",\"Value\":4.72102}{\"Date\":\"2016-06-13 11:52:40.138926\",\"Value\":5.05295}{\"Date\":\"2016-06-23 09:51:11.851038\",\"Value\":3.19581}{\"Date\":\"2016-07-03 07:49:43.56895\",\"Value\":4.00013}{\"Date\":\"2016-07-13 05:48:15.289974\",\"Value\":3.75076}{\"Date\":\"2016-07-23 03:46:46.861819\",\"Value\":4.53224}]}')";
echo "$json\n";
?>
