/// <reference types="cypress" />
import LoginPage from '../../pageObjects/signIn/siginPage'
import userData from '../../fixtures/SignIn/user.json'
import { Verify } from '../../utils/assertions'
import constant from '../../utils/constants/prosightCore/floorPlanManagementConst'
import Click from '../../utils/Interactions/click'
import globalSels from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import environmentConstants from '../../utils/constants/prosightEnvironment/equipmentAssignmentConst'
import smartAlertsManagementConst from '../../utils/constants/smartAlertsManagementConst'
import assetsConstants from '../../utils/constants/smartReports'
import environmentSels from '../../utils/selectors/prosightEnvironment'
import SmartAlerts from '../../utils/constants/prosightEnvironment/smartAlerts'
import smartRulesConst from '../../utils/constants/prosightSafety/smartRulesConst'
import envSmartRulesConst from '../../utils/constants/prosightEnvironment/smartRulesConstant'
import accountSetting from '../../utils/constants/prosightAssets/accountSettings'

const { username, password, name } = userData
const { pageTitle, overViewDashBoard, buttonTag, title, sideNavTitle, profileSection, coxProsight, spanTag } = globalSels
const { equipment_Assignment, environment, smartMonitoring } = environmentConstants.urlText
const { equipmentType } = environmentConstants.uiText

describe('IEM Smoke test', { tags: '@smoke' }, () => {
  beforeEach('Navigate to userManagement module', () => {
    HelperFunction.globalIntercept()
    cy.session(
      'Smoke Test',
      () => {
        LoginPage.toVisit('/environment/')
        LoginPage.doUserLogin(username, password)
        Verify.theUrl().includes(smartMonitoring)
      }
    )
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/environment/')
    Verify.theUrl().includes(environment)
  })

  it('Overview dashboard page should load with any crash', () => {
    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, overViewDashBoard)
    Verify.theUrl().includes(constant.urlText.overviewDashboard)
    Verify.theTitle().equals(coxProsight)
    Verify.elementContainingText(pageTitle, overViewDashBoard).isVisible()
  })

  it('Smart monitoring page should load with any crash', () => {
    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, environmentSels.moduleButtonText.smartMonitoring)
    Verify.theUrl().includes(environmentSels.moduleButtonText.smartMonitoringUrl)
    Verify.theTitle().equals(coxProsight)
    Verify.elementContainingText(sideNavTitle, environmentSels.moduleButtonText.smartMonitoring).isVisible()
  })

  it('Smart alert module pages should load without any crash', () => {
    const { alertText, tasks, events } = smartAlertsManagementConst.buttonsInnerText
    const { smartAlerts } = SmartAlerts

    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, smartAlerts)
    Verify.theUrl().includes(smartAlertsManagementConst.urlText.smartAlertManagement)

    //Alert Page
    Click.onContainText(buttonTag, alertText)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(alertText.toLowerCase())
    Verify.elementContainingText(pageTitle, alertText).isVisible()
    //Task Page
    Click.onContainText(buttonTag, tasks)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(tasks.toLowerCase())
    Verify.elementContainingText(pageTitle, tasks).isVisible()
    //Event Page
    Click.onContainText(buttonTag, events)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(events.toLowerCase())
    Verify.elementContainingText(pageTitle, events).isVisible()
  })

  it('Smart reports module pages should load without any crash', () => {
    const { smartReports, reports, scheduledReports } = assetsConstants.buttonInnerTxt

    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, smartReports)
    Verify.theUrl().includes(HelperFunction.toCamelCase(smartReports))

    //report page
    Click.onContainText(buttonTag, reports)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(reports))
    Verify.textPresent.isVisible(environmentSels.moduleButtonText.envReport)
    //scheduled report
    Click.onContainText(buttonTag, scheduledReports)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(scheduledReports))
    Verify.elementContainingText(title, scheduledReports).isVisible()
  })

  it('Smart rules module pages should load without any crash', () => {
    const { smartRules, escalations } = smartRulesConst.buttonsInnerText
    const { envRules, inspectionRules } = envSmartRulesConst.buttonInnerText

    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, smartRules)
    Verify.theUrl().includes(smartRulesConst.urls.smartRules)

    //Environmental Rule
    HelperFunction.globalIntercept()
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(envRules))
    Verify.elementContainingText(pageTitle, environmentConstants.headerText.environment).isVisible()
    //Escalations
    Click.onContainText(buttonTag, escalations)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(escalations.toLowerCase())
    Verify.elementContainingText(environmentSels.smartRules.escalationHeader, escalations).isVisible()
    //Inspection rule
    const [inspection, rules] = inspectionRules.split(' ')
    Click.onContainText(buttonTag, inspectionRules)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(inspection.toLowerCase())
    Verify.elementContainingText(pageTitle, inspection).isVisible()
  })

  it('Equipment management module pages should load without any crash', () => {
    const { equipmentManagement } = environmentSels.moduleButtonText

    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, equipmentManagement)
    Verify.theUrl().includes(HelperFunction.toCamelCase(equipmentManagement))

    //Equipment assignment
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(equipment_Assignment)
    Verify.elementContainingText(pageTitle, environmentConstants.headerText.equipment).isVisible()
    //sendor Management  
    Click.onContainText(buttonTag, globalSels.moduleBtnsText.sensorManagement)
    Verify.theUrl().includes(HelperFunction.toCamelCase(globalSels.moduleBtnsText.sensorManagement))
    Verify.theTitle().equals(coxProsight)
    Verify.elementContainingText(pageTitle, environmentConstants.headerText.sensor).isVisible()
    //Equipment type    
    Click.onContainText(buttonTag, equipmentType)
    Verify.theUrl().includes(HelperFunction.toCamelCase(equipmentType))
    Verify.theTitle().equals(coxProsight)
    Verify.elementContainingText(title, equipmentType).isVisible()
  })

  it('Account settings page should load without any crash', () => {
    const { accountSettings } = accountSetting.urlText
    const { profile } = accountSetting.uiText
    const { alertSubscriptions, notifications, tempSettings } = accountSetting.accountSettingsOptions
    const { userProfileBtn } = profileSection

    Verify.theElement(userProfileBtn).hasText(name)
    Click.forcefullyOn(userProfileBtn)
    Click.onContainText(spanTag, accountSetting.buttonsInnerText.account)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(accountSettings)

    //Profile page
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(profile.toLowerCase())
    Verify.elementContainingText(pageTitle, profile).isVisible()
    //Alert subscription page
    Click.onContainText(buttonTag, alertSubscriptions)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(alertSubscriptions))
    Verify.elementContainingText(pageTitle, alertSubscriptions).isVisible()
    //Notifications page
    Click.onContainText(buttonTag, notifications)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(notifications.toLowerCase())
    Verify.elementContainingText(pageTitle, notifications).isVisible()
    //Temperature settings
    Click.onContainText(buttonTag, tempSettings)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(accountSettings)
    Verify.theUrl().includes(HelperFunction.toCamelCase(tempSettings))
    Verify.elementContainingText(pageTitle, tempSettings)
  })
})
