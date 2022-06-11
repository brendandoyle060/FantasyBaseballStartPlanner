// espnApiRequest.js

/**
 * A request to ESPN's API
 */
class EspnApiRequest extends XMLHttpRequest {

    /**
     *
     * @param {String} leagueId the unique ID number for this league
     * @param {String} paramString String dictating the information that we request from ESPN's API
     * @param {Function} onloadFn callback function which will be triggered after the API request is complete
     */
    constructor(leagueId, paramString, onloadFn) {

        super();

        let currentYear = new Date().getFullYear();
        let baseUrl = `https://fantasy.espn.com/apis/v3/games/flb/seasons/${currentYear}/segments/0/leagues/${leagueId}`;
        this.url = baseUrl + `?` + paramString;
        this.open("GET", this.url);

        this.onload = function () {
            onloadFn(JSON.parse(this.responseText));
        };

        this.send();
    }
}