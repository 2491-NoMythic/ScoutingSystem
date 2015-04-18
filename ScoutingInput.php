<?
ini_set('display_errors',1);
$server = "localhost";
$username="nomythic";
$password="2491";
$database="scouting";
header('Content-Type: text/plain');
$sql = new mysqli($server, $username, $password, $database);

if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

$fieldlist = "";
$valuelist = "";

# Grab match info
$matchType = $sql->escape_string($_POST["matchType"]);
$elimNo = $sql->escape_string($_POST["elimNo"]);
$matchNo = $sql->escape_string($_POST["matchNo"]);
$teamNo = $sql->escape_string($_POST["teamNo"]);

# Check required values for nullness
rejectNull($matchType, "match type");
if ($matchType == "Quarterfinals" || $matchType == "Semifinals") {
	rejectNull($elimNo, "elimination set");
}
rejectNull($matchNo, "match number");
rejectNull($teamNo, "team number");

addTableIfNeeded($teamNo);

# Add match info
addValue($matchType, "matchType");
addValue($elimNo, "elimNumber");
addValue($matchNo, "matchNumber");
addValue($teamNo, "teamNumber");

# Add autonomous info
autoAdd("autoRobotMoved");
autoAdd("autoTotesMoved");
autoAdd("autoContainersMoved");
autoAdd("autoToteStack");
autoAdd("allianceRobotSet");
autoAdd("allianceContainerSet");
$allianceToteSet = $sql->escape_string($_POST["allianceToteSet"]);
if ($allianceToteSet == "Set") {
	addValue("on", "allianceToteSet");
}
elseif ($allianceToteSet == "Stack") {
	addValue("on", "allianceToteStack");
}


# Add teleop info
autoAdd("teleTotesStacked");
autoAdd("teleToteStacks");
autoAdd("teleLargestToteStack");
autoAdd("teleContainersPlaced");
autoAdd("teleHighestContainerPlaced");
autoAdd("teleContainersTakenFromStep");
autoAdd("teleNoodlesInContainers");
autoAdd("teleNoodlesInLandfill");
autoAdd("teleNoodlesThrown");
autoAdd("coopTotesPlaced");
autoAdd("coopTotesStacked");
$coopToteSet = $sql->escape_string($_POST["coopToteSet"]);
if ($coopToteSet == "Set") {
	addValue("on", "coopToteSet");
}
elseif ($coopToteSet == "Stack") {
	addValue("on", "coopToteStack");
}

# Add other info
autoAdd("totalScore");
autoAdd("notes");

insertValues();

# Functions
function runInsertQuery($query) {
	global $sql;
	if ($sql->query($query)) {
		echo $query."<br />";
	}
	else {
		echo mysqli_error($sql)."<br />";
	}
}

function runSelectQuery($query) {
	global $sql;
	$resultArray = Array();
	if ($result = $sql->query($query)) {
		while ($row = $result->fetch_row()) {
			array_push($resultArray, $row);
		}
		$result->close();
	}
	return $resultArray;
}

function addTableIfNeeded($teamNo) {
	$result = runSelectQuery("show tables");
	$found = false;
	foreach ($result as $row) {
		if ($row[0] == $teamNo) {
			$found = true;
		}
	}
	if (!$found) {
		$query = "CREATE TABLE `$teamNo` (
			id int unsigned unique NOT NULL auto_increment,
			matchType char(15) NOT NULL DEFAULT 'Qualifications',
			elimNumber tinyint unsigned,
			matchNumber smallint unsigned NOT NULL,
			teamNumber smallint unsigned NOT NULL,
			autoRobotMoved boolean DEFAULT FALSE DEFAULT FALSE,
			autoTotesMoved tinyint unsigned,
			autoContainersMoved tinyint unsigned,
			autoToteStack boolean DEFAULT FALSE,
			allianceRobotSet boolean DEFAULT FALSE,
			allianceContainerSet boolean DEFAULT FALSE,
			allianceToteSet boolean DEFAULT FALSE,
			allianceToteStack boolean DEFAULT FALSE,
			teleTotesStacked tinyint unsigned,
			teleToteStacks tinyint unsigned,
			teleLargestToteStack tinyint unsigned,
			teleContainersPlaced tinyint unsigned,
			teleHighestContainerPlaced tinyint unsigned,
			teleContainersTakenFromStep tinyint unsigned,
			teleNoodlesInContainers tinyint unsigned,
			teleNoodlesInLandfill tinyint unsigned,
			teleNoodlesThrown tinyint unsigned,
			coopTotesPlaced tinyint unsigned,
			coopTotesStacked tinyint unsigned,
			coopToteSet boolean DEFAULT FALSE,
			coopToteStack boolean DEFAULT FALSE,
			totalScore smallint unsigned,
			notes text
		)";
		runInsertQuery($query);
	}
}

function rejectNull($value,$VariableName) {
	if (preg_match("/^\s*$/", $value)) {
		print "You did not specify a value for $VariableName.  Please click the back button on your browser and add this information.";
		exit;
	}
}

function isNull($value) {
	if (preg_match("/^\s*$/", $value)) {
		return true;
	}
	else {
		return false;
	}
}

function addValue($value, $field) {
	global $fieldlist, $valuelist;
	if ($value == "on") {
		$value = 1;
	}
	if (!isNull($value)) {
		if (!isNull($fieldlist)) {
			$fieldlist .= ",";
			$valuelist .= ",";
		}
		$fieldlist .= $field;
		$valuelist .= "'".$value."'";
	}
}

function autoAdd($name) {
	global $sql;
	addValue($sql->escape_string($_POST[$name]), $name);
}

function insertValues() {
	global $fieldlist, $valuelist, $teamNo;
	$query = "INSERT INTO `$teamNo` (".$fieldlist.") VALUES (".$valuelist.")";
	runInsertQuery($query);
}

$sql->close();
?>