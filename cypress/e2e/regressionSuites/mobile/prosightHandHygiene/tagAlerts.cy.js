/// <reference types="cypress" />
import SmartAlertsUsingAPI from '../../../../pageObjects/prosightCore/triggeringAlerts'
import Safety from '../../../../pageObjects/prosightSafety/safetySmartAlerts'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import { Verify } from '../../../../utils/assertions'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import globalSels from '../../../../utils/selectors/globalSels'
import alertData from '../../../../fixtures/leverage/dataForTriggeringAlerts.json'
import userData from '../../../../fixtures/SignIn/user.json'
import constants from '../../../../utils/constants/smartAlertsManagementConst'
import prosightSelectors from '../../../../utils/selectors/prosightAssets'
import Click from '../../../../utils/Interactions/click'
import globalConst from '../../../../utils/constants/globalConst'
import userManagementConst from '../../../../utils/constants/prosightCore/userManagementConst'

const { smartCompliance } = constants.urlText
const { complianceStatus } = constants.tableColumnHeaders
const { smartComplianceBtn, alertText, acknowledge, createTask, tasks, editTask, completeTask, clearButton } = constants.buttonsInnerText
const { username, password } = userData
const { staffName, staffType, locationName, staffId, departmentName } = alertData.staffDetails
const { staff, tag } = leverageConstants.objectTypes
const { messageAfterAlertAcknowledge, messageAfterTaskCreated, messageAfterTaskEdition, messageAfterTaskCompletion, messageAfterAlertClear } =
  constants.toastMessages
const { alerts } = constants.urlText
const { noAlerts, noTasks } = constants.uiText
const { button, hamburgerBtn, cardView } = globalSels
const { mobile } = globalSels.viewport
const { staffDetails, staffTagDetails, deviceId } = alertData
const { smartAlerts } = constants
const { pageNavigationButton, alertDetailsIcon, alertDetailsContainer } = prosightSelectors.smartAlerts
const { accountSettingPageContainer } = globalSels.accountSettings
const { hospitalName, buildingName } = globalConst.hospitalAndBuilding
const { core } = userManagementConst.apps
const { updateTaskDescription, taskDescription } = constants.taskDescription
let alertDetailsInAlertPage, editTaskDetails
let alertDetails = {
  staffName,
  staffId,
  locationName,
  departmentName,
}
let taskDetails = {
  staffName,
  staffId,
  taskDescription,
}

const HHAlerts = (({ staffTagOffline, tagLowBattery5, tagLowBattery20 }) => [staffTagOffline, tagLowBattery5, tagLowBattery20])(
  alertData.staffAlertTypes.nonEmergencyAlert
)

// Handles extra spaces around alert text in UI.
const regex = new RegExp(`^\\s*${alertText}\\s*$`)
// Handles extra spaces around tasks text in UI.
const taskRegex = new RegExp(`^\\s*${tasks}\\s*$`)

Object.values(HHAlerts).forEach((alertType) => {
  describe('Triggering HH Tag Alerts and performing functionality on the triggered alert', { viewportHeight: 667, viewportWidth: 375 }, () => {
    beforeEach('Deleting Existing Alerts and Navigate to HH module ', () => {
      HelperFunction.globalIntercept()
      //Deleting Existing Alerts
      SmartAlertsUsingAPI.deleteAllAlerts(staffName)

      //Navigate to asset module
      LoginPage.toVisit('/compliance')
      LoginPage.doUserLogin(username, password)
      Verify.theUrl().includes(smartCompliance)
      Verify.textPresent.isVisible(complianceStatus)
      Click.on(hamburgerBtn)
      Click.onContainText(accountSettingPageContainer, smartComplianceBtn)

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

    before('Create tag and staff and linking it together', () => {
      HelperFunction.globalIntercept()
      //Creating Staff Tag
      SmartAlertsUsingAPI.createTags(staffTagDetails)

      //Create staff type
      HelperFunction.createEquipment_Asset_StaffType_API(staffType, staff)

      //Create Staff
      Safety.createStaff(staffDetails)

      //Linking staff with the tag
      HelperFunction.linkSensor_Tag_API(staffName, staff, deviceId)
    })

    it(`Trigger ${alertType} alert ,verify alert, and acknowledge alert `, () => {
      HelperFunction.globalIntercept()

      Safety.triggerStaffAlerts(staffName, alertType)

      //Applying alert Filter
      //There is a bug that needs to be fixed.
      //Safety.selectAlertTypeFromFilter(alertType, mobile)
      //cy.reload()

      // Searching and verifying the alert details
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName, cardView, core).as('alertRow')
      //There is bug, but it should verify asset type also
      alertDetails = { ...alertDetails, alertType }
      HelperFunction.verifyValuesInTheCardView('@alertRow', alertDetails)
      Click.onButton('@alertRow', alertDetailsIcon)

      //Verifying alert details in alert page
      //There is a bug, but it should verify the tag ID and Asset type here as well.
      alertDetailsInAlertPage = { ...alertDetails, alertType }
      HelperFunction.verifyValuesInTheCardView(alertDetailsContainer, alertDetails)

      //Acknowledge the alert
      HelperFunction.performAlertActionsOnAlertDescriptionInMobile(acknowledge, undefined, core)

      // Verify the acknowledgment toast message
      Verify.theToast.showsToastMessage(messageAfterAlertAcknowledge)

      // Search and verify no alerts text is present
      HelperFunction.search(staffName, false)
      Verify.textPresent.isVisible(noAlerts)
    })

    it(`Trigger  ${alertType}, create task, edit task, and complete task`, () => {
      HelperFunction.globalIntercept()

      Safety.triggerStaffAlerts(staffName, alertType)

      //Applying alert Filter
      //There is a bug that needs to be fixed.
      //Safety.selectAlertTypeFromFilter(alertType, mobile)
      //cy.reload()

      // Searching and verifying the alert details
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName, cardView, core).as('alertRow')
      //There is bug, but it should verify staff type also
      alertDetails = { ...alertDetails, alertType }
      HelperFunction.verifyValuesInTheCardView('@alertRow', alertDetails)
      Click.onButton('@alertRow', alertDetailsIcon)

      //Verifying alert details in alert page
      //There is a bug, but it should verify the tag ID and staff type here as well.
      alertDetailsInAlertPage = { ...alertDetails, alertType }
      HelperFunction.verifyValuesInTheCardView(alertDetailsContainer, alertDetails)

      // Create a task
      HelperFunction.performAlertActionsOnAlertDescriptionInMobile(createTask, taskDescription, core)

      Verify.theToast.showsToastMessage(messageAfterTaskCreated)

      // Navigate to the Tasks page
      Click.on(hamburgerBtn)
      Click.onButtonByInnerText(pageNavigationButton, taskRegex)

      // Search and verify the created task
      HelperFunction.search(staffName)

      //There is a bug, but it should verify staff type also
      taskDetails = { staffName, staffId, alertType }
      HelperFunction.verifyValuesInTheCardView('@alertRow', taskDetails)

      // Edit the task
      HelperFunction.editOrCompleteTaskInMobile(staffName, editTask, updateTaskDescription)

      // Verify the edited task toast message
      Verify.theToast.showsToastMessage(messageAfterTaskEdition)

      // Verify the edited task details
      //There is a bug, but it should verify staff type also
      editTaskDetails = { staffName, staffId, alertType, updateTaskDescription }
      HelperFunction.verifyValuesInTheCardView(alertDetailsContainer, editTaskDetails)

      // Complete the task
      HelperFunction.editOrCompleteTaskInMobile(staffName, completeTask)

      // Verify the task completion toast message
      Verify.theToast.showsToastMessage(messageAfterTaskCompletion)
      HelperFunction.search(staffName, false)

      //verify no alerts text is present
      Verify.textPresent.isVisible(noTasks)
    })

    it(`Trigger  ${alertType}, verify alert, and clear alert`, () => {
      //Login to Leverage architect  and trigger the alert
      Safety.triggerStaffAlerts(staffName, alertType)

      //Applying alert Filter
      //There is a bug that needs to be fixed.
      //Safety.selectAlertTypeFromFilter(alertType, mobile)
      //cy.reload()

      // Searching and verifying the alert details
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName, cardView, core).as('alertRow')
      //There is bug, but it should verify asset type also
      alertDetails = { ...alertDetails, alertType }
      HelperFunction.verifyValuesInTheCardView('@alertRow', alertDetails)
      Click.onButton('@alertRow', alertDetailsIcon)

      //Verifying alert details in alert page
      //There is a bug, but it should verify the tag Id and Asset type here as well.
      alertDetailsInAlertPage = { ...alertDetails, alertType }
      HelperFunction.verifyValuesInTheCardView(alertDetailsContainer, alertDetails)

      //Clear alert
      HelperFunction.performAlertActionsOnAlertDescriptionInMobile(clearButton, undefined, core)

      // Verify the clear alert toast message
      Verify.theToast.showsToastMessage(messageAfterAlertClear)

      // Search and verify no alerts text is present
      HelperFunction.search(staffName, false)
      Verify.textPresent.isVisible(noAlerts)
    })

    after('Deleting created staff and deleting the timer', () => {
      HelperFunction.globalIntercept()

      //Deleting all alerts
      SmartAlertsUsingAPI.deleteAllAlerts(staffName)

      //Unlinking the staff with tag
      HelperFunction.unlinkTag_Sensor_API(staffName, staff)

      //Deleting staff type
      HelperFunction.deleteEquipment_Asset_StaffType_API(staffType, staff)

      //Deleting Tag
      HelperFunction.deleteItem_API(deviceId, tag)

      //Deleting staff
      HelperFunction.deleteItem_API(staffName, staff)

      //Deleting all created timers
      SmartAlertsUsingAPI.deleteTimer()
    })
  })
})
