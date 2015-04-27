var form
var xmlhttp;
var queue_xmlhttp
var lastRequest;
var queue = [];
if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp = new XMLHttpRequest();
	queue_xmlhttp = new XMLHttpRequest();
}
else {
	// code for IE6, IE5
	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	queue_xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

window.onload = function() {
	form = document.getElementById("inputForm");
	checkMatchType();
	for (var e in form.elements) {
		if (form.elements[e].type == "number" && !form.elements[e].prevoninput) {
			form.elements[e].prevoninput = form.elements[e].oninput;
			if (form.elements[e].name != "matchNo" && form.elements[e].name != "elimNo" && form.elements[e].name != "teamNo") {
				form.elements[e].value = 0;
			}
			if (form.elements[e].name != "matchNo" && form.elements[e].name != "elimNo" && form.elements[e].name != "teamNo") {
			}
			if (!form.elements[e].prevoninput) {
				form.elements[e].prevoninput = function(){};
			
			}
			form.elements[e].oninput = function() {
				checkBounds(this);
				if (this.prevoninput) {
					this.prevoninput();
				}
			};
		}
	}
}

function checkBounds(element) {
	if (!/^-?[\d.]+(?:e-?\d+)?$/.test(element.value)) {
		element.value = "";
	}
	else {
		if (element.value * 1 > element.max) {
			element.value = element.max;
		}
		else if (element.value * 1 < element.min) {
			element.value = element.min;
		}
	}
}

function checkMatchType() {
	var matchType = form.elements["matchType"].value;
	var elimNoInput = form.elements["elimNo"];
	var matchNoInput = form.elements["matchNo"];
	if (matchType == "Quarterfinals" || matchType == "Semifinals") {
		elimNoInput.style.display = "inline";
		if (matchType == "Quarterfinals") {
			elimNoInput.max = 4;
		}
		else {
			elimNoInput.max = 2;
			if (elimNoInput.value > 2) {
				elimNoInput.value = 2;
			}
		}
	}
	else {
		elimNoInput.style.display = "none";
		elimNoInput.value = "";
	}
	if (matchType == "Qualifications" || matchType == "Other" || matchType == "Practice") {
		matchNoInput.max = 999;
	}
	else {
		matchNoInput.max = 3;
	}
	checkBounds(matchNoInput);
	checkBounds(elimNoInput);
}

function checkTotesStacked() {
	var totesStacked = form.elements["teleTotesStacked"].value;
	var totesStackedLabel = document.getElementById("teleTotesStackedLabel");
	var highestStackInput = form.elements["teleLargestToteStack"];
	var highestStackLabel = document.getElementById("teleLargestToteStackLabel");
	var highestContainerInput = form.elements["teleHighestContainerPlaced"];
	var containersPlacedInput = form.elements["teleContainersPlaced"];
	var containersPlacedLabel = document.getElementById("teleContainersPlacedLabel");
	var containersPlacedNewline = document.getElementById("containersPlacedNewline");
	var numStacksInput = form.elements["teleToteStacks"];
	var numStacksLabel = document.getElementById("teleToteStacksLabel");
	var numStacksNewline = document.getElementById("teleToteStacksNewline");
	if (totesStacked > 0) {
		highestStackInput.style.display = "inline";
		highestStackLabel.style.display = "inline";
		totesStackedLabel.innerHTML = "Totes stacked,";
	}
	else {
		highestStackInput.style.display = "none";
		highestStackLabel.style.display = "none";
		highestStackInput.value = 0;
		totesStackedLabel.innerHTML = "Totes stacked";
	}

	if (numStacksInput.value < 7) {
		//containersPlacedInput.max = Number(numStacksInput.value);
	}
	else {
		containersPlacedInput.max = 7;
	}
}

function checkContainersPlaced () {
	var containersPlaced = form.elements["teleContainersPlaced"].value;
	var containersPlacedLabel = document.getElementById("teleContainersPlacedLabel");
	var highestContainerInput = form.elements["teleHighestContainerPlaced"];
	var highestContainerLabel = document.getElementById("teleHighestContainerPlacedLabel");
	if (containersPlaced > 0) {
		highestContainerInput.style.display = "inline";
		highestContainerLabel.style.display = "inline";
		containersPlacedLabel.innerHTML = "Containers stacked,";
	}
	else {
		highestContainerInput.style.display = "none";
		highestContainerLabel.style.display = "none";
		highestContainerInput.value = 0;
		containersPlacedLabel.innerHTML = "Containers stacked";
	}
}

function checkNoodles(lastChanged) {
	var containersTaken = Number(form.elements["teleContainersTakenFromStep"].value);
	var containersInput = form.elements["teleNoodlesInContainers"];
	var containers = containersInput.value * 1;
	var landfillInput = form.elements["teleNoodlesInLandfill"];
	var landfill = landfillInput.value * 1;
	var thrownInput = form.elements["teleNoodlesThrown"];
	var thrown = thrownInput.value * 1;
	var minAllianceNoodlesInLandfill = landfill - 10;
	if (minAllianceNoodlesInLandfill < 0) {minAllianceNoodlesInLandfill = 0;}
	var noodlesUsed = containers + minAllianceNoodlesInLandfill + thrown;
	if (noodlesUsed > 10) {
		var noodlesOver = noodlesUsed - 10;
		if (lastChanged == "Container") {
			if (minAllianceNoodlesInLandfill > noodlesOver) {
				landfillInput.value = landfill - noodlesOver;
			}
			else {
				thrownInput.value = thrown - (noodlesOver - minAllianceNoodlesInLandfill);
				landfillInput.value = 10;
			}
		}
		else if (lastChanged == "Landfill") {
			if (thrownInput.value > noodlesOver) {
				thrownInput.value = thrown - noodlesOver;
			}
			else {
				containersInput.value = containers - (noodlesOver - thrown);
				thrownInput.value = 0;
			}
		}
		else {
			if (containersInput.value > noodlesOver) {
				containersInput.value = containers - noodlesOver;
			}
			else {
				landfillInput.value = landfill - (noodlesOver - containers);
				containersInput.value = 0;
			}
		}
	}
}

function checkCoopTotes() {
	var totesInput = form.elements["coopTotesPlaced"];
	var totesLabel = document.getElementById("coopTotesPlacedLabel");
	var stackedInput = form.elements["coopTotesStacked"];
	var stackedLabel = document.getElementById("coopTotesStackedLabel");
	var allianceSet = form.elements["coopToteSet"];
	if (totesInput.value > 0) {
		totesLabel.innerHTML = "Coopertition totes placed,";
		stackedInput.style.display = "inline";
		stackedLabel.style.display = "inline";
	}
	else {
		totesLabel.innerHTML = "Coopertition totes placed";
		stackedInput.style.display = "none";
		stackedLabel.style.display = "none";
		stackedInput.value = 0;
	}
	if (stackedInput.value > 3) {
		allianceSet.value = "Stack";
	}
	else if (totesInput.value > 3) {
		allianceSet.value = "Set";
	}
}

function verifyForm() {
	if (form.elements["matchType"].value == "Quarterfinals" || form.elements["matchType"].value == "Semifinals") {
		if (!form.elements["elimNo"].value) {
			alert("Please input a value for the elimination bracket.");
			return false;
		}
	}
	if (!form.elements["matchNo"].value) {
		alert("Please input a match number.");
		return false;
	}
	if (!form.elements["teamNo"].value) {
		alert("Please input a team number.");
		return false;
	}
	return true;
}

xmlhttp.onreadystatechange = function() {
	if(xmlhttp.readyState == 4){
		if (xmlhttp.responseText) {
			document.getElementById("success").innerHTML = "Success!";
			setTimeout(function() {
				document.getElementById("success").innerHTML = "";
			}, 2000);
			document.getElementById("output").innerHTML = "Last SQL Query: " + xmlhttp.responseText;
		}
		else {
			if (queue.length == 0) {
				queue.push(lastRequest);
			}
			else {
				queue.push(lastRequest);
				setTimeout(function() {
					submitQueue(true);
				}, 10000);
			}
			document.getElementById("success").innerHTML = "Couldn't find server, queued requests: " + queue.length;
		}
	}
}

function submitQueue(retry) {
	if (queue.length > 0) {
		if (retry) {
			document.getElementById("success").innerHTML = "Retrying...";
		}
		queue_xmlhttp.open("POST","ScoutingInput.php",true);
		queue_xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		queue_xmlhttp.send(queue[0]);
	}
}

queue_xmlhttp.onreadystatechange = function() {
	if (queue_xmlhttp.readyState == 4) {
		if (queue_xmlhttp.responseText) {
			queue.shift();
			document.getElementById("output").innerHTML = "Last SQL Query: " + xmlhttp.responseText;
			if (queue.length > 0) {
				document.getElementById("success").innerHTML = "Found server, " + queue.length + " requests remain";
				setTimeout(submitQueue, 100);
			}
			else {
				document.getElementById("success").innerHTML = "Success!";
				setTimeout(function() {
					document.getElementById("success").innerHTML = "";
				}, 2000);
			}
		}
		else {
			setTimeout(function() {
				submitQueue(true);
			}, 10000);
			document.getElementById("success").innerHTML = "Couldn't find server, queued requests: " + queue.length;
		}
	}
}

function submitWithAJAX() {
	if (verifyForm()) {
		xmlhttp.open("POST","ScoutingInput.php",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		var request = "";
		var elements = [];
		for (var elementID in form.elements) {
			if (form.elements[elementID].name) {
				if (form.elements[elementID].type) {
					if (elements.indexOf(form.elements[elementID].name) == -1) {
						elements.push(form.elements[elementID].name);
					}
				}
			}
		}
		for (elementID in elements) {
			element = form.elements[elements[elementID]];
			if (element.type == "checkbox") {
				if (element.checked) {
					request += "&" + elements[elementID] + "=on";
				}
				else {
					request += "&" + elements[elementID] + "=";
				}
			}
			else {
				request += "&" + elements[elementID] + "=" + element.value;
			}
		}
		document.getElementById("output").innerHTML = "Sending...";
		lastRequest = request;
		xmlhttp.send(request);
		console.log("Sending request: " + request);
		for (elementID in elements) {
			element = form.elements[elements[elementID]];
			if (element.type == "checkbox") {
				element.checked = false;
			}
			else if (element.value == "Set" || element.value == "Stack" || element.value == "None") {
				element.value = "None";
			}
			else if ((element.name == "matchNo" && !form.elements["elimNo"].value > 0)) {
				element.value++;
				checkBounds(element);
			}
			else if (element.name == "elimNo" && element.value > 0) {
				console.log("Elimno on");
				element.value++;
				if (element.value > element.max) {
					element.value = 1;
					form.elements["matchNo"].value++;
					checkBounds(form.elements["matchNo"]);
				}
			}
			else if (element.name == "matchType" || element.type == "submit" || element.name == "matchNo" || element.name == "elimNo") {
			}
			else if (element.type =="number" && element.name != "teamNo") {
				element.value = 0;
				if (element.oninput) {
					element.oninput();
				}
				if (element.onchange) {
					element.onchange();
				}
			}
			else {
				element.value = "";
				if (element.oninput) {
					element.oninput();
				}
				if (element.onchange) {
					element.onchange();
				}
			}
		}
	}
}
