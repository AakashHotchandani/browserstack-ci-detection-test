/// <reference types="cypress" />
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import { Verify } from '../../../../utils/assertions'
import accountSettingsConstant from '../../../../utils/constants/prosightAssets/accountSettings'
import prosightAssetsSel from '../../../../utils/selectors/prosightAssets'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import Click from '../../../../utils/Interactions/click'
import globalSels from '../../../../utils/selectors/globalSels'
import AccountSettings from '../../../../pageObjects/prosightAssets/accountSettings'
import userData from '../../../../fixtures/SignIn/mailasaourCredentials.json'
import prosightCoreSel from '../../../../utils/selectors/prosightCore'
import accountSettingData from '../../../../fixtures/prosightAssets/accountSettings.json'

const { changePassword, save, cancel, accountSettings, profile, notification, temperatureSettings, downloadUserManual } =
  accountSettingsConstant.buttonsInnerText

const { notificationUpdatedSuccessfully, afterSuccessfulPasswordChange, afterSuccessfulAccountSettingsSave, temperatureSettingsUpdatedSuccessfully } =
  accountSettingsConstant.toastMessages

const { navbar } = prosightAssetsSel.assetsManagement

const {
  fahrenheit,
  celsius,
  nameInput,
  phoneNumberInput,
  timeZoneDropdown,
  emailInput,
  departmentInput,
  accountSettingPageContainer,
  changePasswordDialogBox,
} = globalSels.accountSettings

const { userName, password, name } = userData
const { assets, core, environment, safety, compliance } = accountSettingsConstant.application

const { assetDownloadText, coreDownloadText, environmentDownloadText, safetyDownloadText, complianceDownloadText } =
  accountSettingsConstant.downloadText

const { saveButton } = prosightCoreSel.buildingManagementPageSel

const { receiveEmailAlerts, receiveTextAlerts, receivePushNotifications } = accountSettingsConstant.notificationsLabels

const applications = [assets, environment, safety, core, compliance]

const downloadTexts = {
  assets: assetDownloadText,
  safety: safetyDownloadText,
  core: coreDownloadText,
  environment: environmentDownloadText,
  compliance: complianceDownloadText,
}

const { saveBtn, cancelButton } = globalSels

before('update account settings', () => {
  AccountSettings.updatePassword(userData, accountSettingData.newPassword)
  AccountSettings.updatePassword(accountSettingData, userData.newPassword)
  AccountSettings.updateAccountSetting(userData)
})

applications.forEach((app) => {
  describe('Execute account settings page for all application in mobile view', { viewportHeight: 667, viewportWidth: 400 }, () => {
    beforeEach('Login and navigate to Account Settings-' + app, () => {
      HelperFunction.globalIntercept()

      cy.session([userName, password], () => {
        LoginPage.toVisit('/' + app)
        LoginPage.doUserLogin(userName, password)
        Verify.theUrl().includes('/' + app)
        Click.on(navbar)
        Verify.textPresent.isVisible(userData.name)
        Click.onContainText(globalSels.buttonTag, accountSettings)
      })

      LoginPage.toVisit('/' + app)
      Click.on(navbar)
      Click.onContainText(globalSels.buttonTag, accountSettings)
    })

    context('Execute functions on the Account Settings page in mobile view -' + app, () => {
      after('return to the previous state-' + app, function () {
        const newAccountSettings = userData
        AccountSettings.updatePassword(newAccountSettings, userData.newPassword)
        AccountSettings.updateAccountSetting(newAccountSettings)
      })

      it('should update the profile page -' + app, () => {
        Click.onContainText(globalSels.buttonTag, profile)
        const currentAccountSettings = userData
        const newAccountSettings = accountSettingData
        // Verify save and cancel buttons are disabled
        Verify.elementContainingText(saveButton, save).isDisabled()
        Verify.elementContainingText(globalSels.button, cancel).isDisabled()
        // Verify change password button is enabled
        Verify.elementContainingText(globalSels.button, changePassword).isEnabled()
        //Verify Download User Manual Button is enabled
        Verify.elementContainingText(globalSels.button, downloadUserManual).isEnabled()
        // Verify email and department input fields are disabled
        Verify.theElement(emailInput).isDisabled()
        Verify.theElement(departmentInput).isDisabled()
        // Verify name input field contains the correct name
        Verify.theElement(nameInput).isVisible()
        Verify.theElement(nameInput).hasValue(currentAccountSettings.name)
        // Verify email input field contains the correct email
        Verify.theElement(emailInput).isVisible()
        Verify.theElement(emailInput).hasValue(currentAccountSettings.email)
        // Verify phone input field contains the correct phone number
        Verify.theElement(phoneNumberInput).isVisible()
        Verify.theElement(phoneNumberInput).hasValue(currentAccountSettings.phoneNumber)
        // Verify time zone dropdown contains the correct value
        Verify.theElement(timeZoneDropdown).isVisible()
        Verify.theElement(timeZoneDropdown).hasValue(currentAccountSettings.timeZone)
        // Update the profile information
        AccountSettings.updateProfileDetails(newAccountSettings)
        // Verify save button is enabled after updating the form
        Verify.elementContainingText(saveButton, save).isEnabled()
        // Click on the save button
        Click.onContainText(saveButton, save)
        // Verify toast message appears after successfully updating the profile
        Verify.theToast.showsUpWithText(afterSuccessfulAccountSettingsSave)
        // Verify the updated name.
        Verify.theElement(nameInput).hasValue(newAccountSettings.name)
        //Verify phone number
        AccountSettings.verifyPhoneNumber(newAccountSettings.phoneNumber)
        //Verify the time Zone
        Verify.theElement(timeZoneDropdown).hasValue(newAccountSettings.timeZone)
        //Changing password
        Click.onContainText(globalSels.button, changePassword)
        // verifying Save button should be disabled
        HelperFunction.getElementFromSpecificDiv(changePasswordDialogBox, saveBtn).as('saveButton')
        Verify.theElement('@saveButton').isDisabled()
        //verify cancel button should be enabled
        HelperFunction.getElementFromSpecificDiv(changePasswordDialogBox, cancelButton).as('cancelButton')
        Verify.theElement('@cancelButton').isEnabled()
        //Updating the password
        AccountSettings.updatePasswordForm(currentAccountSettings.password, newAccountSettings.password)
        Click.on('@saveButton')
        //verifying the toast message
        Verify.theToast.showsToastMessage(afterSuccessfulPasswordChange)
        AccountSettings.updatePassword(accountSettingData, userData.newPassword)
        // Download User Manual
        Click.onContainText(globalSels.button, downloadUserManual)
        const expectedDownloadText = downloadTexts[app]
        cy.verifyDownload(expectedDownloadText)
        //Verify the changed profile name
        cy.reload()
        Click.forcefullyOn(globalSels.hamburgerBtn)
        Click.onButtonByInnerText(accountSettingPageContainer, accountSettings)
        Verify.textPresent.isVisible(newAccountSettings.name)
      })
    })

    context('Should execute Notification Page- ' + app, { viewportHeight: 667, viewportWidth: 400 }, () => {
      after('return to the previous state-' + app, function () {
        const newAccountSettings = userData
        AccountSettings.updatePassword(newAccountSettings, userData.newPassword)
        AccountSettings.updateAccountSetting(newAccountSettings)
      })

      it('update notification page- ' + app, () => {
        Click.onContainText(globalSels.buttonTag, notification)
        // Verifying initially that save and cancel buttons should be disabled.
        Verify.elementContainingText(saveButton, save).isDisabled()
        Verify.elementContainingText(globalSels.button, cancel).isDisabled()
        // Clicking the checkbox for receiving email alerts.
        AccountSettings.switchNotificationTypeByLabel(receiveEmailAlerts, true)
        // Verifying whether the checkbox is checked.
        AccountSettings.verify().checkboxIsChecked(receiveEmailAlerts)
        // Clicking the checkbox for receiving text alerts.
        AccountSettings.switchNotificationTypeByLabel(receiveTextAlerts, true)
        // Verifying whether the checkbox is checked.
        AccountSettings.verify().checkboxIsChecked(receiveTextAlerts)
        // Clicking the checkbox for receiving Push Notifications alerts.
        AccountSettings.switchNotificationTypeByLabel(receivePushNotifications, true)
        // Verifying whether the checkbox is checked.
        AccountSettings.verify().checkboxIsChecked(receivePushNotifications)
        // Clicking the save button.
        Click.onContainText(saveButton, save)
        // Verifying the toast message.
        Verify.theToast.showsUpWithText(notificationUpdatedSuccessfully)
      })
    })
    if (app === 'environment') {
      context('Should execute Temperature Settings Page- ' + app, { viewportHeight: 667, viewportWidth: 400 }, () => {
        after('return to the previous state-' + app, function () {
          AccountSettings.updateAccountSetting(userData)
        })
        it('update Temperature Settings page- ' + app, () => {
          Click.onContainText(globalSels.buttonTag, temperatureSettings)
          // Verifying initially that save and cancel buttons should be disabled.
          Verify.elementContainingText(saveButton, save).isDisabled()
          Verify.elementContainingText(globalSels.cancelButton, cancel).isDisabled()
          // Click the Fahrenheit radio button.
          HelperFunction.getElementByLabelParent(fahrenheit, globalSels.inputTag)
            .as('fahrenheitRadioButton')
            .then(($radioBtn) => {
              cy.wrap($radioBtn).click({ force: true })
            })
          // Verify that the Fahrenheit radio button is selected.
          Verify.theElement('@fahrenheitRadioButton').isChecked()
          // Get the Celsius radio button.
          HelperFunction.getElementByLabelParent(celsius, globalSels.inputTag).as('celsiusRadioButton')
          // Verify that the Celsius radio button is not selected.
          Verify.theElement('@celsiusRadioButton').isNotChecked()
          // Clicking the save button.
          Click.onContainText(saveButton, save)
          // Verifying the toast message.
          Verify.theToast.showsUpWithText(temperatureSettingsUpdatedSuccessfully)
        })
      })
    }
  })
})

after('Update alert subscription', () => {
  AccountSettings.updateAlertSubscription(userData)
})
