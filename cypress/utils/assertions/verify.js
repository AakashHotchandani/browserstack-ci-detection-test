import prosightEnvironment from '../selectors/prosightEnvironment'

/**
 * This abstracts the actions relating to test assertions
 * @namespace Verify
 * @example Verify.theElement('Login_Selector).contain('Login')
 */

export default class Verify {
  /**
   * We pass the element here and it returns the function we call
   * @example Verify.theElement('btn').hasClass('prosight-disabled')
   */

  static theElement = (sel, alias) => ({
    contains: (text) => cy.get(sel).should('contain.text', text),
    containsText: (text) => cy.contains(sel, text).should('have.text', text),
    hasText: (text) => cy.get(sel).should('have.text', text),
    hasValue: (text) => cy.get(sel).should('have.value', text),
    doesNotContain: (text) =>
      cy
        .get(sel)
        .as(alias || sel)
        .should('not.contain.text', text),
    hasClass: (cls) => cy.get(sel).should('have.class', cls),
    appearsNTimes: (n) =>
      cy
        .get(sel)
        .as(alias || sel)
        .should('have.length', n),
    isVisible: () => cy.get(sel).should('be.visible'),
    isDisabled: () => cy.get(sel).should('be.disabled'),
    isNotDisabled: () =>
      cy
        .get(sel)
        .as(alias || sel)
        .should('not.be.disabled'),

    isEnabled: () => cy.get(sel).should('be.enabled'),

    isInVisible: () =>
      cy
        .get(sel)
        .as(alias || sel)
        .should('not.be.visible'),
    isNotExist: () => cy.get(sel).should('not.exist'),
    exists: () => cy.get(sel).should('exist'),
    isNotChecked: () => cy.get(sel).should('not.be.checked'),
    isChecked: () => cy.get(sel).should('be.checked'),
    isAttributeDisabled: () =>
      cy
        .get(sel)
        .as(alias || sel)
        .should('have.attr', 'disabled'),
    hasAttributeValue: (attrName, attrValue) => cy.get(sel).invoke('attr', attrName).should('eq', attrValue),

    isVisibleAndContains: (text) => {
      cy.get(sel)
        .as(alias || sel)
        .should('be.visible')
        .and('contain.text', text)
    },
    isEnabledAndContains: (text) => {
      cy.get(sel)
        .as(alias || sel)
        .should('be.enabled')
        .and('contain.text', text)
    },

    isDisabledAndHaveText: (text) => {
      cy.get(sel)
        .as(alias || sel)
        .should('be.disabled')
        .and('have.text', text)
    },

    hasNotValue: (value) => {
      cy.get(sel).should('not.have.value', value)
    },

    hasFirstChild: (childElem) => {
      cy.get(childElem)
        .invoke('attr', 'class')
        .then((className) => {
          cy.get(`${sel} > :first-child`).should('have.class', className)
        })
    },

    hasChildClass: (cls) => cy.get(sel).find(cls).should('exist'),

    parentHasAttributeValue: (attr, value) => {
      cy.get(sel).parent().should('have.attr', attr, value)
    },
    hasCssProperty: (attr, value) => {
      cy.get(sel).should('have.css', attr, value)
    },
  })

  /**
   * Multiple Elements
   *  We pass the element here and it returns the function we call
   * @example Verify.theElements(sel, index).contains('text')
   */
  static theElements = (sel, num, alias) => ({
    contains: (text) =>
      cy
        .get(sel)
        .eq(num)
        .as(alias || sel)
        .should('contain.text', text),
    hasValue: (text) =>
      cy
        .get(sel)
        .eq(num)
        .as(alias || sel)
        .should('have.value', text),
    doesntContain: (text) =>
      cy
        .get(sel)
        .eq(num)
        .as(alias || sel)
        .should('not.contain.text', text),
    hasClass: (cls) =>
      cy
        .get(sel)
        .eq(num)
        .as(alias || sel)
        .should('have.class', cls),
    appearsNTimes: (n) =>
      cy
        .get(sel)
        .eq(num)
        .as(alias || sel)
        .should('have.length', n),
    isVisible: () =>
      cy
        .get(sel)
        .eq(num)
        .as(alias || sel)
        .should('be.visible'),
    isDisabled: () =>
      cy
        .get(sel)
        .eq(num)
        .as(alias || sel)
        .should('be.disabled'),
    isEnabled: () => cy.get(sel).eq(num).should('be.enabled'),
    isEnabledAndContains: (text) => {
      cy.get(sel)
        .eq(num)
        .as(alias || sel)
        .should('be.enabled')
        .and('contain.text', text)
    },
    haveAttributeDisabled: () => cy.get(sel).should('have.attr', 'disabled'),
  })

  /**
   * static method for specific validation actions against toast.
   * @example Verify.theToast.showsUpWithText('content created')
   */
  static theToast = {
    showsUpWithText: (text) => {
      cy.contains(text).should('be.visible').and('have.text', text).click({ force: true })
    },
    showsToastMessage: (text) => {
      cy.get('.Toastify__toast').should('be.visible').and('have.text', text).click({ force: true })
    },
    doesntShowUpWithText: (text) => {
      cy.get(T.containing(text)).should('not.be.visible')
    },

    isVisible: () => {
      cy.get('.Toastify__toast').should('be.visible').click({ force: true })
    },
  }

  /**
   * @example Verify.textPresent.isVisible()
   */

  static textPresent = {
    isVisible: (text) => {
      cy.contains(text).should('be.visible')
    },
    isEqual: (text) => {
      cy.contains(text).should('eq', text)
    },
  }

  /**
   * @example Verify.thisText('the text').contains('text') // assertion passes
   * @example Verify.thisText('the text').equals('text') // assertion fails
   */

  static thisText = (textToTest) => ({
    contains: (textItShouldContain) => expect(textToTest).to.contain(textItShouldContain),
    equals: (textItShouldEqual) => expect(textToTest).to.eq(textItShouldEqual),
  })

  /**
   * @example Verify.theUrl('staging.prosight').include('prosight')
   */
  static theUrl = () => ({
    includes: (text) => cy.url().should('include', text),
    equalsTo: (url) => cy.url().should('eq', url),
    notIncludes: (text) => cy.url().should('not.include', text),
  })

  /**
   * @example Verify.list(elements, arrayOfData)// Assertion passed
   */
  static list = (elements, arr) => {
    cy.get(elements).each((ele, index) => {
      expect(ele).to.contain(arr[index])
    })
  }
  /**
   *
   * @example Verify.elementContainingText(button,log in).isDisabled()
   */
  static elementContainingText = (sel, text) => ({
    parentElementIsDisabled: () => cy.get(sel).contains(text).parent().should('be.disabled'),
    parentElementIsEnabled: () => cy.get(sel).contains(text).parent().should('be.enabled'),
    isDisabled: () => cy.contains(sel, text).should('be.disabled'),

    isEnabled: () => cy.contains(sel, text).should('be.enabled'),
    hasAttributeValue: (attrName, attrValue) => cy.contains(sel, text).should('have.attr', attrName, attrValue),

    hasText: (text) => cy.contains(sel, text).should('have.text', text),
    isVisible: () => cy.contains(sel, text).should('be.visible'),
    isActive: () =>
      cy.contains(sel, text).should((btn) => {
        expect(btn).not.to.be.disabled
      }),
    isVisibleAndContains: (text) => {
      cy.contains(sel, text).should('be.visible').and('contain.text', text)
    },
  })

  /**
   * Function that makes assertions for disability, checked for element next to any label
   * @param {String} label it is the required label next to which element is situated
   */
  static theElementNextToLabel = (label) => ({
    isDisabled: () => cy.contains(label).next().should('be.disabled'),
    contains: (text) => cy.contains('label', label).next().should('contain.text', text),
    isChecked: () => cy.get(prosightEnvironment.equipmentManagement.equipmentAssignment.radioBtnContainer).contains(label).should('be.checked'), //these two assertions are mainly for rented and owned radio buttons
    isNotChecked: () =>
      cy.get(prosightEnvironment.equipmentManagement.equipmentAssignment.radioBtnContainer).contains(label).should('not.be.checked'),
  })

  /**
   * Function that makes assertion for visibility and proper loading of an canvas element
   * @param {String} sel it is the selector of required canvas element
   * @returns
   */
  static theCanvas = (sel) => ({
    isVisibleAndProperlyLoaded: () =>
      cy
        .get(sel)
        .should('be.visible')
        .should(($canvas) => {
          expect($canvas.width()).to.be.greaterThan(0)
          expect($canvas.height()).to.be.greaterThan(0)
        }),
  })

  /**
   * Function that makes assertions for dom title
   * @param {string} title required title of the dom
   * @example Verify.theTitle().equals('title')
   */
  static theTitle = () => ({
    equals: (titleText) => cy.title().should('eq', titleText),
  })

  static verifySidePanels = (sel, text) => ({
    verifyDataInSidePanel: (text2) => cy.get(sel).contains(text).next().should('have.text', text2),
  })
}
