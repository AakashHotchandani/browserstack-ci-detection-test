import globalSels from '../../utils/selectors/globalSels.js'
import commandOptions from '../../utils/constants/commandOptions'
import constants from '../../utils/constants/prosightAssets/accountSettings.js'
import HelperFunction from '../../utils/helpers/crossModuleFunctions.js'
import options from '../../utils/constants/commandOptions.js'
const apiBaseURL = Cypress.env('API_BaseUrl')
import LoginPage from '../../pageObjects/signIn/siginPage.js'
import loginData from '../../fixtures/SignIn/user.json'
import Verify from '../../utils/assertions/verify.js'
import Click from '../../utils/Interactions/click.js'
import APIEndpoints from '../../../APIEndpoints.js'
const project_Id = Cypress.env('ProjectId')
const { divTag } = globalSels
const { settingsPopupItem, logoutButton, logoutConfirmationBox, phoneNumberInput } = globalSels.accountSettings
const { account } = constants.buttonsInnerText
const { confirmationText } = constants.logoutConfirmationMessages

export default class AccountSettings {
  /* Redirects to the account settings page from the top navbar
       @param {string} displayName - The name of the user.
    */
  static openSettingsPopup(displayName) {
    Click.onContainText(globalSels.button, displayName)
    Click.onContainText(settingsPopupItem, account)
  }

  /* Redirects to the alert subscriptions submodule from the side navbar*/
  static goToAlertSubscriptions() {
    HelperFunction.navigateToModule(globalSels.button, constants.accountSettingsOptions.alertSubscriptions)
  }

  /* Redirects to the notifications submodule from the side navbar*/
  static goToNotifications() {
    HelperFunction.navigateToModule(globalSels.button, constants.accountSettingsOptions.notifications)
  }

  /**
   * This method is used to update the profile details in the profile page.
   * @param {object} accountSettings - The account settings object.
   * @param {string} accountSettings.name - The new name of the user.
   * @param {string} accountSettings.phoneNumber - The new phone number of the user.
   * @param {string} accountSettings.timeZone - The new timezone of the user.
   */
  static updateProfileDetails(accountSettings) {
    cy.get(globalSels.accountSettings.nameInput).clear().type(accountSettings.name, commandOptions.force)
    cy.get(globalSels.accountSettings.phoneNumberInput).clear().type(accountSettings.phoneNumber, commandOptions.force)
    cy.get(globalSels.accountSettings.timeZoneDropdown).click(commandOptions.force)
    cy.get(globalSels.accountSettings.timeZoneDropdownList).contains(accountSettings.timeZone).click(commandOptions.force)
  }

  /*
        This method updates the account password from the Password popup
        @param {string} oldPassword - The old password of the user.
        @param {string} newPassword - The new password of the user.
    */
  static updatePasswordForm(oldPassword, newPassword) {
    cy.get(globalSels.accountSettings.currentPasswordInput).clear().type(oldPassword, commandOptions.force)
    cy.get(globalSels.accountSettings.newPasswordInput).clear().type(newPassword, commandOptions.force)
    cy.get(globalSels.accountSettings.newPasswordConfirmInput).clear().type(newPassword, commandOptions.force)
  }

  /*
        This method logout triggers the logout confirmation popup
    */
  static logout() {
    Click.on(logoutButton)
  }

  /* This method confirms logging out from the application in the confirmation popup*/
  static confirmLogout() {
    Verify.textPresent.isVisible(confirmationText)
    cy.get(logoutConfirmationBox).find(logoutButton).as('logoutButton')
    Verify.theElement('@logoutButton').isEnabled()
    Click.on('@logoutButton')
  }

  /**
   *  @param {string} section - The section of the alert subscription to be unchecked.
   * @param {string} label - The label of the alert subscription to be unchecked.
   *
   */

  static checkBySection(label, option = true, index = 0) {
    cy.get(globalSels.accountSettings.checkboxLabel)
      .get(globalSels.accountSettings.checkboxLabel)
      .contains(label)
      .scrollIntoView(commandOptions.force)
      .parent()
      .children(globalSels.accountSettings.checkbox)
      .invoke('attr', 'data-value') // Get the current state of the checkbox
      .then((isChecked) => {
        if (isChecked != `${option}`) {
          cy.get(globalSels.accountSettings.notificationSections)
            .get(globalSels.accountSettings.checkboxLabel)
            .contains(label)
            .scrollIntoView(commandOptions.force)
            .parent()
            .children(globalSels.accountSettings.checkbox)
            .eq(index)
            .click(commandOptions.force)
        }
      })
  }

  /*
        This method is used to switch the notification type by label
        @param {string} label - The label of the notification type to be switched.
        @param {boolean} option - The value of the checkbox.
    */
  static switchNotificationTypeByLabel(label, option = true) {
    cy.get(globalSels.accountSettings.notificationTypeCheckboxLabel)
      .contains(label)
      .parent()
      .parent()
      .find(globalSels.accountSettings.checkbox)
      .invoke('attr', 'data-value') // Get the current state of the checkbox
      .then((isChecked) => {
        if (isChecked != `${option}`) {
          cy.get(globalSels.accountSettings.notificationTypeCheckboxLabel)
            .contains(label)
            .parent()
            .parent()
            .find(globalSels.accountSettings.checkbox)
            .click(commandOptions.force)
        }
      })
  }

  /*
        This method the day of a the week to receive notifications
        @param {string} day - The day of the week to receive notifications.
    */
  static setNotificationDay(day) {
    cy.get(globalSels.accountSettings.toggleButton).contains(day).click(commandOptions.force)
  }

  /*
        This method opens the notification start hour dropdown
    */
  static openNotificationStartHourDropdown() {
    cy.get(globalSels.accountSettings.startHourInput).next().find(globalSels.accountSettings.hoursDropdownButton).click(commandOptions.force)
  }

  /*
        This method opens the notification end hour dropdown
    */
  static openNotificationEndHourDropdown() {
    cy.get(globalSels.accountSettings.endHourInput).next().find(globalSels.accountSettings.hoursDropdownButton).click(commandOptions.force)
  }

  /*
        This method sets the notification start hour
        @param {string} hour - The hour to be set.
    */
  static setNotificationStartHour(hour) {
    cy.get(globalSels.accountSettings.startHourInput)
      .parent()
      .next()
      .get(globalSels.accountSettings.hoursDropdownOptions)
      .contains(hour)
      .click(commandOptions.force)
  }

  /*
        This method sets the notification end hour
        @param {string} hour - The hour to be set.
    */
  static setNotificationEndHour(hour) {
    cy.get(globalSels.accountSettings.endHourInput)
      .parent()
      .next()
      .find(globalSels.accountSettings.hoursDropdownOptions)
      .contains(hour)
      .click(commandOptions.force)
  }

  /*
        Assertions for the account settings page
    */
  static verify = () => {
    return {
      /*
             This method asserts if the notification start hour dropdown is visible
            */
      startHourDropdownIsVisible: () => {
        cy.get(globalSels.accountSettings.startHourInput).parent().next().get(globalSels.accountSettings.hoursDropdownOptions).should('be.visible')
      },
      /*
                This method asserts if the notification end hour dropdown is visible
            */
      endHourDropdownIsVisible: () => {
        cy.get(globalSels.accountSettings.endHourInput).parent().next().get(globalSels.accountSettings.hoursDropdownOptions).should('be.visible')
      },
      /*
                This method asserts if notification type is checked by label
                @param {string} label
            */
      checkboxIsChecked: (label) => {
        cy.get(globalSels.accountSettings.notificationTypeCheckboxLabel).contains(label).parent().parent().find(globalSels.accountSettings.checkbox)
      },
    }
  }

  /**
   * This function is sued to login to application
   * @param {String} userName - Name used to login to application
   * @param {String} password - Password used to login
   * @returns
   */
  static loginToApplicationInaccountSettings = (userName, password) => {
    cy.log(userName, password)
    const loginEndPoint = APIEndpoints.loginEndpoint
    return new Cypress.Promise((resolve, reject) => {
      cy.api({
        method: options.requestMethod.post,
        failOnStatusCode: false,
        url: apiBaseURL + loginEndPoint,
        body: {
          username: userName,
          password: password,
          projectId: project_Id,
        },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status, 'Verifying response code').equal(200)
          expect(res.body, 'Verifying response should have property idToken').to.have.property('idToken')
          expect(res.body.profile, 'Verifying response should have property id').to.have.property('id')
          const authData = {
            userId: res.body.profile.id,
            authToken: 'Bearer ' + res.body.idToken,
          }
          resolve(authData)
        } else {
          cy.log('unable to login')
        }
      })
    })
  }

  /**
   * This method updates the account settings of a user.
   * It logs into the application, retrieves the user ID and authentication token,
   * and performs the update operation. After the update, it verifies the response
   *
   *  @param {Object} [accountSettings=loginData] - The account settings data. Defaults to loginData.
   * @param {string} accountSettings.userName - The username of the account.
   * @param {string} accountSettings.password - The current password of the account.
   *
   */
  static updateAccountSetting = (accountSettings) => {
    const { userName, password, email, phoneNumber, name, timeZone } = accountSettings
    cy.log(userName, password)
    this.loginToApplicationInaccountSettings(userName, password).then(({ userId, authToken }) => {
      cy.api({
        method: options.requestMethod.patch,
        url: apiBaseURL + 'user/' + userId,
        headers: { Authorization: authToken },
        failOnStatusCode: false,
        body: [
          {
            op: 'replace',
            path: 'phone',
            value: phoneNumber,
          },
          {
            op: 'replace',
            path: 'email',
            value: email,
          },
          {
            op: 'replace',
            path: 'name',
            value: name,
          },
          {
            op: 'replace',
            path: 'metadata',
            value: {
              department: {
                id: '5uIVzMb5RKattizbMrzSw1',
                name: '10 West East South Therapy',
              },
              desktop:
                'dguM7nSBoXBgm3BMOSTMRv:APA91bGnYr9jcFolLs0dcnoUfTQpRlR7fxaG-15kjngcp5Dcv5EvzwCd3JvCHg48iBtgDJK8OyobpervSBZ9YdX6yalubqepaH4BGczcE1DaSm7C2czyG8JZz4lUigypfUKuLnpzEg5w',
              devicePushIds: [
                'dguM7nSBoXBgm3BMOSTMRv:APA91bGnYr9jcFolLs0dcnoUfTQpRlR7fxaG-15kjngcp5Dcv5EvzwCd3JvCHg48iBtgDJK8OyobpervSBZ9YdX6yalubqepaH4BGczcE1DaSm7C2czyG8JZz4lUigypfUKuLnpzEg5w',
              ],
              lastModified: 1680095425853,
              notifications: {
                assets: {
                  departments: ['5uIVzMb5RKattizbMrzSw1'],
                  email: false,
                  hours: 'all',
                  push: false,
                  text: false,
                  weekdays: 'all',
                },
                core: {
                  departments: ['5uIVzMb5RKattizbMrzSw1'],
                  email: false,
                  hours: 'all',
                  push: false,
                  text: false,
                  weekdays: 'all',
                },
                environment: {
                  departments: ['5uIVzMb5RKattizbMrzSw1'],
                  email: false,
                  hours: 'all',
                  push: false,
                  text: false,
                  weekdays: 'all',
                },
                safety: {
                  departments: ['5uIVzMb5RKattizbMrzSw1'],
                  email: false,
                  hours: 'all',
                  push: false,
                  text: false,
                  weekdays: 'all',
                },
                timeZone: timeZone,
              },
              temperatureSetting: 'degc',
            },
          },
        ],
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status).equal(200)
          expect(res.body.name).to.eq(name)
          expect(res.body.phone).to.eq(phoneNumber)
          expect(res.body.metadata.notifications.timeZone).to.eq(timeZone)
          // Assertions for assets
          expect(res.body.metadata.notifications.assets.email).to.eq(false)
          expect(res.body.metadata.notifications.assets.text).to.eq(false)
          expect(res.body.metadata.notifications.assets.push).to.eq(false)

          // Assertions for core
          expect(res.body.metadata.notifications.core.email).to.eq(false)
          expect(res.body.metadata.notifications.core.text).to.eq(false)
          expect(res.body.metadata.notifications.core.push).to.eq(false)

          // Assertions for environment
          expect(res.body.metadata.notifications.environment.email).to.eq(false)
          expect(res.body.metadata.notifications.environment.text).to.eq(false)
          expect(res.body.metadata.notifications.environment.push).to.eq(false)

          // Assertions for safety
          expect(res.body.metadata.notifications.safety.email).to.eq(false)
          expect(res.body.metadata.notifications.safety.text).to.eq(false)
          expect(res.body.metadata.notifications.safety.push).to.eq(false)
        } else {
          cy.log('unable to update account settings')
        }
      })
    })
  }

  /**
   * This method updates the password of a user.
   * It logs into the application, retrieves the user ID and authentication token,
   * and performs the password update operation. After the update, it verifies the response
   *
   * @param {Object} accountSettings - The account settings data.
   * @param {string} accountSettings.userName - The username of the account.
   * @param {string} accountSettings.password - The current password of the account.
   *
   */
  static updatePassword = (accountSettings, newPassword) => {
    const { userName, password } = accountSettings
    cy.log(userName, password)
    this.loginToApplicationInaccountSettings(userName, password).then(({ userId, authToken }) => {
      cy.api({
        method: options.requestMethod.post,
        url: apiBaseURL + 'user/' + userId + '/changePassword',
        headers: { Authorization: authToken },
        failOnStatusCode: false,
        body: {
          oldPassword: password,
          newPassword: newPassword,
        },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status).equal(200)
        } else {
          cy.log('unable to update account settings ')
        }
      })
    })
  }

  /* Redirects to the temperature settings submodule from the side navbar*/
  static goToTemperatureSettings() {
    HelperFunction.navigateToModule(globalSels.button, constants.accountSettingsOptions.tempSettings)
  }

  /**
   * This function checks if the toggle button is on or off.
   * It targets a label based on its text, finds the sibling div, and asserts whether the div's 'data-value' attribute matches the expected value.
   *
   * @param {string} labelTextSelector - The text content of the label to be targeted.
   * @param {string} expectedValue - The expected value of the 'data-value' attribute to verify if the toggle button is on or off.
   */
  static checkToggleButton = (labelTextSelector, expectedValue) => {
    cy.get(labelTextSelector).closest(divTag).find(divTag).as('ToggleButton')

    cy.get('@ToggleButton').should('have.attr', 'data-value', expectedValue)
  }

  /**
   * This function clicks on a day element based on its text content.
   *
   * @param {string} dayName - The name of the day to be clicked.
   */
  static clickOnDay = (dayName) => {
    cy.get(`span:contains("${dayName}")`).parent().as('day')
    Verify.theElement('@day').isEnabled()
    cy.get('@day').click()
  }

  /**
   * This function switches a toggle button on or off based on the specified value.
   *
   * @param {string} labelTextSelector - The CSS selector for the label text of the toggle button to be checked.
   * @param {boolean|string} desiredValue - The desired value of the 'data-value' attribute to set the toggle button to on or off.
   */
  static setToggleButton = (labelTextSelector, desiredValue) => {
    const desiredStringValue = desiredValue.toString()

    cy.get(labelTextSelector).closest('div').find('div').first().as('ToggleButton')

    cy.get('@ToggleButton').then(($toggleButton) => {
      const actualValue = $toggleButton.attr('data-value')
      if (actualValue !== desiredStringValue) {
        cy.get('@ToggleButton').click()
      }
    })

    // Verify the toggle button state
    cy.get('@ToggleButton').should('have.attr', 'data-value', desiredStringValue)
  }

  /**
   * This method updates the alert Subscription of a user.
   * It logs into the application, retrieves the user ID and authentication token,
   * and performs the update operation. After the update, it verifies the response
   *
   */
  static updateAlertSubscription = (loginData) => {
    const { userName, password } = loginData
    this.loginToApplicationInaccountSettings(userName, password).then(({ userId, authToken }) => {
      cy.api({
        method: options.requestMethod.patch,
        url: apiBaseURL + 'user/' + userId,
        headers: { Authorization: authToken },
        failOnStatusCode: false,
        body: [
          {
            op: 'replace',
            path: 'metadata',
            value: {
              department: {
                id: '5uIVzMb5RKattizbMrzSw1',
                name: '',
              },
              desktop:
                'dguM7nSBoXBgm3BMOSTMRv:APA91bGnYr9jcFolLs0dcnoUfTQpRlR7fxaG-15kjngcp5Dcv5EvzwCd3JvCHg48iBtgDJK8OyobpervSBZ9YdX6yalubqepaH4BGczcE1DaSm7C2czyG8JZz4lUigypfUKuLnpzEg5w',
              devicePushIds: [
                'dguM7nSBoXBgm3BMOSTMRv:APA91bGnYr9jcFolLs0dcnoUfTQpRlR7fxaG-15kjngcp5Dcv5EvzwCd3JvCHg48iBtgDJK8OyobpervSBZ9YdX6yalubqepaH4BGczcE1DaSm7C2czyG8JZz4lUigypfUKuLnpzEg5w',
              ],
              lastModified: 1680095425853,
              notifications: {
                assets: {
                  alertTypes: ['Maintenance Due'],
                  assetTypes: ['AssetType-SMARTHOSP-8081', 'APITypes', 'AssetType-SMARTHOSP-800081', 'Asset Type-1', 'AssetType-SMARTHOSP-Mod'],
                  departments: ['2dtq9JnmDqOt0pLy1Yalbh', '5JGRRn41kLVPUGtEhEZxuk', '1eiRSVgNXnalYK3lcldyEN'],
                  email: false,
                  hours: 'all',
                  push: false,
                  text: false,
                  weekdays: 'all',
                },
                compliance: {
                  alertTypes: ['Clogged Refill', 'Dispenser Low Battery'],
                  departments: ['52nvyeE7dKbV2rRPPpDa8G', '5Le7UOAm7ZoJY3EaHBGZy3', '1PdcBtdcjQnt8KPb6QiLNP'],
                },
                core: {
                  departments: ['5uIVzMb5RKattizbMrzSw1'],
                  email: false,
                  hours: 'all',
                  push: false,
                  text: false,
                  weekdays: 'all',
                },
                environment: {
                  departments: ['0npuB9trCSqWhiZJ7zUj4I', '1eiRSVgNXnalYK3lcldyEN'],
                  email: false,
                  hours: 'all',
                  push: false,
                  text: false,
                  weekdays: 'all',
                  alertTypes: ['Calibration Due in 5 days'],
                  equipmentTypes: ['Contrast Warmer1', 'Cryostat'],
                },
                safety: {
                  departments: ['5uIVzMb5RKattizbMrzSw1'],
                  email: false,
                  hours: 'all',
                  push: false,
                  text: false,
                  weekdays: 'all',
                },
                timeZone: 'Eastern Standard Time',
              },
              temperatureSetting: 'degc',
            },
          },
        ],
      }).then((res) => {
        expect(res.status).equal(200)
      })
    })
  }

  /**
   * Verify the phone number input value against an expected value, ignoring special characters.
   *
   * Retrieves the current value of the phone number input field specified by `phoneNumberInput`,
   * removes special characters using `HelperFunction.removeSpecialCharacters`, and asserts
   * that the processed value matches the provided expected value using Cypress assertions.
   *
   * @param {string} expectedValue - The expected phone number value to match after removing special characters.
   *
   */
  static verifyPhoneNumber = (expectedValue) => {
    cy.get(phoneNumberInput)
      .invoke('val') // Get the current value of the input field
      .then((value) => {
        const processedValue = HelperFunction.removeSpecialCharacters(value) // Remove special characters
        expect(processedValue).to.equal(expectedValue) // Assert that processed value matches expected value
      })
  }

  /**
   * Selects all available options for environment alert subscriptions (IEM)
   * for a given user by updating the user's metadata via API.
   *
   * This includes setting all alert types, departments, equipment types,
   * hours, and weekdays to 'all', and enabling email, push, and text notifications.
   *
   * @param {Object} loginData - The user's login credentials.
   * @param {string} loginData.username - The username of the user.
   * @param {string} loginData.password - The password of the user.
   */
  static selectAlltheOptionsInAlertSubs_IEM = (loginData) => {
    const { username, password } = loginData
    this.loginToApplicationInaccountSettings(username, password).then(({ userId, authToken }) => {
      cy.api({
        method: options.requestMethod.patch,
        url: apiBaseURL + 'user/' + userId,
        headers: { Authorization: authToken },
        failOnStatusCode: false,
        body: [
          {
            op: 'replace',
            path: 'metadata',
            value: {
              notifications: {
                environment: {
                  alertTypes: 'all',
                  departments: 'all',
                  email: true,
                  equipmentTypes: 'all',
                  hours: 'all',
                  push: true,
                  text: true,
                  weekdays: 'all',
                },
              },
            },
          },
        ],
      }).then((res) => {
        expect(res.status).equal(200)
      })
    })
  }

  /**
 * Updates the user's temperature setting (Celsius or Fahrenheit) 
 *
 * @function updateTemperatureSetting
 * @param {Object} loginData - User login information.
 * @param {string} loginData.username - Username for authentication.
 * @param {string} loginData.password - Password for authentication.
 * @param {"celsius" | "fahrenheit"} temperatureUnit - The temperature unit to update.
 *        Accepted values: "celsius" → "degC", "fahrenheit" → "degF".
 */
  static updateTemperatureSetting = (loginData, temperatureUnit) => {
    const { username, password } = loginData
    const unitMap = {
      celsius: "degC",
      fahrenheit: "degF"
    }
    this.loginToApplicationInaccountSettings(username, password).then(({ userId, authToken }) => {
      cy.api({
        method: options.requestMethod.patch,
        url: apiBaseURL + 'user/' + userId,
        headers: { Authorization: authToken },
        failOnStatusCode: false,
        body: [
          {
            op: 'replace',
            path: 'metadata',
            value: {
              "temperatureSetting": unitMap[temperatureUnit]
            },
          },
        ],
      }).then((res) => {
        expect(res.status).equal(200)
        expect(res.body.metadata.temperatureSetting).equal(unitMap[temperatureUnit])
      })
    })

  }
}
