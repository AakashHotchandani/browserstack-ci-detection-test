/// <reference types="cypress" />
import LoginPage from '../../pageObjects/signIn/siginPage'
import userData from '../../fixtures/SignIn/user.json'
import { Verify } from '../../utils/assertions'
import Click from '../../utils/Interactions/click'
import globalSels from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import userManagementConst from '../../utils/constants/prosightCore/userManagementConst'
import hospitalManagementConst from '../../utils/constants/prosightCore/hospitalManagementConst'
import buildingManagementConst from '../../utils/constants/prosightCore/buildingManagementConst'
import smartAlertsManagementConst from '../../utils/constants/smartAlertsManagementConst'
import floorPlanManagementConst from '../../utils/constants/prosightCore/floorPlanManagementConst'
import prosightCore from '../../utils/selectors/prosightCore'
import deviceManagementConstants from '../../utils/constants/prosightCore/deviceManagementConstants'
import accountSetting from '../../utils/constants/prosightAssets/accountSettings'
const { username, password, name } = userData
const { pageTitle, button, overViewDashBoard, systemAnalytics, userAnalytics, buttonTag, title, profileSection, coxProsight, spanTag } = globalSels
const { overviewDashboard, admin } = floorPlanManagementConst.urlText
describe('Admin smoke test', { tags: '@smoke' }, () => {
  beforeEach('Navigate to userManagement module', () => {
    HelperFunction.globalIntercept()
    cy.session(
      'Smoke Test',
      () => {
        LoginPage.toVisit('/core/')
        LoginPage.doUserLogin(username, password)
        Verify.theUrl().includes(overviewDashboard)
      }
    )
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/core/')
    Verify.theUrl().includes(admin)
  })
  it('Overview dashboard page should load without any crash', () => {
    HelperFunction.globalIntercept()
    Verify.theUrl().includes(overviewDashboard)
    Verify.theTitle().equals(coxProsight)
    Verify.elementContainingText(pageTitle, overViewDashBoard).isVisible()
    Verify.elementContainingText(button, systemAnalytics).isVisible()
    Verify.elementContainingText(button, userAnalytics).isVisible()
  })
  it('User management module pages should load without any crash', () => {
    const { users, userManagement, permissioning, oidc } = userManagementConst.buttonsInnerText

    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, userManagement)
    Verify.theUrl().includes(HelperFunction.toCamelCase(userManagement))

    //User page
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(users.toLowerCase())
    Verify.elementContainingText(pageTitle, users).isVisible()
    //OIDC page
    Click.onContainText(buttonTag, oidc)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(oidc.toLowerCase())
    Verify.elementContainingText(pageTitle, userManagementConst.pageTitle.OIDCConnection).isVisible()
    //Permissioning page
    Click.onContainText(buttonTag, permissioning)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(permissioning.toLowerCase())
    Verify.elementContainingText(pageTitle, permissioning).isVisible()
  })

  it('Hospital management module pages should load without any crash', () => {
    const { hospitalManagement, hospitals } = hospitalManagementConst.buttonsInnerText
    const { buildingsTab } = buildingManagementConst.buttonsInnerText
    const { hospitalManagementUrl } = buildingManagementConst.urlText

    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, hospitalManagement)
    Verify.theUrl().includes(HelperFunction.toCamelCase(hospitalManagementUrl))

    //Facility page
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(hospitalManagementUrl)
    Verify.elementContainingText(pageTitle, hospitals).isVisible()
    //Buildings page
    Click.onContainText(buttonTag, buildingsTab)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(buildingsTab.toLowerCase())
    Verify.elementContainingText(pageTitle, buildingsTab).isVisible()
  })

  it('Smart alert management module pages should load without any crash', () => {
    const { smartAlertManagement, alertText, tasks, events } = smartAlertsManagementConst.buttonsInnerText

    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, smartAlertManagement)
    Verify.theUrl().includes(HelperFunction.toCamelCase(smartAlertManagement))

    //Alerts page
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(alertText.toLowerCase())
    Verify.elementContainingText(pageTitle, alertText).isVisible()
    //Tasks page
    Click.onContainText(buttonTag, tasks)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(tasks.toLowerCase())
    Verify.elementContainingText(pageTitle, tasks).isVisible()
    //Events page
    Click.onContainText(buttonTag, events)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(events.toLowerCase())
    Verify.elementContainingText(pageTitle, events).isVisible()
  })

  it('Floor plan management module pages should load without any crash', () => {
    const { departments, departmentBoundary, roomType, rooms, mapSettings } = prosightCore.floorPlanManagement
    const { floorPlanManagementText, floors } = prosightCore.moduleBtnText
    const { floorManagement, departmentManagement, departmentBoundaryManagement, zoomSettings } = floorPlanManagementConst.urlText

    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, floorPlanManagementText)
    Verify.theUrl().includes(HelperFunction.toCamelCase(floorPlanManagementText))

    //Floors page
    Click.onContainText(buttonTag, floors)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(floorManagement)
    Verify.elementContainingText(pageTitle, floors).isVisible()
    //Departments page
    Click.onContainText(buttonTag, departments)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(departmentManagement)
    Verify.elementContainingText(pageTitle, departments).isVisible()
    //Department Boundaries page
    Click.onContainText(buttonTag, departmentBoundary)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(departmentBoundaryManagement)
    Verify.elementContainingText(pageTitle, departmentBoundary).isVisible()
    //Room Type page
    Click.onContainText(buttonTag, roomType)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(roomType))
    Verify.elementContainingText(title, floorPlanManagementConst.uiTexts.roomTypes).isVisible()
    //Rooms page
    Click.onContainText(buttonTag, rooms)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(floorPlanManagementConst.urlText.roomManagement)
    Verify.elementContainingText(pageTitle, rooms).isVisible()
    //Map Settings page
    Click.onContainText(buttonTag, mapSettings)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(zoomSettings)
  })

  it('Device management module pages should load without any crash', () => {
    const {
      deviceManagementUrl,
      tagManagement,
      tags,
      SensorManagementButton,
      sensors,
      GatewayManagementButton,
      gateways,
      hhSensorManagementButtonText,
      hhSensors,
    } = deviceManagementConstants

    HelperFunction.globalIntercept()
    Click.onContainText(buttonTag, globalSels.moduleBtnsText.deviceManagement)
    Verify.theUrl().includes(deviceManagementUrl)

    //Tag management page
    Click.onContainText(buttonTag, tagManagement)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(tagManagement))
    Verify.elementContainingText(pageTitle, tags).isVisible()
    //Sensor management page
    Click.onContainText(buttonTag, SensorManagementButton)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(SensorManagementButton))
    Verify.elementContainingText(pageTitle, sensors).isVisible()
    //Gateway management page
    Click.onContainText(buttonTag, GatewayManagementButton)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(GatewayManagementButton))
    Verify.elementContainingText(pageTitle, gateways).isVisible()
    //HH sensor management page
    Click.onContainText(buttonTag, hhSensorManagementButtonText)
    Verify.theTitle().equals(coxProsight)
    Verify.theUrl().includes(HelperFunction.toCamelCase(hhSensorManagementButtonText))
    Verify.elementContainingText(pageTitle, hhSensors).isVisible()
  })

  it('Account settings page should load without any crash', () => {
    const { accountSettings } = accountSetting.urlText
    const { profile } = accountSetting.uiText
    const { alertSubscriptions, notifications, tempSettings } = accountSetting.accountSettingsOptions
    const { userProfileBtn } = globalSels.profileSection

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
  })
})
