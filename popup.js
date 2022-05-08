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
                    console.log(upcomingDates);
                    var startList = new StartList(response.allProbableStarts);
                    console.log(startList);

                    addPitchersToPopup(startList, upcomingDates);
                });
        });
}, false);

function addPitchersToPopup(startList, upcomingDates) {
    var weekTable = document.getElementById('thisWeek');
    var firstDateOfNextWeek = startList.getFirstDateOfNextWeek(upcomingDates);
    // name, team, opponent, date, checkbox // photo?

    for (let i = 0; i < startList.length; i++) {

        var s = startList[i];

        if (s.date > firstDateOfNextWeek) {
            weekTable = document.getElementById('nextWeek');
        }

        createStartRow(weekTable, s);
    }
}

function createStartRow(table, start) {
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
    var shortDate = start.date.toDateString().split("202")[0];
    tdDate.innerHTML = shortDate;

    var tdActive = d.createElement('td');
    tdActive.setAttribute("name", "active");
    var active = d.createElement("input");
    active.setAttribute("type", "checkbox");
    active.setAttribute("checked", "");
    tdActive.appendChild(active);

    tr.appendChild(tdActive);
    tr.appendChild(tdName);
    tr.appendChild(tdTeam);
    tr.appendChild(tdOpponent);
    tr.appendChild(tdDate);

    table.appendChild(tr);
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