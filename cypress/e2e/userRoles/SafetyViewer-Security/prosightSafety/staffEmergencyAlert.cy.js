/// <reference types="cypress" />
import SmartAlertsUsingAPI from '../../../../pageObjects/prosightCore/triggeringAlerts'
import Safety from '../../../../pageObjects/prosightSafety/safetySmartAlerts'
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import { Verify } from '../../../../utils/assertions'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import globalSels from '../../../../utils/selectors/globalSels'
import SmartLocation from '../../../../pageObjects/prosightSafety/smartLocation'
import alertData from '../../../../fixtures/leverage/dataForTriggeringAlerts.json'
import userData from '../../../../fixtures/userRoles/userCred.json'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import Moderation_Logic from '../../../../pageObjects/prosightSafety/moderationLogic'
import constants from '../../../../utils/constants/smartAlertsManagementConst'
import data from '../../../../fixtures/SignIn/twilioCredentials.json'
import globalConst from '../../../../utils/constants/globalConst'
import EmailTemplateManager from '../../../../pageObjects/emailTemplateManager '
import settings from '../../../../fixtures/applicationSettings.json'
import SmsTemplateManager from '../../../../pageObjects/smsTemplateManager'
const { assetSettings, safetySettings, adminSettings, environmentSettings } = settings.enableSettingsOnSafety
const { disableAdminSettings, disableAssetSettings, disableEnvironmentSettings, disableSafetySettings } = settings.disableAllTheSettings
const { safety } = globalConst.application
const { username, password } = userData
const { staffEmergency,staffEmergencyText } = alertData.staffAlertTypes.emergencyAlert
const { staff, tag } = leverageConstants.objectTypes
const { messageAfterAlertAcknowledge, messageAfterEventUnacknowledge, escalateAlert } = constants.toastMessages
const { sidePanel, tableView, carousel } = constants.actionPlace
const { smartAlertManagement, events } = constants.buttonsInnerText
const { event, alerts } = constants.urlText
const { staffDetails, staffTagDetails, deviceId } = alertData
const { staffName, staffType, staffId } = alertData.staffDetails
const { commentForAcknowledge } = constants.comments
const { button } = globalSels
const { option1 } = constants.escalateOptions
//Triggering Staff Emergency Alert and performing functionality on the triggered alert
describe('Triggering Staff emergency alert and performing functionality on the triggered alert', () => {
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

  beforeEach('Deleting Existing Alerts and Navigate to safety module ', () => {
    //Delete Emergency alerts
    SmartAlertsUsingAPI.deleteAllAlerts(staffName)

    //Remove the alert carousel
    Safety.removeStaffEmergencyAlertCarousel()

    LoginPage.toVisit('/safety')
    LoginPage.doUserLogin(username, password)

    //Navigate to alerts page
    HelperFunction.navigateToModule(button, smartAlertManagement)
    Verify.theUrl().includes(alerts)
  })

  it('Trigger staff Emergency alert and perform Escalate functionality from the carousel', () => {
    Safety.triggerStaffAlerts(staffName, staffEmergency)

    //Escalate from carousel
    SmartLocation.escalateAlert(option1, staffDetails, carousel, staffEmergency,staffEmergencyText)
    Verify.theToast.showsToastMessage(escalateAlert)
  })

  it('Trigger staff Emergency alert and perform Escalate functionality from the side panel', () => {
    Safety.triggerStaffAlerts(staffName, staffEmergency)
    //Remove the alert carousel
    Safety.removeStaffEmergencyAlertCarousel()

    //Escalate from side panel
    SmartLocation.escalateAlert(option1, staffDetails, sidePanel,staffEmergencyText)
    Verify.theToast.showsToastMessage(escalateAlert)
  })

  it('Trigger staff Emergency alert and perform Escalate functionality from the table view', () => {
    HelperFunction.globalIntercept()
    Safety.triggerStaffAlerts(staffName, staffEmergency)
    //Remove the alert carousel
    Safety.removeStaffEmergencyAlertCarousel()

    //Escalate from table view
    SmartLocation.escalateAlert(option1, staffDetails, tableView, staffEmergency)
    Verify.theToast.showsToastMessage(escalateAlert)
  })

  after('Deleting created staff and deleting the timer', () => {
    //Remove the alert carousel
    Safety.removeStaffEmergencyAlertCarousel()

    //Deleting all alerts
    SmartAlertsUsingAPI.deleteAllAlerts(staffName)

    //Unlinking the staff with tag
    HelperFunction.unlinkTag_Sensor_API(staffName, staff)

    //Deleting staff type
    HelperFunction.deleteEquipment_Asset_StaffType_API(staffType, 'staff')

    //Deleting Tag
    HelperFunction.deleteItem_API(deviceId, tag)

    //Deleting staff
    HelperFunction.deleteItem_API(staffName, staff)

    //Deleting all created timers
    SmartAlertsUsingAPI.deleteTimer()
  })
})

