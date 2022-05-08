// content.js

(function () {
    // Ensure that this content script will not run more than once per click
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    // When the extension's icon is clicked, grab pitcher data from the 
    //      schedule table and pass it to popup.js
    chrome.runtime.onMessage.addListener(
        function iconClicked(request, sender, sendResponse) {

            if ((request.from === "popup") && (request.msg === "getPitcherData")) {

                var allTrs = getAllPitcherTrs();
                var allStarterTrs = findAllStartingPitchers(allTrs);
                let allProbableStarts = [];

                for (let i of allStarterTrs) {
                    let x = getAllProbableStarts(i);
                    allProbableStarts.push(x);
                }

                // Pass pitcher data from content script to popup.js
                sendResponse({
                    "from": "content",
                    "allProbableStarts": allProbableStarts,
                    "numOfUpcomingDates": getNumberOfUpcomingDates(allStarterTrs[0])
                });
            }
        }
    );

    /**
     * 
     * @param {NodeList} trs All \<tr\> elements in the Schedule table
     * @returns {Array} an array which only contains the \<tr\> elements 
     *      for a pitcher who will start at least one game this week 
     */
    function findAllStartingPitchers(trs) {
        var startingPitcherTrs = [];
        trs.forEach(
            function (currentTr, currentIndex, listObj) {
                if (checkTrForProbablePitcherElement(currentTr).length > 0) {
                    startingPitcherTrs.push(currentTr);
                }
            },
            'fASP_arg'
        );
        return startingPitcherTrs;
    }

    /**
     * 
     * @returns {NodeList} a list of all \<tr\> elements in the page's Schedule table
     */
    function getAllPitcherTrs() {
        return document.querySelectorAll("table.Table tr");
    }

    /**
     * 
     * @param {HTMLTableRowElement} tr a \<tr\> element containing 
     *      information about a pitcher
     * @returns {NodeList} all \<td\> elements that indicate that 
     *      the pitcher is that specific game's Probable Pitcher
     */
    function checkTrForProbablePitcherElement(tr) {
        return tr.querySelectorAll("td strong[title='Probable Pitcher']");
    }

    /**
     * 
     * @param {HTMLTableRowElement} tr a \<tr\> element containing 
     *      information about a pitcher
     * @returns {Element} the column of the given tr that contains general info about the pitcher
     */
    function getPlayerColumn(tr) {
        return tr.querySelector("div.player__column");
    }


    /**
     * 
     * @param {HTMLTableRowElement} tr a \<tr\> element containing 
     *      information about a pitcher
     * @returns {String} the pitcher's name
     */
    function getName(tr) {
        return getPlayerColumn(tr).getAttribute("title");
    }

    /**
     * 
     * @param {HTMLTableRowElement} tr a \<tr\> element containing 
     *      information about a pitcher
     * @returns {String} the team that the pitcher plays for
     */
    function getTeam(tr) {
        return tr.querySelector("span.playerinfo__playerteam").textContent;
    }

    /**
     * 
     * @param {HTMLTableRowElement} tr a \<tr\> element containing 
     *      information about a pitcher
     * @returns {NodeList} a Nodelist of the given pitcher's potential opponents
     */
    function getOpponents(tr) {
        return tr.querySelectorAll("td.Table__TD div.opp");
    }

    /**
     * Currently, there are 8 upcoming dates listed in ESPN's schedule table 
     * (including today). However, it's important that we check how many dates are shown
     * in the table, in case this changes in the future.
     * 
     * @param {HTMLTableRowElement} tr a \<tr\> element containing 
     *      information about a pitcher
     * @returns {Number} the number of upcoming dates listed in the Schedule table
     */
    function getNumberOfUpcomingDates(tr) {
        return getOpponents(tr).length;
    }

    /**
     * 
     * @param {HTMLTableRowElement} tr a \<tr\> element containing 
     *      information about a single pitcher
     * @returns an Array containing the pitcher's name and team, then one sub-array per start,
     *      which contains the name of the opponent and the date
     */
    function getAllProbableStarts(tr) {
        let playerCol = getPlayerColumn(tr);
        let allOpponents = getOpponents(tr);
        let dates = getDates(allOpponents.length);

        // We'll start our array with just the pitcher's name and the team that they play for,
        // since that stays the same for each of that pitcher's starts. 
        let allProbableStarts = [getName(tr), getTeam(tr)];

        for (let i = 0; i < allOpponents.length; i++) {

            /**
             * Today's game (which will always be at allOpponents[0]) is the only one that has
             * the Probable Pitcher ("PP") indicator in a different element than div.opp, hence
             * the separate check for when i === 0.
             */
            if ((i === 0) && (playerCol.querySelector(".playerinfo__start-indicator[title='Probable Pitcher']"))
                || allOpponents[i].querySelector(".playerinfo__start-indicator[title='Probable Pitcher']")) {

                let opp = trimTeamString(allOpponents[i].textContent);
                allProbableStarts.push([opp, i]);

            }
        }

        console.log("allProbableStarts:");
        console.log(allProbableStarts);
        return allProbableStarts;
    }

    /**
     * Often, the Probable Pitcher "PP" text is grabbed 
     * along with a team's name.
     * There's no good way to avoid this with the selector, 
     * so we just remove it here, afterward.
     * @param {String} team 
     * @returns a cleaned-up version of the given team abbreviation String
     */
    function trimTeamString(team) {

        let str = team.trim();
        let teamLen = getTeamAbbvLength(str);

        if (str.startsWith('@')) {
            return str.substring(0, teamLen + 1);
        }
        else {
            return str.substring(0, teamLen);
        }
    }

    /**
     * The given String may contain extra text, such as the 
     * Probable Pitcher "PP" indicator. So we check to see if the given String 
     * contains any of the four 2-letter abbreviations for a team's name. 
     * If not, then the team's abbreviation is 3 characters long. 
     * @param {String} team 
     * @returns the length of the team's abbreviated name
     */
    function getTeamAbbvLength(team) {
        // Almost all MLB teams have a 3-letter abbreviation, but we 
        // have to check the 4 outliers:
        let shortAbbv = ["KC", "SD", "SF", "TB"];
        for (let a of shortAbbv) {
            if (team.match(a)) {
                return 2;
            }
        }

        return 3;
    }

    /**
     * 
     * @param {Number} numDates 
     * @returns Array of Date objects representing the upcoming numDates days, including Today
     */
    function getDates(numDates) {

        let dates = [];
        let today = new Date();

        // By default, there are currently 8 days shown on the Schedule page. 
        // However, taking numDates as an arg will allow this function to continue working
        // even if ESPN changes this in the future. 
        for (let i = 0; i < numDates; i++) {
            let newDate = new Date();
            newDate.setDate(today.getDate() + i);
            dates.push(newDate);
        }

        return dates;
    }

})();