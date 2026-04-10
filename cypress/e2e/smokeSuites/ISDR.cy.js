import LoginPage from '../../pageObjects/signIn/siginPage'
import { Verify } from '../../utils/assertions'
import globalSels from '../../utils/selectors/globalSels'
import loginData from '../../fixtures/SignIn/user.json'
import overviewDashboard from '../../utils/constants/prosightSafety/overviewDashboard'
import staffManagementConst from '../../utils/constants/prosightSafety/staffManagementConst'
import smartLocation from '../../utils/constants/prosightSafety/smartLocation'
import safetySmartAlerts from '../../utils/constants/prosightSafety/safetySmartAlerts'
import smartReportsConst from '../../utils/constants/prosightSafety/smartReports'
import smartRulesConst from '../../utils/constants/prosightSafety/smartRulesConst'
import accountSetting from '../../utils/constants/prosightAssets/accountSettings'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import Click from '../../utils/Interactions/click'
import prosightSafety from '../../utils/selectors/prosightSafety'

const { pageTitle, title, coxProsight, button, spanTag, buttonTag } = globalSels
const { userProfileBtn } = globalSels.profileSection
const { username, password, name } = loginData

describe('Smoke testing for ISDR application', { tags: '@smoke' }, () => {
  beforeEach('Logging in to ISDR application', () => {
    cy.session(
      'Smoke Test',
      () => {
        HelperFunction.globalIntercept()
        LoginPage.toVisit('/safety/')
        LoginPage.doUserLogin(username, password)
        Verify.theElement(userProfileBtn).hasText(name)
        Verify.theUrl().includes(smartLocation.urlText.smartLocation)
      }
    )
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/safety/')
    Verify.theUrl().includes(staffManagementConst.urlText.smartLocation)
  })

  it('Smart Location page should load without any crash', () => {
    HelperFunction.globalIntercept()
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(smartLocation.urlText.smartLocation)
    Verify.theElement(pageTitle).hasText(staffManagementConst.headerText.staff)
  })

  it('OverviewDashboard page should load without any crash', () => {
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, overviewDashboard.buttonsInnerText.overviewDashboard)
    Verify.theElement(pageTitle).hasText(overviewDashboard.buttonsInnerText.overviewDashboard)
    Verify.theUrl().includes(overviewDashboard.urlText.overviewDashboard)
    Verify.theTitle().equals(coxProsight)
  })

  it('Smart Alert module pages should load without any crash', () => {
    const { smartAlerts } = safetySmartAlerts
    const { alerts, events } = safetySmartAlerts.buttonsInnerText

    // Navigate to Smart Alert module once
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, smartAlerts)
    Verify.theUrl().includes(HelperFunction.toCamelCase(smartAlerts))

    //Validate alert Page
    Verify.theElement(pageTitle).hasText(alerts)
    Verify.theTitle().equals(coxProsight)

    //Validate Event Page
    HelperFunction.navigateToModule(button, events)
    Verify.theUrl().includes(events.toLowerCase())
    Verify.theElement(pageTitle).hasText(events)
    Verify.theTitle().equals(coxProsight)
  })

  it('Smart Rules module pages should load without any crash', () => {
    const { smartRules, alertRules } = smartRulesConst.buttonsInnerText

    // Navigate to Smart Rules module once
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, smartRules)
    Verify.theUrl().includes(smartRulesConst.urls.smartRules)

    // Validate Rules Page
    Verify.theUrl().includes(smartRulesConst.urls.alerts)
    Verify.elementContainingText(title, alertRules).hasText(alertRules)
    Verify.theTitle().equals(coxProsight)
  })

  it('Smart Reports module ages should load without any crash', () => {
    const { smartReports, scheduledReports } = smartReportsConst.buttonInnerTxt

    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, smartReports)
    Verify.theUrl().includes(HelperFunction.toCamelCase(smartReports))

    //validate report page
    Verify.theUrl().includes(smartReportsConst.urlTxt.reports)
    Verify.theTitle().equals(coxProsight)

    //validate scheduled report
    HelperFunction.navigateToModule(button, scheduledReports)
    Verify.theUrl().includes(HelperFunction.toCamelCase(scheduledReports))
    Verify.elementContainingText(title, scheduledReports).hasText(scheduledReports)
    Verify.theTitle().equals(coxProsight)
  })

  it('Staff Management module pages should load without any crash', () => {
    const { staffAssignment, staffManagementText, tagManagement, staffTypePage } = staffManagementConst.buttonInnerText
    const { staff, tags } = staffManagementConst.headerText
    const { title } = prosightSafety.staffType

    // Navigate to Staff Management module once
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, staffManagementText)
    Verify.theUrl().includes(HelperFunction.toCamelCase(staffManagementText))

    // Validate Staff Assignment Page
    HelperFunction.navigateToModule(button, staffAssignment)
    Verify.theUrl().includes(HelperFunction.toCamelCase(staffAssignment))
    Verify.theElement(pageTitle).hasText(staff)
    Verify.theTitle().equals(coxProsight)

    // Validate Tag Management Page
    HelperFunction.navigateToModule(button, tagManagement)
    Verify.theUrl().includes(HelperFunction.toCamelCase(tagManagement))
    Verify.theElement(pageTitle).hasText(tags)
    Verify.theTitle().equals(coxProsight)

    // Validate Staff Type Page
    HelperFunction.navigateToModule(button, staffTypePage)
    Verify.theUrl().includes(HelperFunction.toCamelCase(staffTypePage))
    Verify.theElement(title).hasText(staffTypePage)
    Verify.theTitle().equals(coxProsight)
  })

  it('Account settings pages should load without any crash', () => {
    const { accountSettings } = accountSetting.urlText
    const { profile } = accountSetting.uiText
    const { alertSubscriptions, notifications } = accountSetting.accountSettingsOptions
    const { userProfileBtn } = globalSels.profileSection

    // Navigate to Accounts section
    Verify.theElement(userProfileBtn).hasText(name)
    Click.forcefullyOn(userProfileBtn)
    Click.onContainText(spanTag, accountSetting.buttonsInnerText.account)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(accountSettings)

    // Validate Profile Page
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(profile.toLowerCase())
    Verify.elementContainingText(pageTitle, profile).isVisible()

    // Validate Alert Subscriptions Page
    Click.onContainText(buttonTag, alertSubscriptions)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(alertSubscriptions))
    Verify.elementContainingText(pageTitle, alertSubscriptions).isVisible()

    // Validate Notifications Page
    Click.onContainText(buttonTag, notifications)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(notifications.toLowerCase())
    Verify.elementContainingText(pageTitle, notifications).isVisible()
  })
})
