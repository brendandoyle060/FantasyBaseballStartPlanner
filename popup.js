let leagueId;
let teamId;
document.addEventListener('DOMContentLoaded', function () {

    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    },
        function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    from: "popup",
                    msg: "getPitcherData"
                },
                function sendInfoToPopup(response) {
                    var upcomingDates = getDates(response.numOfUpcomingDates);
                    // console.log(upcomingDates);
                    var startList = new StartList(response.allProbableStarts);
                    // console.log(startList);
                    leagueId = response.leagueId;
                    teamId = response.teamId;
                    let numStarts = mMatchupApiRequest(leagueId, teamId, setNumStartsElement);
                    // console.log("numStarts: " + numStarts);

                    addPitchersToPopup(startList, upcomingDates);
                    setNumRemainingStarts("thisWeek");

                    document.querySelector(".leagueId").setAttribute("value", leagueId);
                    document.querySelector(".teamId").setAttribute("value", teamId);
                });
        });
}, false);

/**
 *
 * @param {String} week get the current number of starts 
 * that are marked as active within the given week
 */
function setNumRemainingStarts(week) {
    let queryString = "table#" + week + " td[name='active'] input[type='checkbox']";
    let inputs = document.querySelectorAll(queryString);
    let remainingStarts = 0;
    for (let i of inputs) {
        if (i.checked) {
            remainingStarts++;
        }
    }
    let startsPace = remainingStarts + Number(document.getElementById("numStarts").innerText);
    document.getElementById("startsPace").innerHTML = startsPace;
}

/**
 *
 * @param {String} numStarts the number of starts that have been used so far this week
 */
function setNumStartsElement(numStarts) {
    // console.log("callback - numStarts: " + numStarts);
    document.getElementById("numStarts").innerHTML = numStarts.split(".")[0];
    setNumRemainingStarts("thisWeek");
}

/**
 * Fire the mMatchup request to the ESPN API
 * @param {Number} leagueId the unique ID number for this league
 * @param {Number} teamId the user's teamId
 * @returns the output from findUsersMatchup()
 */
function mMatchupApiRequest(leagueId, teamId, callback) {

    let currentYear = new Date().getFullYear();

    let request = new XMLHttpRequest();
    let url = `https://fantasy.espn.com/apis/v3/games/flb/seasons/${currentYear}/segments/0/leagues/${leagueId}?view=mMatchup`;
    // console.log("url: " + url);
    request.open("GET", url);

    let numStarts = "";

    request.onload = function () {

        // console.log(request.responseText);

        let json = JSON.parse(request.responseText);
        numStarts = findUsersMatchup(json, teamId, callback);
        // console.log("mMatchupApiRequest numStarts: " + numStarts);
        return numStarts;
    }
    request.send();

}

/**
 *
 * @param {Object} json the JSON returned by the mMatchup API request
 * @param {Number} teamId the user's teamId
 * @returns the output of getNumStarts()
 */
function findUsersMatchup(json, teamId, callback) {
    let currentMatchupPeriod = json.status.currentMatchupPeriod;
    let numTeams = json.status.teamsJoined;
    let numMatchups = numTeams / 2;

    // console.log("json.status.currentMatchupPeriod: " + currentMatchupPeriod);
    // console.log("json.status: " + JSON.stringify(json.status));

    for (let i = 0; i < numMatchups; i++) {
        // currentMatchupPeriod starts at 1, and there are numMatchups blocks of JSON in the schedule array for each matchupPeriod.
        // So for example, if there are 10 teams in the league (and thus, 5 matchups),
        // the blocks for matchupPeriod 1 will be at schedule indexes 0-4,
        // the blocks for matchupPeriod 2 will be at schedule indexes 5-9, etc.
        let index = (currentMatchupPeriod - 1) * numMatchups + i;
        let schedule = json.schedule[index];

        // console.log("index: " + index);
        // console.log("schedule: " + JSON.stringify(schedule));

        // The user can be either the home or the away team on any given week, so we check both blocks
        // in a given matchup, and return just the number of starts used in the block with the user's teamId
        if (JSON.stringify(schedule.away.teamId) === teamId) {
            return getNumStarts(schedule.away, callback);
        }
        if (JSON.stringify(schedule.home.teamId) === teamId) {
            return getNumStarts(schedule.home, callback);
        }
    }
}

/**
 * 
 * @param {Object} homeOrAway the JSON structure which holds data for the user's team in this week's matchup 
 * @returns the number of Starts that have already been used during this matchup (as of EOD yesterday)
 */
function getNumStarts(homeOrAway, callback) {

    let statBySlot = homeOrAway.cumulativeScore.statBySlot;
    // console.log("statBySlot: " + JSON.stringify(statBySlot));

    // If the team has not started any pitchers yet this week,
    // the "statBySlot" key will hold the value "null",
    // instead of the JSON structure that it typically holds.
    if (JSON.stringify(statBySlot) === "null") {
        return callback("0.0");
    }
    else {
        // console.log("statBySlot[22]): " + JSON.stringify(statBySlot[22]));
        // console.log("statBySlot[22].value): " + JSON.stringify(statBySlot[22].value));
        // console.log("statBySlot[22].statId): " + JSON.stringify(statBySlot[22].statId));

        // "33" is the statId for pitcher starts
        if (JSON.stringify(statBySlot[22].statId) === "33") {
            // console.log("JSON.stringify(statBySlot[22].value): " + JSON.stringify(statBySlot[22].value));
            return callback(JSON.stringify(statBySlot[22].value));
        }
        else {
            console.error("Unexpected JSON structure for statBySlot: " + JSON.stringify(statBySlot));
            return callback("Error, see Console");
        }
    }

}


function addPitchersToPopup(startList, upcomingDates) {
    var weekTable = document.getElementById('thisWeek');
    var firstDateOfNextWeek = startList.getFirstDateOfNextWeek(upcomingDates);
    // name, team, opponent, date, checkbox // photo?

    for (let i = 0; i < startList.length; i++) {

        var s = startList[i];
        if (s.date < firstDateOfNextWeek) {
            weekTable = document.getElementById('thisWeek');
        }
        else {
            weekTable = document.getElementById('nextWeek');
        }

        weekTable.appendChild(createStartRow(s));
    }

    $("input:checkbox").change(function () {
        if (this.checked) {
            // console.log("checked name: " + this.name);
            $(this).prop("checked", true);
            setNumRemainingStarts("thisWeek");
        }
        else {
            // console.log("unchecked name: " + this.name);
            $(this).prop("checked", false);
            setNumRemainingStarts("thisWeek");
        }
    });
}

/**
 * 
 * @param {Start} start the object containing all the relevant information we're adding
 *      to this table
 * @returns the <tr> element that will be added to the appropriate table
 */
function createStartRow(start) {
    // name, team, opponent, date, toggle // photo?
    var d = document;

    var tr = d.createElement('tr');
    tr.setAttribute("class", "pitcher");

    var tdName = d.createElement('td');
    tdName.setAttribute("name", "playerName");
    tdName.innerHTML = start.pitcher.name;

    var tdTeam = d.createElement('td');
    tdTeam.setAttribute("name", "team");
    tdTeam.innerHTML = start.pitcher.team;

    var tdOpponent = d.createElement('td');
    tdOpponent.setAttribute("name", "opponent");
    tdOpponent.innerHTML = start.opponent;

    var tdDate = d.createElement('td');
    tdDate.setAttribute("name", "date");
    // TODO: fix split matcher so that it works more than 7 years from now
    var shortDate = start.date.toDateString().split("202")[0].trim();
    tdDate.innerHTML = shortDate;

    var tdActive = d.createElement('td');
    tdActive.setAttribute("name", "active");
    var active = d.createElement("input");
    active.setAttribute("type", "checkbox");
    active.setAttribute("name", start.pitcher.name + " " + shortDate);
    active.checked = true;
    tdActive.appendChild(active);

    tr.appendChild(tdActive);
    tr.appendChild(tdName);
    tr.appendChild(tdTeam);
    tr.appendChild(tdOpponent);
    tr.appendChild(tdDate);

    return tr;
}

/**
 * By default, there are currently 8 days shown on ESPN's Schedule page. 
 * However, taking numDates as an arg will allow this function to continue working
 * even if ESPN changes this in the future. 
 * 
 * @param {Number} numDates the number of upcoming dates shown in ESPN's Schedule page
 * @returns Array of Date objects representing the upcoming numDates days, including Today
 */
function getDates(numDates) {

    let dates = [];
    let today = new Date();

    for (let i = 0; i < numDates; i++) {
        let newDate = new Date();
        newDate.setDate(today.getDate() + i);
        dates.push(newDate);
    }

    return dates;
}