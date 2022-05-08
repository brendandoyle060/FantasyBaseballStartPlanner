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
                });
        });

    var thisWeekTable = document.getElementById('firstStarter');
    thisWeekTable.addEventListener('click', function () {
        chrome.tabs.getSelected(function (tab) {
            d = document;
            var tr = d.createElement('tr');

            var tdName = d.createElement('td');
            tdName.setAttribute("name", "name");
            tdName.innerHTML = 'tdName example';
            var tdTeam = d.createElement('td');
            tdTeam.setAttribute("name", "team");
            tdTeam.innerHTML = 'tdTeam example';
            var tdOpponent = d.createElement('td');
            tdOpponent.setAttribute("name", "opponent");
            tdOpponent.innerHTML = 'tdOpponent example';
            var tdDate = d.createElement('td');
            tdDate.setAttribute("name", "date");
            tdDate.innerHTML = 'tdDate example';
            var tdToggle = d.createElement('td');
            tdToggle.setAttribute("name", "toggle");
            tdToggle.innerHTML = 'tdToggle example';

            tr.appendChild(tdName);
            tr.appendChild(tdTeam);
            tr.appendChild(tdOpponent);
            tr.appendChild(tdDate);
            tr.appendChild(tdToggle);

            table = d.getElementById("thisWeek");
            table.appendChild(tr);

        });
    }, false);
}, false);

function createStartRow(tableId) {
    // name, team, opponent, date, toggle // photo?
    var tr = document.createElement('tr');

    var tdName = document.createElement('td');
    var tdTeam = document.createElement('td');
    var tdOpponent = document.createElement('td');
    var tdDate = document.createElement('td');
    var tdToggle = document.createElement('td');

    tr.appendChild(tdName);
    tr.appendChild(tdTeam);
    tr.appendChild(tdOpponent);
    tr.appendChild(tdDate);
    tr.appendChild(tdToggle);

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