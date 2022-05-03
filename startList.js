// startList.js

/**
 * An Array of ProbableStart objects
 */
class StartList extends Array {

    constructor(allProbableStarts) {

        super();

        for (let i = 0; i < allProbableStarts.length; i++) {
            let p = new Pitcher(allProbableStarts[i][0], allProbableStarts[i][1]);
            for (let j = 2; j < allProbableStarts[i].length; j++) {
                let a = allProbableStarts[i][j];
                let s = new Start(p, a[0], a[1]);
                this.push(s);
            }
        }
    }


    /**
     * 
     * @param {Date} givenDate any Date within the next week or two
     * @returns {Array} all starts that take place on the givenDate
     */
    allStartsOnDate(givenDate) {
        let startsOnDate = [];
        for (let probableStart in this) {
            if (probableStart.date === givenDate) {
                startsOnDate.push(this[i]);
            }
        }
        return startsOnDate;
    }
}