import commandOptions from '../constants/commandOptions'

/**
 * @format
 * @namespace
 * @example import Type from '../interaction' Type.theText('Text').into('#Element')
 * @returns {promise} should execute cypress command cy.get(sel).clear().type(text)
 */

export default class Type {
  /**
   * @param {string} text the text you want entered into the element
   * @property {function (string)} into the function returned by 'theText';
   * Allow you to specify the element we trying to input 'text ' into
   */
  static theText = (text) => ({
    into: (selector) => cy.get(selector).clear({ force: true }).type(text, { force: true }),
  })

  /**
   * @param {string} text the text you want entered into the element using its index value
   * @property {function (string)} into the function returned by 'theText';
   * Allow you to specify the element we trying to input 'text ' into
   */
  static theTextInIndex = (text, index) => ({
    into: (selector) => cy.get(selector).eq(index).clear({ force: true }).type(text, { force: true }),
  })

  /**
   * @param {string} text the text you want entered into the element
   * @property {function (string)} into the function returned by 'theTextAndEnter';
   * Allow you to specify the element we trying to input 'text ' into and then press 'Enter'
   */
  static theTextAndEnter = (text) => ({
    into: (selector) => cy.get(selector).clear({ force: true }).type(text, { force: true }).type(commandOptions.enter, { force: true }),
  })
}
