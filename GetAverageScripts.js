var form
var xmlhttp
var tableBody;
var response
if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp = new XMLHttpRequest();
}
else {
	// code for IE6, IE5
	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

window.onload = function() {
	tableBody = document.getElementById("resultTableBody");
	reloadCache();
}

xmlhttp.onreadystatechange = function() {
	if(xmlhttp.readyState == 4){
		if (xmlhttp.responseText) {
			document.getElementById("cacheIndicator").src = "images/success.png";
			document.getElementById("lastCacheUpdate").innerHTML = "Last update: " + getDateString();
			response = JSON.parse(xmlhttp.responseText);
			redisplay();
		}
		else {
			document.getElementById("cacheIndicator").src = "images/fail.png";
		}
	}
}

function getDateString() {
	var date = new Date();
	var dateString = "" + date.getHours() % 12 + ":" + ("00" + date.getMinutes()).slice(-2) + ":" + ("00" + date.getSeconds()).slice(-2) + (date.getHours() > 12 ? " PM" : " AM");
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
		if (number * 100 % 1 == 0) {
			return makeCell(number, getColor(number, max));
		}
		else {
			return makeCell(number.toFixed(2), getColor(number, max));
		}
	}
	else if (number != null && number != undefined) {
		return makeCell("0", getColor(0));
	}
	else {
		return makeCell(number);
	}
}

function reloadCache() {
	xmlhttp.open("GET","GetTeam.php?mode=Average&team=All",true);
	xmlhttp.send();
}

function redisplay() {
	clearTable();
	if (!document.getElementById("team1No").value) {
		appendTable(response);
	}
	else {
		appendTable(filter(document.getElementById("team1No").value, response));
		appendTable(filter(document.getElementById("team2No").value, response));
		appendTable(filter(document.getElementById("team3No").value, response));
		appendTable(filter(document.getElementById("team4No").value, response));
		appendTable(filter(document.getElementById("team5No").value, response));
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
	if (value * 100 % 1 == 0) {
		return makeCell(value * 100 + "%", getColor(value, 1));
	}
	return makeCell((value * 100).toFixed(1) + "%", getColor(value, 1.0));
}

function makeRow(team) {
	var row = document.createElement("tr");
	row.appendChild(makeCell(team.teamNumber));
	row.appendChild(makePercentageCell(team.autoRobotMoved));
	row.appendChild(makeNumberCell(team.autoTotesMoved, 3));
	row.appendChild(makeNumberCell(team.autoContainersMoved, 2));
	row.appendChild(makePercentageCell(team.autoToteStack));
	row.appendChild(makePercentageCell(team.allianceRobotSet));
	row.appendChild(makePercentageCell(team.binA));
	row.appendChild(makePercentageCell(team.binB));
	row.appendChild(makePercentageCell(team.binC));
	row.appendChild(makePercentageCell(team.binD));
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
	row.appendChild(makePercentageCell(team.frontLeft));
	row.appendChild(makePercentageCell(team.frontRight));
	row.appendChild(makePercentageCell(team.backLeft));
	row.appendChild(makePercentageCell(team.backRight));
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
