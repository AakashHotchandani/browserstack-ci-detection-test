/**
 * THis abstracts clicking on Element
 * @format
 * @namespace
 * @example import {Click} from '../interactions' Click.on('#idOfTheElement')
 */

export default class Click {
  /**
   * This triggers a normal click event on an element , uses
   * <a href="/guides/overview/why-cypress" > Guides</a>
   * @param {string} selector the selector for the element to click on
   */
  static on = (selector) => cy.get(selector).click()

  /**
   * This triggers a click on element based on selector that contains specific text
   * @param {string}
   * @param {*} text -  text of the element to perform click
   * @returns
   */
  static onContainText = (selector, text) => {
    const textRegex = new RegExp(`^${text}$`)
    if (text === 'Processing Time Report (At Asset Type Level)' || text === 'Processing Time Report (At Asset Level)') {
      console.log(text, 'spec')
      cy.get(selector).contains(text).click({ force: true })
    } else {
      console.log(text, 'something')
      cy.get(selector).contains(textRegex).click({ force: true })
    }
  }

  /**
   * This will click on the first element that matches the selector you pass in
   * <a href="/guides/overview/why-cypress" > Guides</a>
   * @param {string} selector the selector for the element to click on
   */
  static onFirst = (selector) => cy.get(selector).first().click({ force: true })

  /**
   * This clicks on an element with the force param set as true in the case
   * you want to click element which is hidden
   * @param {string} selector the selector for the element to click on
   */
  static forcefullyOn = (selector) => cy.get(selector).click({ force: true })

  /**
   * This triggers a serially click event on an multiple elements.
   * <a href="/guides/overview/why-cypress" > Guides</a>
   * @param {string} selector the selector for the element to click on
   */
  static onMultiple = (selector, alias) =>
    cy
      .get(selector)
      .as(alias || selector)
      .click({ multiple: true })

  /**
   * This will click on the last element that matches the selector you pass in
   * <a href="/guides/overview/why-cypress" > Guides</a>
   * @param {string} selector the selector for the element to click on
   */
  static onLast = (selector) => cy.get(selector).last().click({ force: true })

  /**
   * This will click on the element according to the index no that matches the selector you pass in
   * <a href="/guides/overview/why-cypress" > Guides</a>
   * @param {string} selector the selector for the element to click on
   */
  static onIndexNo = (selector, index) => cy.get(selector).eq(index).click({ force: true })
  /**
   *This will click on the Cancel button that exist in the current view
   */
  static onCancelButton = () => cy.contains('button', 'Cancel').click({ force: true })
  /**
   *This will click on the Delete button that exist in the current view
   */
  static onDeleteButton = () => cy.contains('button', 'Delete').click({ force: true })
  /**
   *This will click on the Continue button that exist in the current view
   */
  static onContinueButton = () => cy.contains('button', 'Continue').click({ force: true })

  /**
   *This will click on the Done button that exist in the current view
   */
  static onDoneButton = () => cy.contains('button', 'Done').click({ force: true })
  /**
   *This will click on the button given the selector of that button and the container of it
   */
  static onButton = (sel, buttonSel = 'button') => cy.get(sel).find(buttonSel).click({ force: true })

  /**
   *This will click on the button given the inner text of that button and the container of it
   */
  static onButtonByInnerText = (sel, text) => cy.get(sel).contains('button', text).click({ force: true })

  /**
   *This will click on the button where the button is inside some parent container
   */
  static onButtonByFindingInnerText = (parentSel, sel, text) => cy.get(parentSel).find(sel).contains(text).click({ force: true })
}
