<?
// ini_set('display_errors',1);
$server = "localhost";
$username="nomythic";
$password="2491";
$database="scouting";
header('Content-Type: application/json');
$sql = new mysqli($server, $username, $password, $database);

if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

$fields = Array("matchType","elimNumber", "matchNumber", "teamNumber",
	"autoRobotMoved", "autoTotesMoved", "autoContainersMoved", "autoToteStack",
	"allianceRobotSet", "allianceContainerSet", "allianceToteSet", "allianceToteStack",
	"teleTotesStacked", "teleToteStacks", "teleLargestToteStack", "teleContainersPlaced",
	"teleHighestContainerPlaced", "teleContainersTakenFromStep", "teleNoodlesInContainers",
	"teleNoodlesInLandfill", "teleNoodlesThrown", "coopTotesPlaced", "coopTotesStacked",
	"coopToteSet", "coopToteStack", "totalScore", "notes");

$select = "";

foreach ($fields as $wantedField) {
	if ($select == "") {
		$select .= $wantedField;
	}
	else {
		$select .= ','.$wantedField;
	}
}

$team = $sql->escape_string($_REQUEST["team"]);
rejectNull($team, "Team Number");

$query = "";
if (!$_REQUEST["mode"] || ($_REQUEST["mode"] != "List" && $_REQUEST["mode"] != "Average")) {
	if ($team == "All") {
		$teamInfo = Array();
		foreach (getTeams() as $team) {
			$query = "SELECT $select FROM `$team` ORDER BY Field (matchType,'Qualifications','Quarterfinals','Semifinals','Finals','Other'), elimNumber, matchNumber, teamNumber";
			$result = runQuery($query);
			foreach ($result as $row) {
				$rowArray = Array();
				for ($i = 0; $i < count($fields); $i++) {
					$rowArray[$fields[$i]] = $row[$i];
				}
				array_push($teamInfo, $rowArray);
			}
		}
		echo json_encode($teamInfo);
	}
	else {
		$query = "SELECT $select FROM `$team` WHERE teamNumber LIKE ".$team." ORDER BY Field (matchType, 'Qualifications','Quarterfinals','Semifinals','Finals','Other'), elimNumber, matchNumber";
		$teamInfo = Array();
		$result = runQuery($query);
		foreach ($result as $row) {
			$rowArray = Array();
			for ($i = 0; $i < count($fields); $i++) {
				$rowArray[$fields[$i]] = $row[$i];
			}
			array_push($teamInfo, $rowArray);
		}

		echo json_encode($teamInfo);
	}
}
else if ($_REQUEST["mode"] == "List") {
	echo json_encode(getTeams());
}
else {
	$teamInfo = Array();
	if ($team == "All") {
		$teams = getTeams();
		$teamInfo = Array();
		foreach ($teams as $team) {
			$query = "SELECT $select FROM `$team`";
			$result = averageTeamInfo(runQuery($query));
			array_push($teamInfo, $result);
		}
		echo json_encode($teamInfo);
	}
	else {
		$query = "SELECT $select FROM `$team`";
		$result = averageTeamInfo(runQuery($query));
		echo json_encode(Array($result));
	}
}

function runQuery($query) {
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

function averageTeamInfo($team) {
	global $fields;
	$average = Array();
	for ($i = 0; $i < count($fields); $i++) {
		$field = $fields[$i];
		if ($field != "notes" && $field != "matchType" && $field != "elimNumber" && $field != "matchNumber" && $field != "allianceToteSet" && $field != "coopToteSet") {
			$total = 0;
			$count = 0;
			foreach ($team as $match) {
				if (!is_null($match[$i])) {
					$total += $match[$i];
					$count++;
				}
			}
			if ($count > 0) {
				$average[$field] = $total / $count;
			}
		}
		elseif ($field == "allianceToteSet") {
			$total = 0;
			$count = 0;
			foreach ($team as $match) {
				$num = 0;
				if ($match[$i] > 0) {
					$num = 1;
				}
				elseif ($match[array_search("allianceToteStack", $fields)]) {
					$num = 1;
				}
				$total += $num;
				$count++;	
			}
			if ($count > 0) {
				$average[$field] = $total / $count;
			}
		}
		elseif ($field == "coopToteSet") {
			$total = 0;
			$count = 0;
			foreach ($team as $match) {
				$num = 0;
				if ($match[$i] > 0) {
					$num = 1;
				}
				elseif ($match[array_search("coopToteStack", $fields)]) {
					$num = 1;
				}
				$total += $num;
				$count++;	
			}
			if ($count > 0) {
				$average[$field] = $total / $count;
			}
		}
	}
	return $average;
}

function getTeams() {
	global $sql;
	$query = "show tables";
	$teams = Array();
	$result = runQuery($query);
	foreach ($result as $row) {
		if (!in_array($row[0], $teams)){
			array_push($teams, $row[0]);
		}
	}
	return $teams;
}

function rejectNull($value,$VariableName) {
	if (preg_match("/^\s*$/", $value)) {
		print "You did not specify a value for $VariableName.  Please click the back button on your browser and add this information.";
		exit;
	}
}

$sql->close();
?>