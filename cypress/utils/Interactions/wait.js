/**
 * THis abstracts Waiting for aliases
 * @format
 * @class AliasWaits
 */



export default class AliasWait {

    /**
    * Function that waits for given alias.
    * @param {String} alias it is  the required alias name that for we will wait
    */
    static wait = (alias) => {
        cy.
            wait(`@${alias}`, { requestTimeout: 15000 })
    }

}