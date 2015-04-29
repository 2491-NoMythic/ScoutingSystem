var form;
var xmlhttp;
var tableBody;
var response;
var sorts = [];
var sortNames = [];
var filters = new FilterGroup("any");

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
	document.getElementById("filters").appendChild(filters.htmlobject);
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
	var dateString = "" + date.getHours() % 12 + ":" + ("00" + date.getMinutes()).slice(-2) + ":" + ("00" + date.getSeconds()).slice(-2) + (date.getHours() > 12 ? " PM" : " AM");
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
		appendTable(filterByTeamno(document.getElementById("team1No").value, response));
		appendTable(filterByTeamno(document.getElementById("team2No").value, response));
		appendTable(filterByTeamno(document.getElementById("team3No").value, response));
		appendTable(filterByTeamno(document.getElementById("team4No").value, response));
		appendTable(filterByTeamno(document.getElementById("team5No").value, response));
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
	myTeams = filterWithFilter(teams, filters);
	myTeams.sort(sorter);
	for (team in myTeams) {
		tableBody.appendChild(makeRow(myTeams[team]));
	}
}

// Filters an array of teams by team number.
function filterByTeamno(teamNo, array) {
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

function showHideFilters() {
	var filterDiv = document.getElementById("filters");
	var filterButton = document.getElementById("showHideFilters");
	if (filterDiv.style.display == "none") {
		filterDiv.style.display = "block";
		filterButton.value = "Hide Filters";
	}
	else {
		filterDiv.style.display = "none";
		filterButton.value = "Show Filters";
	}
}

function filterWithFilter(array, filter) {
	var filteredData = [];
	for (id in array) {
		if (filter.check(array[id])) {
			filteredData.push(array[id]);
		}
	}
	return filteredData;
}

function Filter(owner, column, type, matcher, value, extraColumn) {
	this.owner = owner;
	this.col = column;
	this.filtertype = type;
	if (matcher == undefined) {
		switch (type) {
			case "text":
				this.matcher = "is";
				this.filtervalue = "";
				break;
			case "boolean":
				this.matcher = "is true";
				this.filtervalue = undefined;
				break;
			case "number":
				this.matcher = "equals";
				this.filtervalue = "0";
				break;
		}
		this.col2 = undefined;
	}
	else {
		this.matcher = matcher;
		this.filtervalue = value;
		this.col2 = extraColumn;
	}

	// Create the HTML object
	this.htmlobject = document.createElement("div");
	this.htmlobject.owner = this;
	var colSelectOpts = ["matchType", "matchNumber", "autoRobotMoved", "autoTotesMoved", "autoContainersMoved", "autoToteStack", "binA", "binB", "binC", "binD", "allianceRobotSet", "allianceContainerSet", "allianceToteSet", "teleTotesStacked", "teleToteStacks", "teleLargestToteStack", "teleContainersPlaced", "teleHighestContainerPlaced", "teleContainersTakenFromStep", "teleNoodlesInContainers", "teleNoodlesInLandfill", "teleNoodlesThrown", "coopTotesPlaced", "coopTotesStacked", "coopToteSet", "frontLeft", "frontRight", "backLeft", "backRight", "totalScore", "notes"];
	var colSelectNames = ["Match Type", "Match Number", "Robot Moved", "Auto Totes Moved", "Auto Containers Moved", "Auto Tote Stack", "Bin A", "Bin B", "Bin C", "Bin D", "Robot Set", "Container Set", "Tote Set", "Totes Stacked", "Tote Stacks", "Highest Tote Stack", "Containers Placed", "Highest Container Placed", "Containers Taken from Step", "Noodles in Containers", "Noodles in Landfill", "Noodles Thrown", "Coop Totes Placed", "Highest Coop Tote", "Coop Tote Set", "Front Left", "Front Right", "Back Left", "Back Right", "Total Score", "Notes"];
	var colSelectTypes = {
		matchType: "text",
		matchNumber: "number",
		autoRobotMoved: "boolean",
		autoTotesMoved: "number",
		autoContainersMoved: "number",
		autoToteStack: "boolean",
		binA: "boolean",
		binB: "boolean",
		binC: "boolean",
		binD: "boolean",
		allianceRobotSet: "boolean",
		allianceContainerSet: "boolean",
		allianceToteSet: "stackset",
		teleTotesStacked: "number",
		teleToteStacks: "number",
		teleLargestToteStack: "number",
		teleContainersPlaced: "number",
		teleHighestContainerPlaced: "number",
		teleContainersTakenFromStep: "number",
		teleNoodlesInContainers: "number",
		teleNoodlesInLandfill: "number",
		teleNoodlesThrown: "number",
		coopTotesPlaced: "number",
		coopTotesStacked: "number",
		coopToteSet: "stackset",
		frontLeft: "boolean",
		frontRight: "boolean",
		backLeft: "boolean",
		backRight: "boolean",
		totalScore: "number",
		notes: "text"
	}
	var type = makeHTMLSelect(colSelectOpts, colSelectNames, this.col)
	type.owner = this;
	type.onchange = function() {
		this.owner.col = this.value;
		this.owner.filtertype = colSelectTypes[this.value];
		this.owner.updateItemInfo();
		redisplay();
	}
	this.htmlobject.appendChild(type);
	this.iteminfo = document.createElement("span");
	this.htmlobject.appendChild(this.iteminfo);
	var buttons = document.createElement("span");
	buttons.style.float = "right";
	var tmp;
	tmp = document.createElement("button");
	tmp.innerHTML = "-";
	tmp.owner = this;
	tmp.onclick = function() {
		this.owner.owner.remove(this.owner);
	}
	buttons.appendChild(tmp);
	tmp = document.createElement("button");
	tmp.innerHTML = "+";
	tmp.owner = this;
	tmp.onclick = function() {
		this.owner.owner.newfilter(this.owner);
	}
	buttons.appendChild(tmp);
	tmp = document.createElement("button");
	tmp.innerHTML = "...";
	tmp.owner = this;
	tmp.onclick = function() {
		this.owner.owner.newgroup(this.owner);
	}
	buttons.appendChild(tmp);
	this.htmlobject.appendChild(buttons);
	this.updateItemInfo = function() {
		this.iteminfo.innerHTML = "";
		switch (this.filtertype) {
			case "text":
				this.matcher = "contains";
				var matcher = makeHTMLSelect(["is", "is not", "contains", "doesn't contain", "begins with", "ends with", "matches regex"], ["is", "is not", "contains", "doesn't contain", "begins with", "ends with", "matches regex"], this.matcher);
				matcher.owner = this;
				matcher.onchange = function() {
					this.owner.matcher = this.value;
					redisplay();
				}
				this.iteminfo.appendChild(matcher);
				this.filtervalue = "";
				var filtervalue = document.createElement("input");
				filtervalue.type = "text";
				filtervalue.owner = this;
				filtervalue.onchange = function() {
					this.owner.filtervalue = this.value;
					redisplay();
				}
				this.iteminfo.appendChild(filtervalue);
				break;
			case "boolean":
				this.matcher = "is true";
				var matcher = makeHTMLSelect(["is true", "is false"], ["is true", "is false"], this.matcher);
				matcher.owner = this;
				matcher.onchange = function() {
					this.owner.matcher = this.value;
					redisplay();
				}
				this.iteminfo.appendChild(matcher);
				break;
			case "number":
				this.matcher = "doesn't equal";
				var matcher = makeHTMLSelect(["equals", "doesn't equal", "is greater than", "is less than"], ["equals", "doesn't equal", "is greater than", "is less than"], this.matcher);
				matcher.owner = this;
				matcher.onchange = function() {
					this.owner.matcher = this.value;
					redisplay();
				}
				this.iteminfo.appendChild(matcher);
				this.filtervalue = "0";
				var filtervalue = document.createElement("input");
				filtervalue.type = "number";
				filtervalue.value = 0;
				filtervalue.owner = this;
				filtervalue.min = -9999;
				filtervalue.max = 99999;
				filtervalue.onchange = function() {
					this.owner.filtervalue = Number(this.value);
					redisplay();
				}
				this.iteminfo.appendChild(filtervalue);
				break;
			case "stackset":
				if (this.col == "allianceToteSet") {
					this.col2 = "allianceToteStack";
				}
				else if (this.col == "coopToteSet") {
					this.col2 = "coopToteStack";
				}
				else {
					console.log("Couldn't figure out second column to go with stackset column " + this.col);
				}
				this.matcher = "got a set or stack";
				var matcher = makeHTMLSelect(["got none", "got a set", "got a stack", "got a set or stack"], ["got none", "got a set", "got a stack", "got a set or stack"], this.matcher);
				matcher.owner = this;
				matcher.onchange = function() {
					this.owner.matcher = this.value;
					redisplay();
				}
				this.iteminfo.appendChild(matcher);
				break;
			default:
				console.log("updateItemInfo failed!  Couldn't identify filter type which was " + this.filtertype);
				break;
		}
		redisplay();
	}
	this.updateItemInfo();

	this.check = function(match) {
		switch (this.filtertype) {
			case "text":
				switch (this.matcher) {
					case "is":
						return match[this.col] == this.filtervalue;
						break;
					case "is not":
						return match[this.col] != this.filtervalue;
						break;
					case "contains":
						return match[this.col] != null && match[this.col].indexOf(this.filtervalue) != -1;
						break;
					case "doesn't contain":
						return match[this.col] != null && match[this.col].indexOf(this.filtervalue) == -1;
						break;
					case "begins with":
						return match[this.col] != null && match[this.col].indexOf(this.filtervalue) == 0;
						break;
					case "ends with":
						return match[this.col] != null && match[this.col].indexOf(this.filtervalue, match[this.col].length - this.filtervalue.length) != -1;
					case "matches regex":
						return new RegExp("/" + matcher + "/", "i").test(match[this.col]);
						break;
					default:
						console.log("Filter failed!  Couldn't identify matcher.  Filter type was " + this.filtertype + " and matcher was " + this.matcher);
						break;
				}
				break;
			case "boolean":
				switch (this.matcher) {
					case "is true":
						return match[this.col] > 0;
						break;
					case "is false":
						return match[this.col] == 0;
						break;
					default:
						console.log("Filter failed!  Couldn't identify matcher.  Filter type was " + this.filterType + " and matcher was " + this.matcher);
						break;
				}
			break;
			case "number":
				switch (this.matcher) {
					case "equals":
						return match[this.col] == this.filtervalue;
						break;
					case "doesn't equal":
						return match[this.col] != this.filtervalue;
						break;
					case "is greater than":
						return match[this.col] > this.filtervalue;
						break;
					case "is less than":
						return match[this.col] < this.filtervalue;
						break;
					default:
						console.log("Filter failed!  Couldn't identify matcher.  Filter type was " + this.filterType + " and matcher was " + this.matcher);
						break;
				}
				break;
			case "stackset":
				switch (this.matcher) {
					case "got none":
						return match[this.col] == 0 && match[this.col2] == 0;
						break;
					case "got a set":
						return match[this.col] > 0;
						break;
					case "got a stack":
						return match[this.col2] > 0;
						break;
					case "got a set or stack":
						return match[this.col] > 0 || match[this.col2] > 0;
						break;
					default:
						console.log("Filter failed!  Couldn't identify matcher.  Filter type was " + this.filterType + " and matcher was " + this.matcher);
						break;
				}
			default:
				console.log("Filter failed!  Couldn't identify filter type, which was " + this.filterType);
				break;
		}
	}
}

function FilterGroup(type, owner) {
	this.owner = owner;
	this.grouptype = type;
	this.filters = [];
	if (owner != undefined) {
		this.padding = owner.padding + 1;
	}
	else {
		this.padding = 0;
	}

	// Create the HTML object
	this.htmlobject = document.createElement("div");
	this.htmlobject.owner = this;
	var info = document.createElement("div");
	info.owner = this;
	var tmp;
	var type = makeHTMLSelect(["any", "all", "none"], ["Any", "All", "None"], this.grouptype);
	type.owner = this;
	type.onchange = function() {
		this.owner.grouptype = this.value;
		redisplay();
	}
	info.appendChild(type);
	info.appendChild(makeHTMLSpan("of the following are true"));
	var buttons = document.createElement("span");
	buttons.style.float = "right";
	if (this.owner) {
		tmp = document.createElement("button");
		tmp.innerHTML = "-";
		tmp.owner = this;
		tmp.onclick = function() {
			this.owner.owner.remove(this.owner);
		}
		buttons.appendChild(tmp);
	}
	tmp = document.createElement("button");
	tmp.innerHTML = "+";
	tmp.owner = this;
	tmp.onclick = function() {
		this.owner.newfilter(0);
	}
	buttons.appendChild(tmp);
	tmp = document.createElement("button");
	tmp.innerHTML = "...";
	tmp.owner = this;
	tmp.onclick = function() {
		this.owner.newgroup(0);
	}
	buttons.appendChild(tmp);
	info.appendChild(buttons);
	this.htmlobject.appendChild(info);
	this.filterHTML = document.createElement("div");
	this.filterHTML.style.paddingLeft = "32px";
	this.htmlobject.appendChild(this.filterHTML);
	this.redisplay = function() {
		this.filterHTML.innerHTML = "";
		for (var id in this.filters) {
			this.filterHTML.appendChild(this.filters[id].htmlobject);
		}
	}
	this.redisplay();

	this.remove = function(object) {
		var index = this.filters.indexOf(object);
		if (object instanceof FilterGroup) {
			var end = this.filters.splice(index, this.filters.length - index);
			end.shift();
			for (var id in object.filters) {
				object.filters[id].owner = this;
			}
			this.filters = this.filters.concat(object.filters, end);
		}
		else {
			if (index != -1) {
				this.filters.splice(index, 1);
			}
		}
		this.redisplay();
		redisplay();
	}
	this.newfilter = function(position) {
		var filter = new Filter(this, "matchNumber", "number", "doesn't equal", "0");
		this.add(filter, position);
	}
	this.newgroup = function(position) {
		var group = new FilterGroup("any", this);
		this.add(group, position);
	}
	this.add = function(filter, position) {
		if (position == undefined) {
			position = this.filters.length;
		}
		if (position instanceof Filter || position instanceof FilterGroup) {
			position = this.filters.indexOf(position) + 1;
			if (position == 0) {
				position = this.filters.length;
			}
		}
		if (filter instanceof Array) {
			for (id in filter) {
				this.add(filter[id]);
			}
		}
		else {
			filter.owner = this;
			this.filters.splice(position, 0, filter);
		}
		this.redisplay();
	}
	this.check = function(match) {
		if (this.filters.length == 0) {
			return true;
		}
		switch (this.grouptype) {
			case "all":
				for (var i in this.filters) {
					if (!this.filters[i].check(match)) {
						return false;
					}
				}
				return true;
				break;
			case "any":
				for (var i in this.filters) {
					if (this.filters[i].check(match)) {
						return true;
					}
				}
				return false;
				break;
			case "none":
				for (var i in this.filters) {
					if (this.filters[i].check(match)) {
						return false;
					}
				}
				return true;
				break;
			default:
				console.log("FilterGroup filter failed!  Couldn't identify group type, which was " + this.grouptype);
				break;
		}
	}
}

function makeHTMLSelect(options, optionNames, selected) {
	var select = document.createElement("select");
	for (var id in options) {
		var option = document.createElement("option");
		option.innerHTML = optionNames[id];
		option.value = options[id];
		if (options[id] == selected) {
			option.selected = true;
		}
		select.appendChild(option);
	}
	return select;
}

function makeHTMLSpan(text) {
	var span = document.createElement("span");
	span.innerHTML = text;
	return span;
}

function makeHTMLButton(text, onclick) {
	var button = document.createElement("input");
	button.type = "button";
	button.value = text;
	button.onclick = onclick;
	return button;
}
