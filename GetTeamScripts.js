var form
var xmlhttp, xmlhttp2, xmlhttp3, xmlhttp4, xmlhttp5, xmlhttpCache;
var request1done = true;
var request2done = true;
var request3done = true;
var request4done = true;
var tableBody;
var response1, response2, response3, response4, response5, responseCache;
if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp = new XMLHttpRequest();
	xmlhttp2 = new XMLHttpRequest();
	xmlhttp3 = new XMLHttpRequest();
	xmlhttp4 = new XMLHttpRequest();
	xmlhttp5 = new XMLHttpRequest();
	xmlhttpCache = new XMLHttpRequest();
}
else {
	// code for IE6, IE5
	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp2 = new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp3 = new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp4 = new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp5 = new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttpCache = new ActiveXObject("Microsoft.XMLHTTP");
}

window.onload = function() {
	tableBody = document.getElementById("resultTableBody");
	reloadCache();
	getTeamInfo();
}

xmlhttp.onreadystatechange = function() {
	if(xmlhttp.readyState == 4){
		response1 = JSON.parse(xmlhttp.responseText);
		appendTable(response1);
		request1done = true;
	}
}

xmlhttp2.onreadystatechange = function() {
	if(xmlhttp2.readyState == 4){
		if (request1done) {
			response2 = JSON.parse(xmlhttp2.responseText);
			appendTable(response2);
			request2done = true;
		}
		else {
			setTimeout(xmlhttp2.onreadystatechange, 100);
		}
	}
}

xmlhttp3.onreadystatechange = function() {
	if(xmlhttp3.readyState == 4){
		if (request2done) {
			response3 = JSON.parse(xmlhttp3.responseText);
			appendTable(response3);
			request3done = true;
		}
		else {
			setTimeout(xmlhttp3.onreadystatechange, 100);
		}
	}
}

xmlhttp4.onreadystatechange = function() {
	if(xmlhttp4.readyState == 4){
		if (request3done) {
			response4 = JSON.parse(xmlhttp4.responseText);
			appendTable(response4);
			request4done = true;
		}
		else {
			setTimeout(xmlhttp4.onreadystatechange, 100);
		}
	}
}

xmlhttp5.onreadystatechange = function() {
	if(xmlhttp5.readyState == 4){
		if (request4done) {
			response5 = JSON.parse(xmlhttp5.responseText);
			appendTable(response5);
		}
		else {
			setTimeout(xmlhttp5.onreadystatechange, 100);
		}
	}
}

xmlhttpCache.onreadystatechange = function() {
	if(xmlhttpCache.readyState == 4){
		if (xmlhttpCache.responseText) {
			responseCache = JSON.parse(xmlhttpCache.responseText);
		}
	}
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
		return(makeCell(number))
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
	xmlhttpCache.open("GET","GetTeam.php?team=All",true);
	xmlhttpCache.send();
}

function checkCacheMode() {
	var cacheMode = document.getElementById("cacheMode").checked;
	if (cacheMode && !responseCache) {
		reloadCache();
	}
	if (cacheMode) {
		document.getElementById("reloadCache").style.display = "inline";
	}
	else {
		document.getElementById("reloadCache").style.display = "none";
	}
}

function redisplay() {
	clearTable();
	if (document.getElementById("cacheMode").checked) {
		if (!document.getElementById("team1No").value) {
			appendTable(responseCache);
		}
		else {
			filteredResponses = [];
			appendTable(filter(document.getElementById("team1No").value, responseCache));
			appendTable(filter(document.getElementById("team2No").value, responseCache));
			appendTable(filter(document.getElementById("team3No").value, responseCache));
			appendTable(filter(document.getElementById("team4No").value, responseCache));
			appendTable(filter(document.getElementById("team5No").value, responseCache));
		}
	}
	else {
		appendTable(response1);
		appendTable(response2);
		appendTable(response3);
		appendTable(response4);
		appendTable(response5);
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
	row.appendChild(makeNumberCell(team.teleContainersPlaced, 5));
	row.appendChild(makeNumberCell(team.teleHighestContainerPlaced, 6));
	row.appendChild(makeNumberCell(team.teleContainersTakenFromStep, 4));
	row.appendChild(makeNumberCell(team.teleNoodlesInContainers, 5));
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

function getTeamInfo() {
	if (document.getElementById("cacheMode").checked) {
		redisplay();
	}
	else {
		var team1No = document.getElementById("team1No").value;
		var team2No = document.getElementById("team2No").value;
		var team3No = document.getElementById("team3No").value;
		var team4No = document.getElementById("team4No").value;
		var team5No = document.getElementById("team5No").value;
		if (!team1No) {
			team1No = "All";
		}
		if (!team2No) {
			team2No = "None";
		}
		if (!team3No) {
			team3No = "None";
		}
		if (!team4No) {
			team4No = "None";
		}
		if (!team5No) {
			team5No = "None";
		}
		clearTable();
		request1done = false;
		request2done = false;
		request3done = false;
		request4done = false;
		xmlhttp.open("GET","GetTeam.php?team=" + team1No,true);
		xmlhttp.send();
		xmlhttp2.open("GET","GetTeam.php?team=" + team2No,true);
		xmlhttp2.send();
		xmlhttp3.open("GET","GetTeam.php?team=" + team3No,true);
		xmlhttp3.send();
		xmlhttp4.open("GET","GetTeam.php?team=" + team4No,true);
		xmlhttp4.send();
		xmlhttp5.open("GET","GetTeam.php?team=" + team5No,true);
		xmlhttp5.send();
	}
}
