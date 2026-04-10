/// <reference types="cypress" />
import SmartAlertsUsingAPI from '../../../../pageObjects/prosightCore/triggeringAlerts'
import Safety from '../../../../pageObjects/prosightSafety/safetySmartAlerts'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import { Verify } from '../../../../utils/assertions'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import globalSels from '../../../../utils/selectors/globalSels'
import alertData from '../../../../fixtures/prosightSafety/safetyAlertData.json'
import userData from '../../../../fixtures/SignIn/user.json'
import constants from '../../../../utils/constants/smartAlertsManagementConst'
import SmartRules from '../../../../pageObjects/prosightSafety/smartRules'
import FloorPlanManagement from '../../../../pageObjects/prosightCore/floorPlanManagementFns'
import Click from '../../../../utils/Interactions/click'
import smartLocation from '../../../../pageObjects/prosightSafety/smartLocation'
import selectors from '../../../../utils/selectors/prosightSafety'
const {minimizeButton,maximizeButton} = selectors.smartAlerts
const { username, password } = userData
const {
  staffDetails,
  staffTagDetails,
  locationDetails,
  roomDetails,
  floorDetails,
  hospitalName,
  departmentBoundaryName,
  staffAlertTypes,
  staffEmergencyRuleDetails,
} = alertData
const { staffName, staffType, locationName, departmentName, buildingName, deviceId } = staffDetails

const {tagLowBattery5, tagLowBattery20, staffTagOffline } = staffAlertTypes.nonEmergencyAlert
const { staffEmergency } = alertData.staffAlertTypes.emergencyAlert

const { staff, tag } = leverageConstants.objectTypes
const { smartAlertManagement, events } = constants.buttonsInnerText
const { event, alerts } = constants.urlText
const { messageAfterAlertAcknowledge, messageAfterAlertClear, messageAfterEventUnacknowledge, messageAfterAlertIsResolved ,messageAfterRespondingToStaffEmergencyAlert} = constants.toastMessages
const { button, clearAllButton } = globalSels
const { tableView, sidePanel, carousel } = constants.actionPlace
const { option1, option2 } = constants.escalateOptions

/**
 * This function is used to verify and acknowledge the alert
 * @param {*} alertType - The type of alert for which this function needs to be applied on
 * @param {*} view - The place where action are made
 */
const acknowledgeAndVerify = (alertType, view = tableView) => {
  Click.forcefullyOn(clearAllButton)
  Safety.selectAlertTypeFromFilter(alertType)
  Safety.acknowledgeAlert(staffDetails, view, alertType)
  Verify.theToast.showsToastMessage(messageAfterAlertAcknowledge)
}

/**
 * This function is used to verify and clear the alert
 * @param {*} alertType - The type of alert for which this function needs to be applied on
 * @param {*} view - The place where action are made
 */
const clearAndVerify = (alertType, view = tableView) => {
  Click.forcefullyOn(clearAllButton)
  Safety.selectAlertTypeFromFilter(alertType)
  Safety.clearAlert(staffDetails, view, alertType)
  Verify.theToast.showsToastMessage(messageAfterAlertClear)
}

/**
 * This function is used to verify and unacknowledge the alert
 * @param {*} alertType - The type of alert for which this function needs to be applied on
 * @param {*} view - The place where action are made
 */
const unacknowledgeAndVerify = (alertType, view = tableView) => {
  Click.forcefullyOn(clearAllButton)
  Safety.selectAlertTypeFromFilter(alertType)
  Safety.unAcknowledgedAlert(staffDetails, alertType, view)
  Verify.theToast.showsToastMessage(messageAfterEventUnacknowledge)
}

before(() => {
  cy.getRunID()
})
afterEach(function () {
  cy.addingTestCases()
})

before('Clean up all test data', () => {

  //Delete alerts
  SmartAlertsUsingAPI.deleteAllAlerts(staffName)

  // Primary staff cleanup
  HelperFunction.unlinkTag_Sensor_API(staffName, staff)
  HelperFunction.deleteItem_API(deviceId, tag)
  HelperFunction.deleteItem_API(staffName, staff)
  HelperFunction.deleteEquipment_Asset_StaffType_API(staffType, staff)

  // Floor plan
  FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)
  FloorPlanManagement.deleteDepartment_API(departmentName)
  FloorPlanManagement.deleteFloor_API(floorDetails.floorName, hospitalName)

  SmartAlertsUsingAPI.deleteTimer()
})

describe('Alerts', () => {
  before('Setup test data and login', () => {
    HelperFunction.globalIntercept()
    // Create test hierarchy
    FloorPlanManagement.createDepartment_API(departmentName, buildingName)
    FloorPlanManagement.createRoomType_API(roomDetails)
    FloorPlanManagement.createFloor_API(floorDetails, locationDetails, hospitalName, buildingName, departmentName)
    FloorPlanManagement.createDepartmentBoundary_API(departmentBoundaryName, departmentName, floorDetails.floorName)

    // Create and link primary staff
    SmartAlertsUsingAPI.createTags(staffTagDetails)
    HelperFunction.createEquipment_Asset_StaffType_API(staffType, staff)
    Safety.createStaff(staffDetails)
    HelperFunction.linkSensor_Tag_API(staffName, staff, deviceId)
    //Create rules
    SmartRules.createStaffEmergencyRules_API(staffEmergencyRuleDetails)

    //Delete all alerts
    SmartAlertsUsingAPI.deleteAllAlerts(staffName)

    // Trigger all staff non-emergency alerts
    Object.values(staffAlertTypes.nonEmergencyAlert).forEach((type) => {
      Safety.triggerStaffAlerts(staffName, type)
    })
  })

  beforeEach('Login with session', () => {
    HelperFunction.globalIntercept()
    cy.session([username, password], () => {
      LoginPage.toVisit('/safety')
      LoginPage.doUserLogin(username, password)
      //Navigate to alerts page
      HelperFunction.navigateToModule(button, smartAlertManagement)
      Verify.theUrl().includes(alerts)
    })

    LoginPage.toVisit('/safety')
    HelperFunction.navigateToModule(button, smartAlertManagement)
    Verify.theUrl().includes(alerts)
  })

  it('7480, 7481, 7483, Perform Acknowledge and Clear actions on alerts', () => {
    let reponseComment = username + ' is responding'
    acknowledgeAndVerify(staffTagOffline)
    acknowledgeAndVerify(tagLowBattery20, sidePanel)
    clearAndVerify(tagLowBattery5)
    Click.forcefullyOn(clearAllButton)
    Safety.removeStaffEmergencyAlertCarousel()
    Safety.triggerStaffAlerts(staffName, staffEmergency)
    //Not Responding the staff emergency alert in carousel, side panel and table view
    smartLocation.notRespondingStaffEmergencyAlert(staffDetails,carousel,staffEmergency)
    Click.forcefullyOn(maximizeButton)
    smartLocation.respondingStaffEmergencyAlert(staffDetails,carousel,staffEmergency,reponseComment)
    Verify.theToast.showsToastMessage(messageAfterRespondingToStaffEmergencyAlert)
    smartLocation.verifyRespondingAndNotRespondingButtons(staffName,carousel)
    Click.forcefullyOn(minimizeButton)
    smartLocation.standDownAlert('All ok',staffDetails,tableView,staffEmergency,reponseComment)


    Safety.triggerStaffAlerts(staffName, staffEmergency)
    cy.reload()
    Safety.removeStaffEmergencyAlertCarousel()
    smartLocation.notRespondingStaffEmergencyAlert(staffDetails,tableView,staffEmergency)
    smartLocation.notRespondingStaffEmergencyAlert(staffDetails,sidePanel,staffEmergency)
    smartLocation.respondingStaffEmergencyAlert(staffDetails,tableView,staffEmergency,reponseComment)
    smartLocation.verifyRespondingAndNotRespondingButtons(staffName,tableView)
    smartLocation.verifyRespondingAndNotRespondingButtons(staffName,sidePanel)
    smartLocation.standDownAlert('All ok',staffDetails,tableView,staffEmergency,reponseComment)
    Verify.theToast.showsToastMessage(messageAfterAlertIsResolved)
  })

  it('7482, Perform Un-Acknowledge actions on alerts', () => {
    HelperFunction.navigateToModule(button, events)
    Verify.theUrl().includes(event)
    unacknowledgeAndVerify(staffTagOffline)
    unacknowledgeAndVerify(tagLowBattery20,sidePanel)
    Click.forcefullyOn(clearAllButton)
    smartLocation.verifyStaffEmergencyAlertIsResolved(staffDetails,tableView,staffEmergency)
    smartLocation.verifyStaffEmergencyAlertIsResolved(staffDetails,sidePanel,staffEmergency)
  })

  after('Clean up all test data', () => {
    //Delete alerts
    SmartAlertsUsingAPI.deleteAllAlerts(staffName)

    // Primary staff cleanup
    HelperFunction.unlinkTag_Sensor_API(staffName, staff)
    HelperFunction.deleteItem_API(deviceId, tag)
    HelperFunction.deleteItem_API(staffName, staff)
    HelperFunction.deleteEquipment_Asset_StaffType_API(staffType, staff)

    // Floor plan
    FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)
    FloorPlanManagement.deleteDepartment_API(departmentName)
    FloorPlanManagement.deleteFloor_API(floorDetails.floorName, hospitalName)

    SmartAlertsUsingAPI.deleteTimer()
    //Remove the alert carousel
    Safety.removeStaffEmergencyAlertCarousel()
  })
})
