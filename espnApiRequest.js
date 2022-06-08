// espnApiRequest.js

/**
 * A request to ESPN's API
 */
class EspnApiRequest extends XMLHttpRequest {

    /**
     *
     * @param {String} leagueId the unique ID number for this league
     * @param {String} paramString String dictating the information that we get from ESPN's API
     * @param {Function} callback
     */
    constructor(leagueId, paramString, callback) {

        super();

        let currentYear = new Date().getFullYear();
        let baseUrl = `https://fantasy.espn.com/apis/v3/games/flb/seasons/${currentYear}/segments/0/leagues/${leagueId}`;
        this.url = baseUrl + `?` + paramString;
        // console.log("EspnApiRequest url: " + this.url);
        this.open("GET", this.url);

    }

}