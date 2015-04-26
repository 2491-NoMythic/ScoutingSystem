var form;
var xmlhttpCache;
var tableBody;
var responseCache;
if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttpCache = new XMLHttpRequest();
}
else {
	// code for IE6, IE5
	xmlhttpCache = new ActiveXObject("Microsoft.XMLHTTP");
}

window.onload = function() {
	tableBody = document.getElementById("resultTableBody");
	reloadCache();
}

xmlhttpCache.onreadystatechange = function() {
	if(xmlhttpCache.readyState == 4){
		if (xmlhttpCache.responseText) {
			document.getElementById("cacheIndicator").src = "images/success.png";
			document.getElementById("lastCacheUpdate").innerHTML = "Last update: " + getDateString();
			responseCache = JSON.parse(xmlhttpCache.responseText);
			redisplay();
		}
		else {
			document.getElementById("cacheIndicator").src = "images/fail.png";
		}
	}
}

function getDateString() {
	var date = new Date();
	var dateString = "" + date.getHours() % 12 + ":" + date.getMinutes() + ":" + date.getSeconds() + (date.getHours() > 12 ? " PM" : " AM");
	dateString += " on " + date.toDateString();
	return dateString;
}

function makeCell(text, color) {
	var cell = document.createElement("td");
	if (text) {
		cell.appendChild(document.createTextNode(text));
	}
	if (color) {
		cell.style.backgroundColor = color;
	}
	return cell;
}

function makeNumberCell(number, max) {
	if (number) {
		return makeCell(number, getColor(number, max));
	}
	else {
		return makeCell(number);
	}
}

function getColor(number, max) {
	if (number >= max * 0.75) {
		return("#afa");
	}
	else if (number >= max * 0.5) {
		return("#ffa");
	}
	else if (number >= max * 0.25) {
		return("#fda");
	}
	else {
		return("#faa");
	}
}

function makeStackSetCell(set, stack) {
	if (stack == true || stack == 1 || stack == "1") {
		return makeCell("Stack", "#afa");
	}
	else if (set == true || set == 1 || set == "1") {
		return makeCell("Set", "#ffa");
	}
	else {
		return makeCell("None", "#faa");
	}
}

function makeBooleanCell(value) {
	if (value == true || value == 1 || value == "1") {
		return makeCell("Yes", "#afa");
	}
	else {
		return makeCell("No", "#faa");
	}
}

function reloadCache() {
	document.getElementById("cacheIndicator").src = "images/loading.gif";
	xmlhttpCache.open("GET","GetTeam.php?team=All",true);
	xmlhttpCache.send();
}

function redisplay() {
	clearTable();
	if (!document.getElementById("team1No").value) {
		appendTable(responseCache);
	}
	else {
		appendTable(filter(document.getElementById("team1No").value, responseCache));
		appendTable(filter(document.getElementById("team2No").value, responseCache));
		appendTable(filter(document.getElementById("team3No").value, responseCache));
		appendTable(filter(document.getElementById("team4No").value, responseCache));
		appendTable(filter(document.getElementById("team5No").value, responseCache));
	}
}

function filter(teamNo, array) {
	var filteredData = [];
	for (id in array) {
		if (array[id].teamNumber == teamNo && teamNo) {
			filteredData.push(array[id]);
		}
	}
	return filteredData;
}

function makeRow(team) {
	var row = document.createElement("tr");
	if (team.elimNumber) {
		row.appendChild(makeCell(team.matchType + " " + team.elimNumber + " Match " + team.matchNumber));
	}
	else {
		row.appendChild(makeCell(team.matchType + " Match " + team.matchNumber));
	}
	row.appendChild(makeCell(team.teamNumber));
	row.appendChild(makeBooleanCell(team.autoRobotMoved));
	row.appendChild(makeNumberCell(team.autoTotesMoved, 3));
	row.appendChild(makeNumberCell(team.autoContainersMoved, 2));
	row.appendChild(makeBooleanCell(team.autoToteStack));
	row.appendChild(makeBooleanCell(team.binA));
	row.appendChild(makeBooleanCell(team.binB));
	row.appendChild(makeBooleanCell(team.binC));
	row.appendChild(makeBooleanCell(team.binD));
	row.appendChild(makeBooleanCell(team.allianceRobotSet));
	row.appendChild(makeBooleanCell(team.allianceContainerSet));
	row.appendChild(makeStackSetCell(team.allianceToteSet, team.allianceToteStack));
	row.appendChild(makeNumberCell(team.teleTotesStacked, 12));
	row.appendChild(makeNumberCell(team.teleToteStacks, 4));
	row.appendChild(makeNumberCell(team.teleLargestToteStack, 6));
	row.appendChild(makeNumberCell(team.teleContainersPlaced, 4));
	row.appendChild(makeNumberCell(team.teleHighestContainerPlaced, 6));
	row.appendChild(makeNumberCell(team.teleContainersTakenFromStep, 4));
	row.appendChild(makeNumberCell(team.teleNoodlesInContainers, 4));
	row.appendChild(makeNumberCell(team.teleNoodlesInLandfill, 10));
	row.appendChild(makeNumberCell(team.teleNoodlesThrown, 10));
	row.appendChild(makeNumberCell(team.coopTotesPlaced, 3));
	row.appendChild(makeNumberCell(team.coopTotesStacked, 4));
	row.appendChild(makeStackSetCell(team.coopToteSet, team.coopToteStack));
	row.appendChild(makeBooleanCell(team.frontLeft));	
	row.appendChild(makeBooleanCell(team.frontRight));
	row.appendChild(makeBooleanCell(team.backLeft));
	row.appendChild(makeBooleanCell(team.backRight));	
	row.appendChild(makeNumberCell(team.totalScore));
	if (document.getElementById("showNotes").checked) {
		var notes = makeCell(team.notes);
		notes.style.maxWidth = "200px";
		row.appendChild(notes);
	}
	else {
		row.appendChild(makeCell());
	}
	return row;
}

function clearTable(teams) {
	var oldBody = tableBody;
	var newBody = document.createElement("tbody");
	tableBody = newBody;
	oldBody.parentNode.replaceChild(tableBody, oldBody);
}

function appendTable(teams) {
	teams.sort(function(a, b) {
		if (a.matchType == b.matchType) {
			if (a.elimNumber && a.elimNumber != b.elimNumber) {
				return a.elimNumber - b.elimNumber;
			}
			else {
				return a.matchNumber - b.matchNumber;
			}
		}
		else {
			if (a.matchType == "Qualifications") {
				return -1;
			}
			else if (a.matchType == "Quarterfinals" && b.matchType != "Qualifications") {
				return -1;
			}
			else if (a.matchType == "Semifinals" && b.matchType != "Qualifications" && b.matchType != "Quarterfinals") {
				return -1;
			}
			else if (a.matchType == "Finals" && b.matchType != "Qualifications" && b.matchType != "Quarterfinals" && b.matchType != "Semifinals") {
				return -1;
			}
			else if (a.matchType == "Practice" && b.matchType == "Other") {
				return -1;
			}
			else {
				return 1;
			}
		}
	});
	for (team in teams) {
		tableBody.appendChild(makeRow(teams[team]));
	}
}
