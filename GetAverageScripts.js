var form
var xmlhttp, xmlhttp2, xmlhttp3, xmlhttp4, xmlhttp5;
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
		if (response1[0].teamNumber || response1[1].teamNumber) {
			appendTable(response1);
		}
		request1done = true;
	}
}

xmlhttp2.onreadystatechange = function() {
	if(xmlhttp2.readyState == 4){
		if (request1done) {
			response2 = JSON.parse(xmlhttp2.responseText);
			if (response2[0].teamNumber) {
				appendTable(response2);
			}
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
			if (response3[0].teamNumber) {
				appendTable(response3);
			}
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
			if (response4[0].teamNumber) {
				appendTable(response4);
			}
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
			if (response5[0].teamNumber) {
				appendTable(response5);
			}
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

function reloadCache() {
	xmlhttpCache.open("GET","GetTeam.php?mode=Average&team=All",true);
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

function makePercentageCell(value) {
	return makeCell(value * 100 + "%", getColor(value, 1.0));
}

function makeRow(team) {
	var row = document.createElement("tr");
	row.appendChild(makeCell(team.teamNumber));
	row.appendChild(makePercentageCell(team.autoRobotMoved));
	row.appendChild(makeNumberCell(team.autoTotesMoved, 3));
	row.appendChild(makeNumberCell(team.autoContainersMoved, 2));
	row.appendChild(makePercentageCell(team.autoToteStack));
	row.appendChild(makePercentageCell(team.allianceRobotSet));
	row.appendChild(makePercentageCell(team.allianceContainerSet));
	row.appendChild(makePercentageCell(team.allianceToteSet));
	row.appendChild(makePercentageCell(team.allianceToteStack));
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
	row.appendChild(makePercentageCell(team.coopToteSet));
	row.appendChild(makePercentageCell(team.coopToteStack));
	row.appendChild(makeNumberCell(team.totalScore, 100));
	return row;
}

function clearTable(teams) {
	var oldBody = tableBody;
	var newBody = document.createElement("tbody");
	tableBody = newBody;
	oldBody.parentNode.replaceChild(tableBody, oldBody);
}

function appendTable(teams) {
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
		xmlhttp.open("GET","GetTeam.php?mode=Average&team=" + team1No,true);
		xmlhttp.send();
		xmlhttp2.open("GET","GetTeam.php?mode=Average&team=" + team2No,true);
		xmlhttp2.send();
		xmlhttp3.open("GET","GetTeam.php?mode=Average&team=" + team3No,true);
		xmlhttp3.send();
		xmlhttp4.open("GET","GetTeam.php?mode=Average&team=" + team4No,true);
		xmlhttp4.send();
		xmlhttp5.open("GET","GetTeam.php?mode=Average&team=" + team5No,true);
		xmlhttp5.send();
	}
}
