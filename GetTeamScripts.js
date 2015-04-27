var form;
var xmlhttp;
var tableBody;
var response;
var sorts = [];
var sortNames = [];

addSorter("teamNumber", true);
addSorter("matchNumber", true);

if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp = new XMLHttpRequest();
}
else {
	// code for IE6, IE5
	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

// Assign the tableBody variable and download new data from the server when the page has loaded.
window.onload = function() {
	tableBody = document.getElementById("resultTableBody");
	reloadCache();
}

// This runs when new data has been received from the server.
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

// Gets a string representing the current date and time.
function getDateString() {
	var date = new Date();
	var dateString = "" + date.getHours() % 12 + ":" + date.getMinutes() + ":" + date.getSeconds() + (date.getHours() > 12 ? " PM" : " AM");
	dateString += " on " + date.toDateString();
	return dateString;
}

// Makes an html cell with text and a color.
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

// Makes an html cell based on a number and the expected maximum
function makeNumberCell(number, max) {
	if (number) {
		return makeCell(number, getColor(number, max));
	}
	else {
		return makeCell(number);
	}
}

// Gets the color a cell should be based on a number and the expected maximum
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

// Creates an html cell based on to values, the first indicating a (robot/coop) set and the second indicating a stack
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

// Creates an html cell based on boolean data
function makeBooleanCell(value) {
	if (value == true || value == 1 || value == "1") {
		return makeCell("Yes", "#afa");
	}
	else {
		return makeCell("No", "#faa");
	}
}

// Loads a new, up-to-date version of the data from the server.
function reloadCache() {
	document.getElementById("cacheIndicator").src = "images/loading.gif";
	xmlhttp.open("GET","GetTeam.php?team=All",true);
	xmlhttp.send();
}

// Clears the table and appends everything.  Run this whenever the data changes.
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

// Creates a table row based on a team's data
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

// Clears all values out of the table so new ones can be appended
function clearTable(teams) {
	var oldBody = tableBody;
	var newBody = document.createElement("tbody");
	tableBody = newBody;
	oldBody.parentNode.replaceChild(tableBody, oldBody);
}

// Appends an array of teams to the table, sorting them by the current set of sorting functions
function appendTable(teams) {
	var myTeams = teams.slice(); // Don't touch the original array
	myTeams.sort(sorter);
	for (team in myTeams) {
		tableBody.appendChild(makeRow(myTeams[team]));
	}
}

// Filters an array of teams by team number.
function filter(teamNo, array) {
	var filteredData = [];
	for (id in array) {
		if (array[id].teamNumber == teamNo && teamNo) {
			filteredData.push(array[id]);
		}
	}
	return filteredData;
}

// Adds a sorter function to sort the data, input the column you want sorted by.
// If the data is already sorted by that column, the sort will be reversed.
function addSorter(column, cancelRedisplay) {
	if (sortNames[sortNames.length - 1] == column) {
		sorts[sorts.length - 1] = reverseSorter(sorts[sorts.length - 1]);
	}
	else {
		var currentPos = sortNames.indexOf(column);
		if (currentPos > -1) {
			sortNames.splice(currentPos, 1);
			sorts.splice(currentPos, 1);
		}
		sortNames.push(column);
		if (column == "matchNumber") {
			sorts.push(sortByMatch);
		}
		else if (column == "allianceToteSet" || column == "allianceToteStack") {
			sorts.push(makeSorter("allianceToteSet", "stackSet", "allianceToteStack"));
		}
		else if (column == "coopToteSet" || column == "coopToteStack") {
			sorts.push(makeSorter("coopToteSet", "stackSet", "coopToteStack"));
		}
		else if (column == "notes") {
			sorts.push(makeSorter(column, "text"));
		}
		else if (column == "teamNumber") {
			sorts.push(makeSorter(column, "lowNumber"));
		}
		else {
			sorts.push(makeSorter(column, "highNumber"));
		}
	}
	if (!cancelRedisplay) {
		redisplay();
	}
}

// Makes a sorter function based on a column, type, and a second column if necessary for the type
// Types are: highNumber (sorts a number value from highest to lowest)
// lowNumber (sorts a number value from lowest to highest)
// text (sorts text from a to z)
// stackSet (sorts two boolean values assuming that item 0 indicates a set and item 2 indicates a stack)
function makeSorter(column, type, column2) {
	if (column == undefined) {
		return function() {return 0;}
	}
	if (type == undefined) {
		type = "highNumber";
	}
	if (type == "highNumber") {
		return function(a, b) {
			return b[column] - a[column];
		}
	}
	else if (type == "lowNumber") {
		return function(a, b) {
			return a[column] - b[column];
		}
	}
	else if (type == "text") {
		return function(a, b) {
			if (a[column].toLowerCase() > b[column].toLowerCase()) {
				return 1;
			}
			else if (a[column].toLowerCase() < b[column].toLowerCase()) {
				return -1;
			}
			else {
				return 0;
			}
		}
	}
	else if (type == "stackSet") {
		if (column2 == undefined) {
			return function() {return 0;}
		}
		return function(a, b) {
			if (a[column2] > 0 && b[column2] > 0) {
				return 0;
			}
			else {
				var stack = b[column2] - a[column2];
				if (stack == 0) {
					return b[column] - a[column];
				}
				else {
					return stack;
				}
			}
		}
	}
}

// Goes through the sorts array and tries each sorting function until one works
function sorter(a, b) {
	for (var i = sorts.length - 1; i >= 0; i--) {
		var order = sorts[i](a, b);
		if (order != 0) {
			return order;
		}
	}
	return 0;
}

// Returns a sorting function that sorts in the opposite direction as the inputted sorting function
function reverseSorter(func) {
	return function(a, b) {
		return func(b, a);
	}
}

// Sorting function that sorts by the match info
function sortByMatch(a, b) {
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
}