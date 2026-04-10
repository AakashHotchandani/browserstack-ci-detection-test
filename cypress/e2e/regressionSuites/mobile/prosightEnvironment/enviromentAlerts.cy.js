import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import SmartAlertsUsingAPI from '../../../../pageObjects/prosightCore/triggeringAlerts'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import loginData from '../../../../fixtures/SignIn/user.json'
import { Verify } from '../../../../utils/assertions'
import prosightSmartAlertConst from '../../../../utils/constants/prosightEnvironment/smartAlerts'
import Click from '../../../../utils/Interactions/click'
import globalSels from '../../../../utils/selectors/globalSels'
import smartAlertConst from '../../../../utils/constants/smartAlertsManagementConst'
import DeviceManagement from '../../../../pageObjects/prosightCore/deviceManagement'
import EquipmentManagement from '../../../../pageObjects/prosightEnvironment/equipmentManagementFns'
import IEM_SmartAlerts from '../../../../pageObjects/prosightEnvironment/smartAlerts'
import globalConst from '../../../../utils/constants/globalConst'
import prosightEnvironmentConst from '../../../../utils/constants/prosightEnvironment/equipmentAssignmentConst'
import FloorPlanManagement from '../../../../pageObjects/prosightCore/floorPlanManagementFns'
import equipmentAlertData from '../../../../fixtures/prosightEnvironment/equipmentAlertData_Mobile.json'
import AccountSettings from '../../../../pageObjects/prosightAssets/accountSettings'
import prosightEnvSelectors from '../../../../utils/selectors/prosightEnvironment'

const { username, password, name } = loginData
const { sensorId } = equipmentAlertData.sensorDetails
const { equipmentName, type, id, floorName, locationName, departmentName } = equipmentAlertData.equipmentDetails
const { equipment, sensor } = leverageConstants.objectTypes
const { urlDataVerification, smartAlerts } = prosightSmartAlertConst
const {
  button,
  mobileSecondarySideNav,
  cardView,
  detailsIcon,
  headerCard,
  hamburgerBtn,
  viewport,
  innerButton,
  incidentContainer,
  clearAllButtonMobile,
} = globalSels
const { alertText, acknowledge, createTask, editTask, completeTask, tasks, clearButton, escalate } = smartAlertConst.buttonsInnerText
const {
  messageAfterAlertAcknowledge,
  messageAfterTaskCreated,
  messageAfterTaskCompletion,
  messageAfterTaskEdition,
  messageAfterAlertClear,
  escalateAlert,
} = smartAlertConst.toastMessages
const { noAlerts, noTasks } = smartAlertConst.uiText
const { environment } = leverageConstants.application
const { hospitalName, buildingName } = globalConst.hospitalAndBuilding
const { equipmentType } = prosightEnvironmentConst.uiText
const { taskDescription, updateTaskDescription } = smartAlertConst.taskDescription
const {
  equipmentDetails,
  sensorDetails,
  locationDetails,
  floorDetails,
  roomDetails,
  departmentBoundaryName,
  temperatureAndHumidityDetailsForRuleCreation,
  temperatureOutOfRangeAlertData,
  temperatureWarningAlertData,
  humidityOutOfRangeAlertData,
} = equipmentAlertData
const { alertDetailsPage, carousel } = smartAlertConst.actionPlace
const { temperatureOutOfRange, temperatureWarning, humidityOutOfRange } = equipmentAlertData.environmentalAlerts.temperatureAlerts
const {
  sensorLowBattery,
  sensorOffline,
  inspectionOverdue,
  equipmentRentalDue,
  calibrationDueIn10Days,
  calibrationDueIn30Days,
  calibrationDueIn5Days,
  calibrationDueIn60Days,
} = equipmentAlertData.environmentalAlerts.sensorAndEquipmentAlerts
const { acknowledgeDescription, escalateOptions, escalatedTxt } = smartAlertConst
const { floors, departments, room } = leverageConstants.objectTypes
let verificatiOnDetailsonAlerts = {
  equipmentName,
  type,
  id,
  floorName,
  departmentName,
  locationName,
}
let verificationDetailsOnTasks = {
  equipmentName,
  type,
  id,
}
const { carouselMinimizeIcon } = prosightEnvSelectors.smartAlerts

// Handles extra spaces around alert text in UI.
const alertsRegex = new RegExp(`^\\s*${alertText}\\s*$`)
// Handle extra spaces around tasks text in UI
const tasksRegex = new RegExp(`^\\s*${tasks}\\s*$`)

const performOperationInAlertsPage = (alertType, verificationData, actionType, view = alertDetailsPage) => {
  //search the alert, select and verify the data
  HelperFunction.search(equipmentName, false)

  // Select the alert type from the filter dropdown
  IEM_SmartAlerts.selectAlertTypeFromFilter(alertType, viewport.mobile)

  HelperFunction.getRowByItemName(equipmentName, cardView, equipment).as('alertRow')
  HelperFunction.verifyValuesInTheCardView('@alertRow', verificationData)

  //Click on alert details Icon
  Click.onButton('@alertRow', detailsIcon)
  HelperFunction.verifyValuesInTheCardView(headerCard, { ...verificationData, [sensorId]: sensorId })

  // Perform action based on the actionType value and verify the toast message
  if (actionType === acknowledge) {
    HelperFunction.performAlertActionsOnAlertDescriptionInMobile(acknowledge, smartAlertConst.acknowledgeDescription, environment)
    Verify.theToast.showsToastMessage(messageAfterAlertAcknowledge)
  } else if (actionType === clearButton) {
    HelperFunction.performAlertActionsOnAlertDescriptionInMobile(clearButton, undefined, environment)
    Verify.theToast.showsToastMessage(messageAfterAlertClear)
  } else if (actionType === escalate) {
    if (view === alertDetailsPage) HelperFunction.escalateAlertInMobile(equipmentDetails, alertDetailsPage, escalateOptions.option1, equipment)
    else HelperFunction.escalateAlertInMobile(equipmentDetails, carousel, escalateOptions.option1, equipment)
  }

  // Clear all applied filters
  Click.forcefullyOn(clearAllButtonMobile)
}

const performOperationInTasksPage = (alertType, verificationData, actionType) => {
  //search the alert, select and verify the data
  HelperFunction.search(equipmentName, false)

  // Select the alert type from the filter dropdown
  IEM_SmartAlerts.selectAlertTypeFromFilter(alertType, viewport.mobile)

  HelperFunction.getRowByItemName(equipmentName, cardView, equipment).as('alertRow')
  HelperFunction.verifyValuesInTheCardView('@alertRow', verificationData)

  // Perform action based on the actionType value and verify the toast message
  if (actionType === createTask) {
    HelperFunction.performAlertActionsOnAlertDescriptionInMobile(createTask, taskDescription, environment)
    Verify.theToast.showsToastMessage(messageAfterTaskCreated)
  } else if (actionType === editTask) {
    HelperFunction.editOrCompleteTaskInMobile(equipmentName, editTask, updateTaskDescription)
    Verify.theToast.showsToastMessage(messageAfterTaskEdition)
  } else if (actionType === completeTask) {
    HelperFunction.editOrCompleteTaskInMobile(equipmentName, completeTask)
    Verify.theToast.showsToastMessage(messageAfterTaskCompletion)
  }

  // Clear all applied filters
  Click.forcefullyOn(clearAllButtonMobile)
}

//Deleting the test data before running the scripts
before('Test data deletion', () => {
  //Deleting all the alerts
  SmartAlertsUsingAPI.deleteAllAlerts(equipmentName)

  //Unlinking sensor from an equipment
  HelperFunction.unlinkTag_Sensor_API(equipmentName, equipment)

  //Deleting an equipment type
  HelperFunction.deleteEquipment_Asset_StaffType_API(type, equipment)

  //Deleting a Sensor
  HelperFunction.deleteItem_API(sensorId, sensor)

  //Deleting an equipment
  HelperFunction.deleteItem_API(equipmentName, equipment)

  //Deleting all the timers
  SmartAlertsUsingAPI.deleteTimer()

  //Delete Room type
  FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)

  //Delete department
  FloorPlanManagement.deleteDepartment_API(equipmentDetails.departmentName)

  //Delete Floor
  FloorPlanManagement.deleteFloor_API(equipmentDetails.floorName, hospitalName)

  //remove the alert carousels
  IEM_SmartAlerts.removeEnvironmentAlertCarousel()
})

describe('Tiggering environment alert and performing operations on alerts', { viewportHeight: 667, viewportWidth: 375 }, () => {
  beforeEach('Setup session and navigate Alerts Module', () => {
    cy.session('login-session', () => {
      HelperFunction.globalIntercept()
      LoginPage.toVisit('/environment/')
      LoginPage.doUserLogin(username, password)
      Verify.theUrl().includes(urlDataVerification.smartMonitoring)
      Verify.textPresent.isVisible(equipmentType)
      //After Login Verify the user name
      Click.on(hamburgerBtn)
      Verify.textPresent.isVisible(name)

      //Select tha Hospital and  building
      HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)
    })

    HelperFunction.globalIntercept()
    LoginPage.toVisit('/environment/')
    Click.on(hamburgerBtn)
    HelperFunction.navigateToModule(button, smartAlerts)
    Click.onButtonByFindingInnerText(mobileSecondarySideNav, innerButton, alertsRegex)
    Verify.theUrl().includes(alertText)
  })

  before('Creating Sensor , equipment type , equipment and then linking created sensor to an equipment', () => {
    //Create Department
    FloorPlanManagement.createDepartment_API(departmentName, buildingName)
    //Create Room type
    FloorPlanManagement.createRoomType_API(roomDetails)
    //Create floor and room
    FloorPlanManagement.createFloor_API(floorDetails, locationDetails, hospitalName, buildingName, departmentName)
    //create department boundaries
    FloorPlanManagement.createDepartmentBoundary_API(departmentBoundaryName, departmentName, floorDetails.floorName)
    //Creating sensor
    DeviceManagement.createSensor_API(sensorDetails)
    //creating an equipment type
    HelperFunction.createEquipment_Asset_StaffType_API(type, equipment)
    //creating an equipment
    EquipmentManagement.createEquipment_API(equipmentDetails)
    //Linking above created equipment with the sensor
    HelperFunction.linkSensor_Tag_API(equipmentName, equipment, sensorId)
    //Creating Environment Rule
    IEM_SmartAlerts.createEnvironmentRule(equipmentName, temperatureAndHumidityDetailsForRuleCreation)
    //Search for the floor by name using the API and update the floorId in equipmentAlertData
    HelperFunction.search_API(floorName, floors).then(({ authToken, Id }) => {
      equipmentAlertData.equipmentDetails.floorId = Id
    })
    // Search for the department by name using the API and update the departmentID in equipmentAlertData
    HelperFunction.search_API(departmentName, departments).then(({ authToken, Id }) => {
      equipmentAlertData.equipmentDetails.departmentID = Id
    })
    // Search for the location/room by name using the API and update the locationId in equipmentAlertData
    HelperFunction.search_API(locationName, room).then(({ authToken, Id }) => {
      equipmentAlertData.equipmentDetails.locationId = Id
    })
    // Trigger the alerts
    return IEM_SmartAlerts.fetchDeviceIdByEquipmentName(equipmentName).then((response) => {
      const { deviceId } = response
      const deIvD = deviceId
      Object.values(equipmentAlertData.environmentalAlerts.sensorAndEquipmentAlerts).forEach((sensorAlerts) => {
        IEM_SmartAlerts.TriggerAlerts(equipmentDetails, sensorAlerts, sensorId, deIvD)
      })
    })
  })

  it('Perform the Acknowledge, Create Task and Clear operations on Alerts page', () => {
    // // Update the alert subscription settings to enable all options and get the alert carousel
    // AccountSettings.selectAlltheOptionsInAlertSubs_IEM(loginData)
    // cy.reload()

    // // Escalate "temporature out of range" alert from carousel
    // IEM_SmartAlerts.updateTemperatureForSensor(sensorId, temperatureOutOfRangeAlertData)
    // performOperationInAlertsPage(
    //   temperatureOutOfRange,
    //   { ...verificatiOnDetailsonAlerts, [temperatureOutOfRange]: temperatureOutOfRange },
    //   escalate,
    //   carousel
    // )

    // // Minimize the temparature/humidity alerts popup/carousel
    // cy.get(carouselMinimizeIcon).then(($icon) => {
    //   if ($icon.length > 0) {
    //     cy.wrap($icon).click()
    //   }
    // })

    // // Escalate "Humididty out of range" alert from alert details page
    // IEM_SmartAlerts.updateTemperatureForSensor(sensorId, humidityOutOfRangeAlertData)
    // performOperationInAlertsPage(humidityOutOfRange, { ...verificatiOnDetailsonAlerts, [humidityOutOfRange]: humidityOutOfRange }, escalate)

    // Acknowledge "Sensor Low Battery" alert
    performOperationInAlertsPage(sensorLowBattery, { ...verificatiOnDetailsonAlerts, [sensorLowBattery]: sensorLowBattery }, acknowledge)

    // Create task for "Inspection Overdue" alert
    performOperationInAlertsPage(inspectionOverdue, { ...verificatiOnDetailsonAlerts, [inspectionOverdue]: inspectionOverdue }, createTask)

    // Create task for "Equipment Rental Due" alert
    performOperationInAlertsPage(equipmentRentalDue, { ...verificatiOnDetailsonAlerts, [equipmentRentalDue]: equipmentRentalDue }, createTask)

    // Clear the "Calibration Due in 5 Days" alert
    performOperationInAlertsPage(
      calibrationDueIn5Days,
      { ...verificatiOnDetailsonAlerts, [calibrationDueIn5Days]: calibrationDueIn5Days },
      clearButton
    )
  })

  it('Perform the Edit and Complete Task operations on Tasks page', () => {
    // Navigate to the Tasks page
    HelperFunction.navigateToModule(button, tasksRegex)

    // Edit the task created for "Inspection Overdue" alert
    performOperationInTasksPage(inspectionOverdue, { ...verificationDetailsOnTasks, [inspectionOverdue]: inspectionOverdue }, editTask)

    // Complete task for "Equipment Rental Due" from table view
    performOperationInTasksPage(equipmentRentalDue, { ...verificationDetailsOnTasks, [equipmentRentalDue]: equipmentRentalDue }, completeTask)
  })

  after('Delete the test data', () => {
    //Unlinking sensor from an equipment
    HelperFunction.unlinkTag_Sensor_API(equipmentName, equipment)

    //Deleting an equipment type
    HelperFunction.deleteEquipment_Asset_StaffType_API(type, equipment)

    //Deleting a Sensor
    HelperFunction.deleteItem_API(sensorId, sensor)

    //Deleting an equipment
    HelperFunction.deleteItem_API(equipmentName, equipment)

    //Deleting all the alerts
    SmartAlertsUsingAPI.deleteAllAlerts(equipmentName)

    //Delete Room type
    FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)

    //Delete department
    FloorPlanManagement.deleteDepartment_API(equipmentDetails.departmentName)

    //Delete Floor
    FloorPlanManagement.deleteFloor_API(equipmentDetails.floorName, hospitalName)

    //Deleting all the timers
    SmartAlertsUsingAPI.deleteTimer()

    //remove the alert carousels(
    IEM_SmartAlerts.removeEnvironmentAlertCarousel()
  })
})
