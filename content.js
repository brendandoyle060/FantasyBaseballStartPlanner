// content.js

(function () {
    // Ensure that this content script will not run more than once per click
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    chrome.runtime.onMessage.addListener(
        function iconClicked(request, sender, sendResponse) {

            if (request.message === "clicked_browser_action") {

                var allTrs = getAllPitcherTrs();
                console.log('Before findAllStartingPitchers...allTrs:');
                console.log(allTrs);
                findAllStartingPitchers(allTrs);

                // The url that we're visiting
                var newTabUrl = "https://fantasy.espn.com/baseball/team";
                // Open a new tab to that url
                chrome.runtime.sendMessage({
                    "message": "open_new_tab",
                    "url": newTabUrl,
                    "index": request.index
                });

            }
        }
    );

    /**
     * 
     * @param {NodeList} trs All \<tr\> elements in the Schedule table
     * @returns {NodeList} a list which only contains the \<tr\> elements 
     *      for a pitcher who will start at least one game this week 
     */
    function findAllStartingPitchers(trs) {
        console.log('Start findAllStartingPitchers');
        var startingPitcherTrs;
        trs.forEach(
            function (currentTr, currentIndex, listObj) {
                if (checkTrForProbablePitcherElement(currentTr).length > 0) {
                    console.log(currentTr + ', ' + currentIndex + ', ' + this);
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

})();