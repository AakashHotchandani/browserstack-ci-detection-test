/// <reference types="cypress" />
import SmartAlertsUsingAPI from '../../../../pageObjects/prosightCore/triggeringAlerts'
import Asset_API from '../../../../pageObjects/prosightAssets/assetSmartAlerts'
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import { Verify } from '../../../../utils/assertions'
import userData from '../../../../fixtures/SignIn/user.json'
import assetDataforAssetAlerts_mobile from '../../../../fixtures/prosightAssets/assetDataforAssetAlerts_mobile.json'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import globalSels from '../../../../utils/selectors/globalSels'
import Click from '../../../../utils/Interactions/click'
import prosightSelectors from '../../../../utils/selectors/prosightAssets'
import smartAlertConst from '../../../../utils/constants/smartAlertsManagementConst'
import globalConst from '../../../../utils/constants/globalConst'
import FloorPlanManagement from '../../../../pageObjects/prosightCore/floorPlanManagementFns'
import Safety_API from '../../../../pageObjects/prosightSafety/safetySmartAlerts'
const { username, password, name } = userData
const { assetName, assetType, assetId, deviceId } = assetDataforAssetAlerts_mobile.assetDetails
const { departmentBoundaryName, departmentName, hospitalName, buildingName, roomDetails, locationName, locationDetails, floorDetails } =
  assetDataforAssetAlerts_mobile
const { asset, tag } = leverageConstants.objectTypes
const { button, cardView, hamburgerBtn } = globalSels
const { alerts } = smartAlertConst.urlText
const { pageNavigationButton, alertDetailsIcon, alertDetailsContainer } = prosightSelectors.smartAlerts
const { smartAlerts } = smartAlertConst
const { noAlerts, noTasks } = smartAlertConst.uiText
const { messageAfterAlertAcknowledge, messageAfterAlertClear, messageAfterTaskCreated, messageAfterTaskCompletion, messageAfterTaskEdition } =
  smartAlertConst.toastMessages
const { iap } = smartAlertConst.module
const { alertText, acknowledge, clearButton, createTask, editTask, completeTask, tasks } = smartAlertConst.buttonsInnerText
const { assetTypes } = smartAlertConst.tableColumnHeaders
const { mobile } = globalSels.viewport
const { updateTaskDescription, taskDescription } = smartAlertConst.taskDescription
let alertDetailsInAlertPage, taskDetails, editTaskDetails

let alertDetails = {
  assetName,
  assetType,
}
const { userProfileBtn } = globalSels.profileSection
const { shrinkage, rentalDue, maintenanceDue, tagOffline, underPar, stockedOut, criticallyUnderPAR } =
  assetDataforAssetAlerts_mobile.assetAlertTypes.assetAlerts
// REMOVE tagLowBattery from all alerts
const { tagLowBattery, ...allAlerts } = assetDataforAssetAlerts_mobile.assetAlertTypes.assetAlerts;
const { batteryStatus } = assetDataforAssetAlerts_mobile.assetAlertTypes
const { smartLocation } = smartAlertConst.urlText
const { smartAlertManagement } = smartAlertConst.buttonsInnerText

// Handles extra spaces around alert text in UI.
const regex = new RegExp(`^\\s*${alertText}\\s*$`)
// Handles extra spaces around tasks text in UI.
const taskRegex = new RegExp(`^\\s*${tasks}\\s*$`)

const verifyAlertFlow = (assetName, alertType) => {
  // select the alert type from filters
  //There is a bug that needs to be fixed.

  HelperFunction.search(assetName, false)
  Asset_API.selectAlertTypeFromFilter(alertType, mobile)

  // Searching and verifying the alert details

  HelperFunction.getRowByItemName(assetName, cardView, iap).as('alertRow')
  alertDetails = { ...alertDetails, alertType }
  HelperFunction.verifyValuesInTheCardView('@alertRow', alertDetails)
  Click.onButton('@alertRow', alertDetailsIcon)

  if (alertType === stockedOut || alertType === criticallyUnderPAR || alertType === underPar) {
    alertDetailsInAlertPage = { assetName, alertType }
  } else {
    alertDetailsInAlertPage = { ...alertDetails, alertType, assetId, deviceId }
  }
  //Verifying alert details in alert page
  HelperFunction.verifyValuesInTheCardView(alertDetailsContainer, alertDetailsInAlertPage)

  //Acknowledge the alert
  HelperFunction.performAlertActionsOnAlertDescriptionInMobile(acknowledge, undefined, asset)

  // Verify the acknowledgment toast message
  Verify.theToast.showsToastMessage(messageAfterAlertAcknowledge)

  // Search and verify no alerts text is present
  HelperFunction.search(assetName, false)
  Verify.textPresent.isVisible(noAlerts)
}
const veifyTaskFlow = (assetName, alertType) => {
  // Searching and verifying the alert details
  HelperFunction.search(assetName, false)
  Asset_API.selectAlertTypeFromFilter(alertType, mobile)
  HelperFunction.getRowByItemName(assetName, cardView, iap).as('alertRow')
  alertDetails = { ...alertDetails, alertType }
  HelperFunction.verifyValuesInTheCardView('@alertRow', alertDetails)
  Click.onButton('@alertRow', alertDetailsIcon)

  //Verifying alert details in alert page
  if (alertType === stockedOut || alertType === criticallyUnderPAR || alertType === underPar) {
    alertDetailsInAlertPage = { assetName, alertType }
  } else {
    alertDetailsInAlertPage = { ...alertDetails, alertType, assetId, deviceId }
  }
  HelperFunction.verifyValuesInTheCardView(alertDetailsContainer, alertDetailsInAlertPage)

  // Create a task
  HelperFunction.performAlertActionsOnAlertDescriptionInMobile(createTask, taskDescription, asset)

  Verify.theToast.showsToastMessage(messageAfterTaskCreated)

  // Navigate to the Tasks page
  Click.on(hamburgerBtn)
  Click.onButtonByInnerText(pageNavigationButton, taskRegex)

  // Search and verify the created task
  HelperFunction.search(assetName, false)

  if (alertType === stockedOut || alertType === criticallyUnderPAR || alertType === underPar) {
    taskDetails = { assetName, alertType }
  } else {
    taskDetails = { ...alertDetails, alertType, taskDescription }
  }
  HelperFunction.verifyValuesInTheCardView('@alertRow', taskDetails)

  // Edit the task
  HelperFunction.editOrCompleteTaskInMobile(assetName, editTask, updateTaskDescription)

  // Verify the edited task toast message
  Verify.theToast.showsToastMessage(messageAfterTaskEdition)

  // Verify the edited task details
  if (alertType === stockedOut || alertType === criticallyUnderPAR || alertType === underPar) {
    editTaskDetails = { assetName, alertType, updateTaskDescription }
  } else {
    editTaskDetails = { ...alertDetails, alertType, updateTaskDescription }
  }
  HelperFunction.verifyValuesInTheCardView(alertDetailsContainer, editTaskDetails)

  // Complete the task
  HelperFunction.editOrCompleteTaskInMobile(assetName, completeTask)

  // Verify the task completion toast message
  Verify.theToast.showsToastMessage(messageAfterTaskCompletion)
  HelperFunction.search(assetName, false)

  //verify no alerts text is present
  Verify.textPresent.isVisible(noTasks)
}
const verifyClearFlow = (assetName, alertType) => {
  // select the alert type from filters
  //There is a bug that needs to be fixed.

  // Searching and verifying the alert details
  HelperFunction.search(assetName, false)
  Asset_API.selectAlertTypeFromFilter(alertType, mobile)
  HelperFunction.getRowByItemName(assetName, cardView, iap).as('alertRow')
  alertDetails = { ...alertDetails, alertType }
  HelperFunction.verifyValuesInTheCardView('@alertRow', alertDetails)
  Click.onButton('@alertRow', alertDetailsIcon)

  //Verifying alert details in alert page
  if (alertType === stockedOut || alertType === criticallyUnderPAR || alertType === underPar) {
    alertDetailsInAlertPage = { ...alertDetails, alertType }
  } else {
    alertDetailsInAlertPage = { ...alertDetails, alertType, assetId, deviceId }
  }
  HelperFunction.verifyValuesInTheCardView(alertDetailsContainer, alertDetailsInAlertPage)

  //Clear alert
  HelperFunction.performAlertActionsOnAlertDescriptionInMobile(clearButton, undefined, iap)

  // Verify the clear alert toast message
  Verify.theToast.showsToastMessage(messageAfterAlertClear)

  // Search and verify no alerts text is present
  HelperFunction.search(assetName, false)
  Verify.textPresent.isVisible(noAlerts)
}
before('Deleting created asset and staff and deleting the timer', () => {
  // Deleting Existing Alerts
  SmartAlertsUsingAPI.deleteAllAlerts(assetName)

  //Deleting all the alerts
  SmartAlertsUsingAPI.deleteTimer()

  //Unlinking the asset with tag
  HelperFunction.unlinkTag_Sensor_API(assetName, asset)

  //Deleting staff type
  HelperFunction.deleteEquipment_Asset_StaffType_API(assetType, asset)

  //Deleting Tag
  HelperFunction.deleteItem_API(deviceId, tag)

  //Deleting asset
  HelperFunction.deleteItem_API(assetName, asset)

  //Delete Room type
  FloorPlanManagement.deleteRoomType_API(assetDataforAssetAlerts_mobile.roomDetails.roomTypeName)

  //Delete department
  FloorPlanManagement.deleteDepartment_API(departmentName)

  //Delete Floor
  FloorPlanManagement.deleteFloor_API(floorDetails.floorName, hospitalName)

  //Create Department
  FloorPlanManagement.createDepartment_API(departmentName, buildingName)

  //Create Room type
  FloorPlanManagement.createRoomType_API(roomDetails)

  //Create floor and room
  FloorPlanManagement.createFloor_API(floorDetails, locationDetails, hospitalName, buildingName, departmentName)

  //create department boundaries
  FloorPlanManagement.createDepartmentBoundary_API(departmentBoundaryName, departmentName, floorDetails.floorName)

  //Creating Asset Tag
  SmartAlertsUsingAPI.createTags(assetDataforAssetAlerts_mobile.assetTagDetails)

  //Create asset type
  HelperFunction.createEquipment_Asset_StaffType_API(assetType, asset)

  //Create asset
  Asset_API.createAsset(assetDataforAssetAlerts_mobile.assetDetails)

  //Linking asset with the tag
  HelperFunction.linkSensor_Tag_API(assetName, asset, deviceId)
  /*****************************Assigning the Test Data ID's through Search API ***********/
  HelperFunction.search_API(floorDetails.floorName, leverageConstants.objectTypes.floors).then(({ authToken, Id }) => {
    assetDataforAssetAlerts_mobile.assetDetails.floorID = Id
  })
  HelperFunction.search_API(departmentName, leverageConstants.objectTypes.departments).then(({ authToken, Id }) => {
    assetDataforAssetAlerts_mobile.departmentID = Id
  })
  HelperFunction.search_API(locationName, leverageConstants.objectTypes.room).then(({ authToken, Id }) => {
    assetDataforAssetAlerts_mobile.locationID = Id
  })
  HelperFunction.updateBatteryPercentageForTagOrSensor(deviceId, batteryStatus, tag)
  return Asset_API.toGetDeviceDetails(assetDataforAssetAlerts_mobile.assetDetails).then(({ deviceId, hardwareExternalId }) => {
    Object.values(allAlerts).forEach((alertType) => {
      Asset_API.triggerAssetAlerts(assetDataforAssetAlerts_mobile.assetDetails, alertType, deviceId, hardwareExternalId)
    })
  })
})
after('Deleting created asset and staff and deleting the timer', () => {
  // Deleting Existing Alerts
  SmartAlertsUsingAPI.deleteAllAlerts(assetName)

  //Unlinking the asset with tag
  HelperFunction.unlinkTag_Sensor_API(assetName, asset)

  //Deleting staff type
  HelperFunction.deleteEquipment_Asset_StaffType_API(assetType, asset)

  //Deleting Tag
  HelperFunction.deleteItem_API(deviceId, tag)

  //Deleting asset
  HelperFunction.deleteItem_API(assetName, asset)

  //Delete Room type
  FloorPlanManagement.deleteRoomType_API(assetDataforAssetAlerts_mobile.roomDetails.roomTypeName)

  //Delete department
  FloorPlanManagement.deleteDepartment_API(departmentName)

  //Delete Floor
  FloorPlanManagement.deleteFloor_API(floorDetails.floorName, hospitalName)

  //Deleting all the alerts
  SmartAlertsUsingAPI.deleteTimer()
})
describe(`Triggering  alerts and verifying in alerts tasks and events page`, { viewportHeight: 667, viewportWidth: 375 }, () => {
  beforeEach('Deleting Existing Alerts and Navigate to Smart Alerts module', () => {
    HelperFunction.globalIntercept()
    cy.session('login-session', () => {
      HelperFunction.globalIntercept()
      LoginPage.toVisit('/assets/')
      LoginPage.doUserLogin(username, password)
      Verify.theUrl().includes(smartLocation)
    })

    LoginPage.toVisit('/asset')
    Verify.textPresent.isVisible(assetTypes)
    Click.on(hamburgerBtn)

    //Verify the user name
    Verify.textPresent.isVisible(username)

    //Select tha Hospital and Building
    HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)

    // Navigating to the alerts page
    HelperFunction.navigateToModule(button, smartAlerts)

    // Clicking the Alerts button
    Click.onButtonByInnerText(pageNavigationButton, regex)

    //Verifying the URL
    Verify.theUrl().includes(alerts)
  })

  it(`Trigger alert, verify alert, and acknowledge alert`, () => {
    verifyAlertFlow(assetName, underPar)
    // verifyAlertFlow(assetName, rentalDue)
  })

  it(`Trigger  alert, create task, edit task, and complete task`, () => {
    veifyTaskFlow(assetName, tagLowBattery)
    // Click.on(hamburgerBtn)
    // HelperFunction.navigateToModule(button, smartAlerts)
    // Click.onContainText('Alerts')
    // Verify.theUrl().includes(alerts)
    // veifyTaskFlow(assetName, stockedOut)
  })

  it(`Trigger  alert, verify alert, and clear alert`, () => {
    verifyClearFlow(assetName, maintenanceDue)
    // verifyClearFlow(assetName, tagOffline)
  })
})
