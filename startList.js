// startList.js

/**
 * An Array of Start objects
 */
class StartList extends Array {

    /**
     * 
     * @param {Array} allProbableStarts an array containing the information to create 
     *      Start objects, sent from a content script
     * @param {Number} firstDayOfWeek a number from 0-6 representing a day of the week
     *      0 represents Sunday, and most fantasy baseball leagues have their week start 
     *      on Monday, so the default value is 1.
     */
    constructor(allProbableStarts, firstDayOfWeek = 1) {

        super();

        this.firstDayOfWeek = firstDayOfWeek;

        for (let i = 0; i < allProbableStarts.length; i++) {
            let p = new Pitcher(allProbableStarts[i][0], allProbableStarts[i][1]);
            for (let j = 2; j < allProbableStarts[i].length; j++) {
                let a = allProbableStarts[i][j];
                let d = new Date();
                d.setDate(d.getDate() + a[1]);
                let s = new Start(p, a[0], d);
                this.push(s);
            }
        }

        this.sort(function compare(a, b) {
            if (a.date < b.date) {
                return -1;
            }
            if (a.date > b.date) {
                return 1;
            }
            // a must be equal to b
            return 0;
        });
    }

    /**
     *
     * @param {Array} listOfDates a list of all upcoming dates listed in the Schedule
     * @returns {Date} a Date object for the first day of the next week
     */
    getFirstDateOfNextWeek(listOfDates) {
        // Traverse the list backward because if today is the first day of the week,
        // then we want to make sure we find the first day of NEXT week
        for (let i = listOfDates.length - 1; i >= 0; i--) {
            if (listOfDates[i].getDay() === this.firstDayOfWeek) {
                return listOfDates[i];
            }
        }
        console.error("List of dates does not contain the first day of the fantasy baseball week");
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