// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-plugin-api'
import 'cypress-mochawesome-reporter/register'
import registerCypressGrep from '@cypress/grep'
import HelperFunction from '../utils/helpers/crossModuleFunctions'
import { addCustomCommand } from 'cy-verify-downloads'
import LoginPage from '../pageObjects/signIn/siginPage'
addCustomCommand()
registerCypressGrep()
import 'cypress-mailosaur'

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

before('reset report value', () => {
  LoginPage.loginToApplication().then(({ authToken }) => {
    cy.task('setAuthToken', authToken)
  })
})

afterEach('Reset cookies', () => {
  cy.clearAllCookies()
  cy.clearAllLocalStorage()
})

require('browserstack-cypress-cli/bin/testObservability/cypress');
