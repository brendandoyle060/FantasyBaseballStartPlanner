// start.js

/**
 * Information about one specific Start
 */
class Start {
    /**
     * 
     * @param {Pitcher} pitcher 
     * @param {String} opponent 
     * @param {Date} date 
     */
    constructor(pitcher, opponent, date) {
        this.pitcher = pitcher;
        this.opponent = opponent;
        this.date = date;
        this.toggledOn = true;
    }
}