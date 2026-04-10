/**
 * @format
 * @namespace
 * @example import Check from '../interaction' Check.into(selector)
 * @returns {promise} should execute cypress command cy.get(sel).select()
 */

export default class Check {
  /** This will check a checkbox that matches the selector you pass.
   * @param {string} selector  it is the selector of checkbox you want to check.
   *
   */
  static theCheckBox = (selector) => cy.get(selector).check()

  /** This will forcefully check a checkbox that matches the selector you pass.
   * @param {string} selector  it is the selector of checkbox you want to check.
   *
   */
  static forceFullyOnTheCheckBox = (selector) => cy.get(selector).check({ force: true })

  /** This will check the first checkbox that matches the selector you pass.
   * @param {string} selector  it is the selector of checkbox you want to check.
   *
   */
  static theFirstCheckBox = (selector) => cy.get(selector).first().check()

  /** This will forcefully check the first checkbox that matches the selector you pass.
   * @param {string} selector  it is the selector of checkbox you want to check.
   *
   */
  static forceFullyOnTheFirstCheckBox = (selector) => cy.get(selector).first().check({ force: true })
}
