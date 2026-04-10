import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import loginData from '../../fixtures/SignIn/user.json'
import globalSels from '../../utils/selectors/globalSels'
import LoginPage from '../../pageObjects/signIn/siginPage'
import { Verify } from '../../utils/assertions'
import assetsManagementConst from '../../utils/constants/prosightAssets/assetsManagement'
import smartRulesConst from '../../utils/constants/prosightAssets/smartRules'
import smartReportsConst from '../../utils/constants/smartReports'
import smartOperationsConst from '../../utils/constants/prosightAssets/smartOperations'
import smartOrderingConst from '../../utils/constants/prosightAssets/smartOrdering'
import assetsSmartAlerts from '../../utils/constants/prosightAssets/assetsSmartAlerts'
import overviewDashboard from '../../utils/constants/prosightAssets/overviewDashboard'
import smartLocation from '../../utils/constants/prosightAssets/smartLocation'
import Click from '../../utils/Interactions/click'
import accountSettingsConst from '../../utils/constants/prosightAssets/accountSettings'

const { pageTitle, title, coxProsight, button, buttonTag, spanTag } = globalSels
const { userProfileBtn } = globalSels.profileSection

describe('Smoke testing for IAP application', { tags: '@smoke' }, () => {
  beforeEach('Logging in to IAP application', () => {
    cy.session(
      'Smoke Test',
      () => {
        HelperFunction.globalIntercept()
        LoginPage.toVisit('/assets/')
        LoginPage.doUserLogin(loginData.username, loginData.password)
        Verify.theUrl().includes(smartLocation.urlTxt.smartLocation)
        Verify.theElement(userProfileBtn).hasText(loginData.name)
      }
    )
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/assets/')
  })

  it('Smart Location page should load without any crash', () => {
    HelperFunction.globalIntercept()
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(smartLocation.urlTxt.smartLocation)
    Verify.theElement(pageTitle).hasText(assetsManagementConst.headers.assets)
  })

  it('OverviewDashboard page should load without any crash', () => {
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, overviewDashboard.buttonsInnerText.overviewDashboard)
    Verify.theTitle().equals(coxProsight)
    Verify.theElement(pageTitle).hasText(overviewDashboard.buttonsInnerText.overviewDashboard)
    Verify.theUrl().includes(HelperFunction.toCamelCase(overviewDashboard.buttonsInnerText.overviewDashboard))
  })

  it('Smart Alert pages should load without any crash', () => {
    const { alerts, tasks, events } = assetsSmartAlerts.buttonsInnerText

    // Navigate to Smart Alerts module
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, assetsSmartAlerts.smartAlerts)
    Verify.theUrl().includes(assetsSmartAlerts.urlDataVerification.smartAlerts)

    // Validate Alerts Page
    Verify.theElement(pageTitle).hasText(alerts)
    Verify.theTitle().equals(coxProsight)

    // Validate Tasks Page
    HelperFunction.navigateToModule(button, tasks)
    Verify.theUrl().includes(tasks.toLowerCase())
    Verify.theElement(pageTitle).hasText(tasks)
    Verify.theTitle().equals(coxProsight)

    // Validate Events Page
    HelperFunction.navigateToModule(button, events)
    Verify.theUrl().includes(events.toLowerCase())
    Verify.theElement(pageTitle).hasText(events)
    Verify.theTitle().equals(coxProsight)
  })

  it('Smart Ordering pages should load without any crash', () => {
    const { smartOrdering, utilizationAnalytics, missingAnalytics } = smartOrderingConst.buttonsInnerText
    const { inventory, utilization, shrinkage } = smartOrderingConst.urlText

    // Navigate to Smart Ordering module once
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, smartOrdering)
    Verify.theUrl().includes(smartOperationsConst.urlText.smartOrdering)

    // Validate Inventory Analytics Page
    Verify.theUrl().includes(inventory)
    Verify.theTitle().equals(coxProsight)

    // Validate Utilization Analytics Page
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, utilizationAnalytics)
    Verify.theUrl().includes(utilization)
    Verify.theTitle().equals(coxProsight)

    // Validate Missing Analytics Page
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, missingAnalytics)
    Verify.theUrl().includes(shrinkage)
    Verify.theTitle().equals(coxProsight)
  })

  it('Smart Operations pages should load without any crash', () => {
    const { smartOperations, parLevelStatus } = smartOperationsConst.buttonsInnerText

    // Navigate to Smart Operations module once
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, smartOperations)
    Verify.theUrl().includes(smartOperationsConst.urlText.smartOperations)

    // Validate PAR Dashboard Page
    Verify.theUrl().includes(smartOperationsConst.urlText.parDashboard)
    Verify.theTitle().equals(coxProsight)

    // Validate PAR Level Status Page
    HelperFunction.navigateToModule(button, parLevelStatus)
    Verify.theUrl().includes(HelperFunction.toCamelCase(parLevelStatus))
    Verify.theElement(pageTitle).hasText(parLevelStatus)
    Verify.theTitle().equals(coxProsight)
  })

  it('Smart Reports pages should load without any crash', () => {
    const { smartReports, scheduledReports } = smartReportsConst.buttonInnerTxt

    // Navigate to Smart Reports module once
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, smartReports)
    Verify.theUrl().includes(HelperFunction.toCamelCase(smartReports))

    // Validate Reports Page
    Verify.theUrl().includes(smartReportsConst.urlTxt.reports)
    Verify.theTitle().equals(coxProsight)

    // Validate Scheduled Reports Page
    HelperFunction.navigateToModule(button, scheduledReports)
    Verify.theUrl().includes(HelperFunction.toCamelCase(scheduledReports))
    Verify.elementContainingText(title, scheduledReports).hasText(scheduledReports)
    Verify.theTitle().equals(coxProsight)
  })

  it('Smart Rules pages should load without any crash', () => {
    const { smartRules, orderingRules, operationsRules } = smartRulesConst.buttonsInnerText
    const [Ordering] = orderingRules.split('')
    const [Operations] = operationsRules.split('')

    // Navigate to Smart Rules module once
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, smartRules)
    Verify.theUrl().includes(smartRulesConst.urlText.smartRules)

    // Validate Ordering Rules Page
    Verify.theUrl().includes(Ordering.toLowerCase())
    Verify.elementContainingText(title, orderingRules).hasText(orderingRules)
    Verify.theTitle().equals(coxProsight)

    // Validate ProPAR Rules Page
    Click.onContainText(buttonTag, operationsRules)
    Verify.theUrl().includes(Operations.toLowerCase())
    Verify.elementContainingText(title, operationsRules).hasText(operationsRules)
    Verify.theTitle().equals(coxProsight)
  })


  it('Asset Management pages should load without any crash', () => {
    const { assetsManagement, tagManagement, assetType } = assetsManagementConst.buttonsInnerText
    const { tags, assets } = assetsManagementConst.headers

    // Navigate to Asset Management module once
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, assetsManagement)
    Verify.theUrl().includes(HelperFunction.toCamelCase(assetsManagement))

    // Validate Asset Assignment Page
    Verify.theUrl().includes(assetsManagementConst.urlText.assetsAssignment)
    Verify.theElement(pageTitle).hasText(assets)
    Verify.theTitle().equals(coxProsight)

    // Validate Tag Management Page
    HelperFunction.navigateToModule(button, tagManagement)
    Verify.theUrl().includes(HelperFunction.toCamelCase(tagManagement))
    Verify.theElement(pageTitle).hasText(tags)
    Verify.theTitle().equals(coxProsight)

    // Validate Asset Type Page
    HelperFunction.navigateToModule(button, assetType)
    Verify.theUrl().includes(HelperFunction.toCamelCase(assetType))
    Verify.elementContainingText(title, assetType).hasText(assetType)
    Verify.theTitle().equals(coxProsight)
  })

  it('Account Settings pages should load without any crash', () => {
    const { accountSettings } = accountSettingsConst.urlText
    const { profile } = accountSettingsConst.uiText
    const { alertSubscriptions, notifications, tempSettings } = accountSettingsConst.accountSettingsOptions

    // Navigate to Accounts section once
    Verify.theElement(userProfileBtn).hasText(loginData.name)
    Click.forcefullyOn(userProfileBtn)
    Click.onContainText(spanTag, accountSettingsConst.buttonsInnerText.account)
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
