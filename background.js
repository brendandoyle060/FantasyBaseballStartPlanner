// background.js

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.greeting === "toBackground") {
        var tabURL = "Not set yet";
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        },
            function (tabs) {

                if (tabs.length === 0) {
                    sendResponse({
                        "toPopup": tabURL
                    });
                    return;
                }

                tabURL = tabs[0].url;
                sendResponse({
                    "toPopup": tabURL
                });
            });
    }
    return true;
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(
    function inject(tab) {

        // console.log("browserAction onClicked");

        // Break if we're not on an ESPN Fantasy Baseball My Team page
        if (!isValidPage(tab.url)) {
            // console.log("if !isValidPage");
            return;
        }

        // console.log("created inject listener");

        // var myCode = "console.log('Testing...this code will execute as a content script');";
        chrome.tabs.executeScript(
            null,
            {
                file: "content.js"
            },
            function () {
                if (chrome.runtime.lastError) {
                    console.error("Script injection failed: " + chrome.runtime.lastError.message);
                }
            }
        );
        // console.log("chrome.tabs.executeScript content.js");

        // Send a message to the active tab
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        },
            function (tabs) {
                // console.log("chrome.tabs.query");
                // console.log("tabs.length: " + tabs.length);

                var activeTab = tabs[0];
                var index = activeTab.index;
                chrome.tabs.sendMessage(activeTab.id, {
                    "message": "clicked_browser_action",
                    "url": tab.url,
                    "index": index + 1
                });

                // console.log("sendMessage - tab url: " + tab.url);
                // console.log("end chrome.tabs.query");
            });

    });

/**
 * 
 * @param {String} url 
 * @returns {boolean} true if the given url is valid
 */
function isValidPage(url) {
    // console.log("isValidPage? url: " + url);

    return url.startsWith('https://fantasy.espn.com/baseball/team');
}

var upcomingDates;

// Open new tab
chrome.runtime.onMessage.addListener(
    function openNewTab(request, sender, sendResponse) {
        // console.log("chrome.runtime.onMessage.addListener - open_new_tab");
        if (request.message === "open_new_tab") {
            console.log("Make sure pitcher info gets to background.js:");
            let allProbableStarts = request.allProbableStarts;
            console.log(typeof (allProbableStarts));
            console.log(allProbableStarts);
            upcomingDates = createDateArray(request.allUpcomingDates);

            chrome.tabs.create({
                url: request.url,
                index: request.index
            });
            // console.log("opened new tab");

            var upcomingStarts = new StartList(allProbableStarts);
            console.log("StartList object:");
            console.log(upcomingStarts);
        }

        // console.log(request);
        // console.log(sender);

    }
);

/**
 * Objects can't be passed from a content script to a background script, so we receive 
 *      the dates as Strings and convert them back to Dates here in the background. 
 * @param {Array} dateStrings an Array containing String representations of Date objects
 * @returns an Array containing the corresponding Date object for each String in dateStrings
 */
function createDateArray(dateStrings) {

    let dateObjects = [];

    for (let i = 0; i < dateStrings.length; i++) {
        let d = new Date();
        d.setDate(d.getDate() + dateStrings[i]);
        dateObjects.push(d);
    }

    return dateObjects;
}
