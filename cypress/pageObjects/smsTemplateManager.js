/// <reference types="cypress" />
import leverageConstants from '../utils/constants/Leverage/leverageConstants'
import globalConst from '../utils/constants/globalConst'
import alertData from '../fixtures/leverage/dataForTriggeringAlerts.json'
import APIEndpoints from '../../APIEndpoints'
import data from '../fixtures/prosightSafety/safetyAlertData.json'
const { assets, safety, environment, core } = globalConst.application
const { tagOffline, tagLowBattery20, tagLowBattery5 } = alertData.assetAlertTypes.tagAlerts
const { shrinkage, rentalDue, maintenanceDue } = alertData.assetAlertTypes.assetAlerts
const { underPar, criticallyUnderPAR, stockedOut } = alertData.assetAlertTypes.parAlerts
const { staffTagOffline} = data.staffAlertTypes.nonEmergencyAlert
const { staffEmergency } = data.staffAlertTypes.emergencyAlert
const { sensorLowBattery, sensorOffline, equipmentRentalDue, inspectionOverdue } = alertData.environmentalAlerts.sensorAndEquipmentAlerts
const { temperatureOutOfRange, temperatureWarning, humidityOutOfRange } = alertData.environmentalAlerts.temperatureAlerts
const { calibrationDueIn10Days, calibrationDueIn30Days, calibrationDueIn60Days, calibrationDueIn5Days } =
  alertData.environmentalAlerts.calibrationDueTypes
const hospitalId = Cypress.env('HospitalId')
const { twilioGetMessagesEndpoint } = APIEndpoints
/** This class consists of different static functions related with verifying alert sms with twilio server
 * @class SmsTemplateManager
 */
export default class SmsTemplateManager {
  /**
   *This function is used to verify messages from twilio
   * @param {Object} twilioDetails - Object that contains Twilio login details
   * @param {String} twilioDetails.twilioUsername - Username of twilio
   * @param {String} twilioDetails.twilioPassword - Password for twilio
   * @param {String} twilioDetails.phoneNumber - Phone number for twilio account
   * @param {String} alertType  - Type of alert for which sms needs to be verified
   * @param {Object} deviceDetails - Object that contains information about location and device
   * @param {String} deviceDetails.deviceId - Tag Id for which sms needs to be verified
   * @param {String} deviceDetails.assetName - Name of the asset for which sms needs to be verified
   * @param {String} deviceDetails.assetType - type of the asset for which sms needs to be verified
   * @param {String} deviceDetails.assetId - Id of the asset for which sms needs to be verified
   * @param {String} deviceDetails.buildingName - Name of the building for which sms needs to be verified
   * @param {String} deviceDetails.floorName - Name of the floor for which sms needs to be verified
   * @param {String} deviceDetails.locationName - Name of the room for which sms needs to be verified
   * @param {String} deviceDetails.staffName - Name of the staff for which sms needs to be verified
   * @param {String} deviceDetails.staffType - type of the staff for which sms needs to be verified
   * @param {String} deviceDetails.staffId - Id of the staff for which sms needs to be verified
   * @param {String} application - Name of the application where verification needs to be done
   */
  static verifySmsFromTwilio = (alertType, twilioDetails, deviceDetails, application) => {
    const { twilioUsername, twilioPassword, phoneNumber } = twilioDetails
    // Create a new Date object for the current date
    const currentDate = new Date()

    // Define months array for converting month index to month name
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Get day, month and year from currentDate
    const day = currentDate.getDate()
    const monthIndex = currentDate.getMonth() // Returns 0 for January, 1 for February, etc.
    const year = currentDate.getFullYear()

    // Format the day with leading zero if necessary
    const formattedDay = day.toString().padStart(2, '0')

    // Get the month name from the months array
    const monthName = months[monthIndex]

    // Construct the final formatted date string
    const date = `${formattedDay} ${monthName} ${year}`

    // Output the formatted date
    cy.log(date) // Example output: "07 Oct 2024" (for today's date)
    let deviceId, assetName, assetType, assetId, buildingName, floorName, locationName, equipmentName, id, type, staffName, staffType, staffId
    let filteredIds = []
    let smsId = [],
      filteredMessage,
      sms
    let summaryLine, deviceInfo, locationDetails
    if (application === assets) {
      ;({ deviceId, assetName, assetType, assetId, buildingName, floorName, locationName } = deviceDetails)
    }
    //Get the variables with the application is staff
    else if (application === safety) {
      ;({ deviceId, staffName, staffType, staffId, buildingName, floorName, locationName } = deviceDetails)
    }
    //Get the variables with the application is staff
    else if (application === environment) {
      ;({ deviceId, equipmentName, id, type, buildingName, floorName, locationName } = deviceDetails)
    }
    //Device name details for staff and asset
    const deviceName = assetName || staffName || equipmentName
    const deviceType = assetType || staffType || type
    const deviceSerialNumber = assetId || staffId || id

    //Getting device info fo safety application
    if (application === safety) {
      if (alertType === roomOvercapacity) {
        deviceInfo = ''
      } else {
        deviceInfo = `Staff Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
      }
    }
    //Getting device info fo asset application
    else if (application === assets) {
      deviceInfo = `Asset Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
    }
    //Getting device info fo environment application
    else if (application === environment) {
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
    }

    //Tag Low Battery Alerts
    if (alertType === tagLowBattery20 || alertType === tagLowBattery5) {
      summaryLine = `Tag ${deviceId} had a battery charge`
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName}`
    }

    //Tag Offline
    else if (alertType === tagOffline || alertType === staffTagOffline) {
      summaryLine = `Tag ${deviceId} went offline at`
      locationDetails = `Last Location: ${buildingName}, ${floorName}, ${locationName}`
    }

    //Asset Exited Building Alert
    else if (alertType === shrinkage) {
      summaryLine = `${deviceName} exited the building at`
      locationDetails = ''
    }

    //Rental Due Alert
    else if (alertType === rentalDue && application === assets) {
      summaryLine = `${deviceName} rental is due on`
      locationDetails = 'Location Details: ${buildingName}, ${floorName}, ${locationName}'
    }

    //Maintenance  Due Alert
    else if (alertType === maintenanceDue) {
      summaryLine = `${deviceName} is due for maintenance on`
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName}`
    }

    //Under PAR alerts
    else if (alertType === underPar) {
      summaryLine = `${deviceType}, ${locationName} was under PAR at`
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName}`
      deviceInfo = ''
    }

    //Stocked out alerts
    else if (alertType === stockedOut) {
      summaryLine = `${deviceType}, ${locationName} was Stocked Out at`
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName}`
      deviceInfo = ''
    }

    //Critically PAR alerts
    else if (alertType === criticallyUnderPAR) {
      summaryLine = `${deviceType}, ${locationName} was Critically Under PAR`
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName}`
      deviceInfo = ''
    }
    //Calibration Due Alerts
    else if (
      alertType === calibrationDueIn10Days ||
      alertType === calibrationDueIn5Days ||
      alertType === calibrationDueIn60Days ||
      alertType === calibrationDueIn30Days
    ) {
      summaryLine = `Calibration for ${deviceName} is due on`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName}`
    }

    //Staff Emergency alert
    else if (alertType === staffEmergency) {
      summaryLine = `${staffName} requested help`
      deviceInfo = `Staff Details : ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = `Location Details : ${buildingName}, ${floorName}, ${locationName} `
    }
    //Sensor Offline alert
    else if (alertType === sensorOffline) {
      summaryLine = `Sensor ${deviceId} went offline at`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType},${deviceSerialNumber}`
      locationDetails = `Location Details: ${buildingName},${floorName},${locationName} `
    }
    //Sensor Low battery alert
    else if (alertType === sensorLowBattery) {
      summaryLine = `Sensor ${deviceId} had a battery charge of`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName}`
    }
    //Equipment rental due alert
    else if (alertType === equipmentRentalDue && application === environment) {
      summaryLine = `${deviceName} rental is due on`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName}`
    }
    //Inspection overdue alert
    else if (alertType === inspectionOverdue && application === environment) {
      summaryLine = `${deviceName} ${deviceSerialNumber} was overdue for inspection at`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName}`
    }
    //Temperature out of range alert
    else if (alertType === temperatureOutOfRange) {
      summaryLine = `${deviceName} was out of the monitored temperature range at `
      deviceInfo = `Equipment Details : ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
      locationDetails = `Location Details : ${buildingName}, ${floorName}, ${locationName}`
    }
    //Temperature warning alert
    else if (alertType === temperatureWarning) {
      summaryLine = `${deviceName} was in a warning temperature range at `
      deviceInfo = `Equipment Details : ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
      locationDetails = `Location Details : ${buildingName}, ${floorName}, ${locationName}`
    }
    //Humidity out of range alert
    else if (alertType === humidityOutOfRange) {
      summaryLine = `${deviceName} was out of the monitored humidity range at `
      deviceInfo = `Equipment Details : ${deviceName}, ${deviceType}, ${deviceSerialNumber}`
      locationDetails = `Location Details : ${buildingName}, ${floorName}, ${locationName}`
    }

    cy.api({
      method: leverageConstants.requestMethod.get,
      failOnStatusCode: leverageConstants.failOnStatusCode,
      url: twilioGetMessagesEndpoint,
      qs: {
        to: `%2B1${phoneNumber}`,
      },
      auth: {
        username: twilioUsername,
        password: twilioPassword,
      },
    }).then((response) => {
      expect(response.body.messages).exist
      //Getting the response body
      const msg = response.body.messages
      cy.log(summaryLine)
      if (msg.length > 0) {
        //Filtering th response body based on summary line and date
        filteredIds = msg.filter((element) => element.body.includes(summaryLine) && element.date_created.includes(date))
        cy.log(filteredIds)
        //Storing the SMS ID
        smsId = filteredIds.map((item) => item.sid)
        cy.log(smsId)
        let id = smsId[0]
        console.log(id)
        if (smsId.length > 0) {
          //Filtering the message based on SMS ID
          filteredMessage = msg.filter((element) => element.sid.includes(`${id}`))
          sms = filteredMessage[0].body
          cy.log(sms)
          //Verifying the Device Details
          expect(sms, 'Verifying the Device Details').contains(deviceInfo)

          //Verifying Location Details
          expect(sms, 'Verifying Location Details').contains(locationDetails)

          //Verifying subject line
          expect(sms, 'Verifying subject line').contains(summaryLine)

          //Verify Alert Link
          expect(sms, 'Verify Alert Link').contains(
            `View Alert: https://staging-commercial-cox-health.web.app/${application}/p/default/smartAlerts/hospital/${hospitalId}/alerts`
          )
        }
      } else {
        cy.log('No SMS Found')
      }
    })
  }
}
