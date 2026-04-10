/**
 * THis abstracts intercepting APIs
 * @class Intercept
 *
 */

export default class Intercept {
  /**
   * Function that will intercept for given URL request method
   * @param {String} method it is the method which you want to intercept for any url
   * @param {string} url it is the required url you want to intercept
   * @param {string} alias it is the alias name
   */
  static theApi = (method, url, alias) => {
    cy.intercept(method, url).as(alias)
  }
}
