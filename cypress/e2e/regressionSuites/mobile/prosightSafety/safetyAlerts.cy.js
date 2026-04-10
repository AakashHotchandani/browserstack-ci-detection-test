/// <reference types="cypress" />
import SmartAlertsUsingAPI from '../../../../pageObjects/prosightCore/triggeringAlerts'
import Safety from '../../../../pageObjects/prosightSafety/safetySmartAlerts'
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import { Verify } from '../../../../utils/assertions'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import globalSels from '../../../../utils/selectors/globalSels'
import alertData from '../../../../fixtures/prosightSafety/safetyAlertData_Mobile.json'
import userData from '../../../../fixtures/SignIn/user.json'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import constants from '../../../../utils/constants/smartAlertsManagementConst'
import Click from '../../../../utils/Interactions/click'
import globalConst from '../../../../utils/constants/globalConst'
import SmartRules from '../../../../pageObjects/prosightSafety/smartRules'
import prosightSafety from '../../../../utils/selectors/prosightSafety'
import FloorPlanManagement from '../../../../pageObjects/prosightCore/floorPlanManagementFns'
import smartLocation from '../../../../pageObjects/prosightSafety/smartLocation'
import selectors from '../../../../utils/selectors/prosightSafety'
const { minimizeButton, maximizeButton } = selectors.smartAlerts
const reponseComment = 'All ok'
const { option1, option2 } = constants.escalateOptions
const { username, password } = userData
const { staff, tag } = leverageConstants.objectTypes
const { smartAlertManagement, acknowledge, clearButton, alertText } = constants.buttonsInnerText
const { alerts } = constants.urlText
const { messageAfterAlertAcknowledge, messageAfterAlertClear, escalateAlert, messageAfterRespondingToStaffEmergencyAlert, messageAfterAlertIsResolved } = constants.toastMessages
const { hospitalName, buildingName } = globalConst.hospitalAndBuilding
const { staffDetails } = alertData
const { staffName, staffType, staffId, departmentName, floorName, locationName, previousRoomName, deviceId } = alertData.staffDetails
const { tagLowBattery, staffTagOffline } =
  leverageConstants.alertTypes.staffAlertTypes.nonEmergencyAlert
const { staffEmergency } = alertData.staffAlertTypes.emergencyAlert
const { batteryStatus } = alertData.staffAlertTypes
const {
  button,
  hamburgerBtn,
  mobileSecondarySideNav,
  cardView,
  detailsIcon,
  headerCard,
  innerButton,
  clearAllButtonMobile,
  incidentContainer,
  backButtonInMobileView,
} = globalSels
const { carousel, alertDetailsPage, tableView, mobile } = constants.actionPlace
const { acknowledgeDescription } = constants
const alertsRegex = new RegExp(`^\\s*${alertText}\\s*$`)

const verifyAlertFlow = (alertType, verificationData, action = acknowledge, searchKey = staffName, taskDescription = null) => {
  HelperFunction.search(searchKey, true)
  Safety.selectAlertTypeFromFilter(alertType, 'mobile')
  HelperFunction.getRowByItemName(searchKey, cardView, staff).as('alertRow')
  HelperFunction.verifyValuesInTheCardView('@alertRow', verificationData)
  Click.onButton('@alertRow', detailsIcon)
  HelperFunction.verifyValuesInTheCardView(headerCard, verificationData)
  HelperFunction.performAlertActionsOnAlertDescriptionInMobile(action, taskDescription, leverageConstants.application.safety)
  Verify.theToast.showsToastMessage(action === clearButton ? messageAfterAlertClear : messageAfterAlertAcknowledge)
  Click.forcefullyOn(clearAllButtonMobile)
}


before('Clean existing data', () => {
  HelperFunction.globalIntercept()

  SmartAlertsUsingAPI.deleteAllAlerts(staffName)

  // Remove staff and tags
  HelperFunction.unlinkTag_Sensor_API(staffName, staff)
  HelperFunction.deleteItem_API(deviceId, tag)
  HelperFunction.deleteItem_API(staffName, staff)
  HelperFunction.deleteEquipment_Asset_StaffType_API(staffType, staff)

  // Remove hierarchy
  FloorPlanManagement.deleteRoomType_API(alertData.roomDetails.roomTypeName)
  FloorPlanManagement.deleteDepartment_API(departmentName)
  FloorPlanManagement.deleteFloor_API(floorName, hospitalName)

  SmartAlertsUsingAPI.deleteTimer()
})

describe(`Trigger and verify alert functionality`, { viewportHeight: 667, viewportWidth: 375 }, () => {
  before('Setup staff, tags, rules, login and navigate', () => {
    HelperFunction.globalIntercept()

    // Setup hierarchy
    FloorPlanManagement.createDepartment_API(departmentName, buildingName)
    FloorPlanManagement.createRoomType_API(alertData.roomDetails)
    FloorPlanManagement.createFloor_API(alertData.floorDetails, alertData.locationDetails, hospitalName, buildingName, departmentName)
    FloorPlanManagement.createDepartmentBoundary_API(alertData.departmentBoundaryName, departmentName, alertData.floorDetails.floorName)

    // Setup staff & tag
    SmartAlertsUsingAPI.createTags(alertData.staffTagDetails)
    HelperFunction.createEquipment_Asset_StaffType_API(staffType, staff)
    Safety.createStaff(alertData.staffDetails)
    HelperFunction.linkSensor_Tag_API(staffName, staff, deviceId)

    // Setup rules
    SmartRules.createStaffEmergencyRules_API(alertData.staffEmergencyRuleDetails)


    // Login
    LoginPage.toVisit('/safety')
    LoginPage.doUserLogin(username, password)
    Verify.textPresent.isVisible(prosightSafety.moduleBtnsText.staffTypePage)
    Click.on(hamburgerBtn)
    Verify.textPresent.isVisible(username)
    HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)

    // Navigate to alerts
    HelperFunction.navigateToModule(button, smartAlertManagement)
    Click.onButtonByFindingInnerText(mobileSecondarySideNav, innerButton, alertsRegex)
    Verify.theUrl().includes(alerts)

    // Clean alerts and trigger
    SmartAlertsUsingAPI.deleteAllAlerts(staffName)

    //Trigger all non-emergency alert types
    Safety.triggerStaffAlerts(staffName, staffTagOffline)
    HelperFunction.updateBatteryPercentageForTagOrSensor(deviceId, batteryStatus, tag)
  })

  it(`Verify all non-emergency alert types`, () => {
    verifyAlertFlow(tagLowBattery, {
      staffName,
      alertType: tagLowBattery,
      staffType,
      staffId,
      departmentName,
      floorName,
      locationName,
    })

    verifyAlertFlow(staffTagOffline, {
      staffName,
      alertType: staffTagOffline,
      staffType,
      staffId,
      departmentName,
      floorName,
      locationName,
    }, clearButton)

    Safety.triggerStaffAlerts(staffName, staffEmergency)
    smartLocation.notRespondingStaffEmergencyAlert(staffDetails, carousel, staffEmergency)
    cy.wait(2000) //for carousel to disapper
    Safety.removeStaffEmergencyAlertCarousel()
    smartLocation.respondingStaffEmergencyAlert(staffDetails, mobile, staffEmergency, reponseComment)
    // Verify.theToast.showsToastMessage(messageAfterRespondingToStaffEmergencyAlert)
    smartLocation.standDownAlert('All ok', staffDetails, mobile, staffEmergency, reponseComment)
    Verify.theToast.showsToastMessage(messageAfterAlertIsResolved)

  })

  after('Cleanup test data', () => {
    HelperFunction.globalIntercept()

    // Remove alerts and rules
    SmartAlertsUsingAPI.deleteAllAlerts(staffName)
    SmartAlertsUsingAPI.deleteAllAlerts(alertData.staffDetails2.staffName)

    HelperFunction.unlinkTag_Sensor_API(staffName, staff)
    HelperFunction.deleteItem_API(deviceId, tag)
    HelperFunction.deleteItem_API(staffName, staff)
    HelperFunction.deleteEquipment_Asset_StaffType_API(staffType, staff)

    // Remove hierarchy
    FloorPlanManagement.deleteRoomType_API(alertData.roomDetails.roomTypeName)
    FloorPlanManagement.deleteDepartment_API(departmentName)
    FloorPlanManagement.deleteFloor_API(floorName, hospitalName)

    SmartAlertsUsingAPI.deleteTimer()
    Safety.removeStaffEmergencyAlertCarousel()
  })
})
