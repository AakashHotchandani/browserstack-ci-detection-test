/// <reference types="cypress" />
const serverId = Cypress.env('ServerId')
import commandOptions from '../utils/constants/commandOptions'
import loginDetails from '../fixtures/SignIn/user.json'
import leverageConstants from '../utils/constants/Leverage/leverageConstants'
import LoginPage from './signIn/siginPage'
import alertData from '../fixtures/leverage/dataForTriggeringAlerts.json'
import data from '../fixtures/prosightSafety/safetyAlertData.json'
import signInData from '../fixtures/SignIn/mailasaourCredentials.json'
import globalConst from '../utils/constants/globalConst'
import APIEndpoints from '../../APIEndpoints'
import SmartAlertsUsingAPI from './prosightCore/triggeringAlerts'

const {staffTagOffline, tagLowBattery} = data.staffAlertTypes.nonEmergencyAlert
const { staffEmergency } = data.staffAlertTypes.emergencyAlert
const { tagOffline } = alertData.assetAlertTypes.tagAlerts
const { sensorLowBattery, sensorOffline, inspectionOverdue, equipmentRentalDue } = alertData.environmentalAlerts.sensorAndEquipmentAlerts
const { calibrationDueIn10Days, calibrationDueIn30Days, calibrationDueIn5Days, calibrationDueIn60Days } =
  alertData.environmentalAlerts.calibrationDueTypes
const { temperatureOutOfRange, temperatureWarning, humidityOutOfRange } = alertData.environmentalAlerts.temperatureAlerts
const { criticallyUnderPAR, underPar, stockedOut } = alertData.assetAlertTypes.parAlerts
const { shrinkage, maintenanceDue, rentalDue } = alertData.assetAlertTypes.assetAlerts
const { assets, safety, environment, core } = globalConst.application
const { mailosaurEmail, mailosaurPassword, username, password } = signInData
const apiBaseURL = Cypress.env('API_BaseUrl')
const hospitalId = Cypress.env('HospitalId')
const projectId = Cypress.env('ProjectId')
const { mailasourEndpoint, accountsEndpoint } = APIEndpoints
const accountEndpoint = accountsEndpoint(projectId)
/** This class consists of different static functions related with verifying alert emails with mailasour server
 * @class EmailTemplateManager
 */
export default class EmailTemplateManager {
  /**
   * This function is used to login to mailosaur server
   */
  static loginToMailosaurServer = () => {
    return new Cypress.Promise((resolve, reject) => {
      cy.api({
        method: leverageConstants.requestMethod.get,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        url: mailasourEndpoint + 'config',
      }).then((response) => {
        const { firebasePublicApiKey, firebaseTenantId } = response.body
        cy.api({
          method: leverageConstants.requestMethod.post,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          url: mailasourEndpoint + `identity/v1/accounts:signInWithPassword?key=${firebasePublicApiKey}`,
          body: {
            returnSecureToken: true,
            email: mailosaurEmail,
            password: mailosaurPassword,
            clientType: 'CLIENT_TYPE_WEB',
            tenantId: firebaseTenantId,
          },
        }).then((response) => {
          expect(response.body.email).to.eql(mailosaurEmail)
          const authData = 'Bearer ' + response.body.idToken
          resolve(authData)
        })
      })
    })
  }

  /**
   * This function is used to verify the mail generated when an alert is triggered
   * @param {String} alertType  - Type of alert for which email needs to be verified
   * @param {Object} deviceDetails - Object that contains information about location and device
   * @param {String} deviceDetails.deviceId - Tag Id for which email needs to be verified
   * @param {String} deviceDetails.assetName - Name of the asset for which email needs to be verified
   * @param {String} deviceDetails.assetType - type of the asset for which email needs to be verified
   * @param {String} deviceDetails.assetId - Id of the asset for which email needs to be verified
   * @param {String} deviceDetails.buildingName - Name of the building for which email needs to be verified
   * @param {String} deviceDetails.floorName - Name of the floor for which email needs to be verified
   * @param {String} deviceDetails.locationName - Name of the room for which email needs to be verified
   * @param {String} deviceDetails.staffName - Name of the staff for which email needs to be verified
   * @param {String} deviceDetails.staffType - type of the staff for which email needs to be verified
   * @param {String} deviceDetails.staffId - Id of the staff for which email needs to be verified
   * @param {String} application - Name of the application where verification needs to be done
   */
  static verifyEmailTemplate = (alertType, deviceDetails, application) => {
    //Declare variables
    let deviceId, assetName, assetType, assetId, buildingName, floorName, locationName, equipmentName, id, type, staffName, staffType, staffId
    let filteredIds = []
    let ids, emailCheck
    let subject, summaryLine, deviceInfo, locationDetails

    //Get the variables with the application is asset
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
        deviceInfo = `Staff Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      }
    }
    //Getting device info fo asset application
    else if (application === assets) {
      cy.log(deviceName,deviceType,deviceSerialNumber)
      deviceInfo = `Asset Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
    }
    //Getting device info fo environment application
    else if (application === environment) {
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
    }

    //Tag Low Battery Alerts
    if (alertType === tagLowBattery) {
      subject = 'Tag Low Battery'
      summaryLine = `${alertType} Tag ${deviceId} had a battery charge`
      locationDetails = `Last Location: ${buildingName}, ${floorName}, ${locationName} `
    }
    //Tag Offline Alerts
    else if (alertType === staffTagOffline || alertType === tagOffline) {
      subject = alertType
      summaryLine = `Tag ${deviceId} went offline`
      locationDetails = `Last Location: ${buildingName}, ${floorName}, ${locationName} `
    }
    //Staff Emergency alert
    else if (alertType === staffEmergency) {
      subject = alertType
      summaryLine = `${staffName} requested help`
      deviceInfo = `Staff Details : ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = `Location Details : ${buildingName}, ${floorName}, ${locationName} `
    }
    //PAR alerts
    else if (alertType === underPar || alertType === criticallyUnderPAR || alertType === stockedOut) {
      subject = 'PAR-level alert'
      summaryLine = `${alertType} ${assetType}, ${locationName} was ${alertType}`
      deviceInfo = ''
      locationDetails = ''
    }
    //Shrinkage alert
    else if (alertType === shrinkage) {
      subject = alertType
      summaryLine = `${alertType} ${assetName} exited the building`
      deviceInfo = `Asset Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = ''
    }
    //Rental Due Alerts
    else if (alertType === rentalDue && application === assets) {
      let alert = `Asset ${alertType}`
      subject = alert
      summaryLine = `${alert} ${assetName} rental is due on`
      deviceInfo = `Asset Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = ''
    }
    //Maintenance Due Alert
    else if (alertType === maintenanceDue) {
      let alert = `Asset Due for Preventative Maintenance`
      subject = alert
      summaryLine = `${alert} ${assetName} is due for maintenance`
      deviceInfo = `Asset Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = ''
    }
    //Sensor Offline alert
    else if (alertType === sensorOffline) {
      subject = alertType
      summaryLine = `${alertType} Sensor ${deviceId} went offline at`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType},${deviceSerialNumber} `
      locationDetails = `Location Details: ${buildingName},${floorName},${locationName} `
    }
    //Sensor Low battery alert
    else if (alertType === sensorLowBattery) {
      subject = alertType
      summaryLine = `${alertType} Sensor ${deviceId} had a battery charge of`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName} `
    }
    //Equipment rental due alert
    else if (alertType === equipmentRentalDue && application === environment) {
      let alert = `Equipment ${alertType}`
      subject = alert
      summaryLine = `${alert} ${deviceName} rental is due on`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName} `
    }
    //Inspection overdue alert
    else if (alertType === inspectionOverdue) {
      let alert = `Equipment ${alertType}`
      subject = alert
      summaryLine = `${alert} ${deviceName} ${deviceSerialNumber} was overdue for inspection at`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName} `
    }
    //Calibration Due Alerts
    else if (
      alertType === calibrationDueIn10Days ||
      alertType === calibrationDueIn5Days ||
      alertType === calibrationDueIn60Days ||
      alertType === calibrationDueIn30Days
    ) {
      subject = 'Equipment Calibration Due'
      summaryLine = `${alertType} Calibration for ${deviceName} is due on`
      deviceInfo = `Equipment Details: ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = `Location Details: ${buildingName}, ${floorName}, ${locationName} `
    }
    //Temperature out of range alert
    else if (alertType === temperatureOutOfRange) {
      subject = alertType
      summaryLine = `${alertType} ${deviceName} was out of the monitored temperature range at `
      deviceInfo = `Equipment Details : ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = `Location Details : ${buildingName}, ${floorName}, ${locationName} `
    }
    //Temperature warning alert
    else if (alertType === temperatureWarning) {
      subject = alertType
      summaryLine = `${alertType} ${deviceName} was in a warning temperature range at `
      deviceInfo = `Equipment Details : ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = `Location Details : ${buildingName}, ${floorName}, ${locationName} `
    }
    //Humidity out of range alert
    else if (alertType === humidityOutOfRange) {
      subject = alertType
      summaryLine = `${alertType} ${deviceName} was out of the monitored humidity range at `
      deviceInfo = `Equipment Details : ${deviceName}, ${deviceType}, ${deviceSerialNumber} `
      locationDetails = `Location Details : ${buildingName}, ${floorName}, ${locationName} `
    }

    //Searching all the messages from the Mailosaur server
    this.loginToMailosaurServer().then((authData) => {
      cy.api({
        method: leverageConstants.requestMethod.get,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        url: mailasourEndpoint + `messages?server=${serverId}&page=0&itemsPerPage=50&dir=Received`,
        headers: {
          authorization: authData,
        },
      }).then((response) => {
        expect(response.body.items).exist
        const item = response.body.items
        cy.log(item)
        if (item.length > 0) {
          cy.log(summaryLine)
          //Filter the emails
          filteredIds = item.filter((element) => element.summary.includes(`${summaryLine}`))
          cy.log(filteredIds)
          // Extract ids from filtered items
          ids = filteredIds.map((item) => item.id)
          cy.log(ids)
          if (ids.length > 0) {
            cy.wrap(ids[0]).as('Id')
            emailCheck = true
          } else {
            emailCheck = false
            console.log('No Emails Found')
          }
        } else {
          cy.log('No Emails Found')
        }
      })
      if ((emailCheck = true)) {
        //Getting the email  information
        cy.get('@Id').then((Id) => {
          cy.api({
            method: leverageConstants.requestMethod.get,
            failOnStatusCode: leverageConstants.failOnStatusCode,
            url: mailasourEndpoint + `messages/${Id}`,
            headers: {
              authorization: authData,
            },
          }).then((response) => {
            let htmlBody = response.body.html.body
            // console.log(htmls)
            function stripHtmlTags(html) {
              // Create a temporary element to hold the HTML
              let doc = new DOMParser().parseFromString(html, 'text/html')
              // Extract the text content from the body
              return doc.body.textContent || ''
            }
            let plainText = stripHtmlTags(htmlBody)
            // Remove newlines and extra spaces
            plainText = plainText.replace(/\n/g, '').replace(/\s+/g, ' ').trim()

            //Verifying the subject
            expect(response.body.subject).eq(subject)

            //Verifying the alert title
            if (alertType === maintenanceDue) {
              expect(plainText).contains('Asset Due for Preventative Maintenance')
            } else {
              expect(plainText).contains(alertType)
            }
            //Verifying the summary line
            expect(plainText).contains(summaryLine)

            //Verifying device Details
            expect(plainText).contain(deviceInfo)

            //Verifying location details
            expect(plainText).contain(locationDetails)

            //Verifying links
            expect(response.body.html.links[0].href).eq(
              `https://staging-commercial-cox-health.web.app/${application}/p/default/smartAlerts/hospital/${hospitalId}/alerts`
            )

            //Verifying link Name
            expect(plainText).contains('View Alert')
          })
        })
      }
    })
  }

  /**
   * This function is used to update settings for all the application
   * @param {Object} assetSettings - Object that contains parameters to update settings for asset application
   * @param {String} assetSettings.assetTypes - Settings that needs to be updated for asset type
   * @param {String} assetSettings.assetDepartments - Settings that needs to be updated for Departments in asset application
   * @param {String} assetSettings.assetEmail - Settings that needs to be updated for Email in asset application
   * @param {String} assetSettings.assetPush - Settings that needs to be updated for push notifications in asset application
   * @param {String} assetSettings.assetText - Settings that needs to be updated for text notifications in asset application
   * @param {String} assetSettings.assetAlertTypes - Settings that needs to be updated for alert types in asset application
   * @param {Object} safetySettings - Object that contains parameters to update settings for safety application
   * @param {String} safetySettings.staffTypes - Settings that needs to be updated for staff type
   * @param {String} safetySettings.safetyDepartments - Settings that needs to be updated for Departments in safety application
   * @param {String} safetySettings.safetyEmail - Settings that needs to be updated for Email in safety application
   * @param {String} safetySettings.safetyPush - Settings that needs to be updated for push notifications in safety application
   * @param {String} safetySettings.safetyText - Settings that needs to be updated for text notifications in safety application
   * @param {String} safetySettings.safetyAlertTypes - Settings that needs to be updated for alert types in safety application
   * @param {Object} environmentSettings - Object that contains parameters to update settings for environment application
   * @param {String} environmentSettings.equipmentTypes - Settings that needs to be updated for equipment type
   * @param {String} environmentSettings.environmentDepartments - Settings that needs to be updated for Departments in environment application
   * @param {String} environmentSettings.environmentEmail - Settings that needs to be updated for Email in environment application
   * @param {String} environmentSettings.environmentPush - Settings that needs to be updated for push notifications in environment application
   * @param {String} environmentSettings.environmentText - Settings that needs to be updated for text notifications in environment application
   * @param {String} environmentSettings.environmentAlertTypes - Settings that needs to be updated for alert types in environment application
   * @param {Object} adminSettings - Object that contains parameters to update settings for admin application
   * @param {String} adminSettings.adminDepartments - Settings that needs to be updated for Departments in admin application
   * @param {String} adminSettings.adminEmail - Settings that needs to be updated for Email in admin application
   * @param {String} adminSettings.adminPush - Settings that needs to be updated for push notifications in admin application
   * @param {String} adminSettings.adminText - Settings that needs to be updated for text notifications in admin application
   * @param {String} adminSettings.adminAlertTypes - Settings that needs to be updated for alert types in admin application
   */
  static enableNotifications = (assetSettings, safetySettings, environmentSettings, adminSettings) => {
    let assetAlertTypes,
      assetTypes,
      staffTypes,
      equipmentTypes,
      assetDepartments,
      assetEmail,
      assetPush,
      assetText,
      safetyAlertTypes,
      safetyDepartments,
      safetyEmail,
      safetyPush,
      safetyText,
      environmentAlertTypes,
      environmentDepartments,
      environmentEmail,
      environmentPush,
      environmentText,
      adminAlertTypes,
      adminDepartments,
      adminEmail,
      adminPush,
      adminText
    ;({ assetAlertTypes, assetTypes, assetDepartments, assetEmail, assetPush, assetText } = assetSettings)
    ;({ safetyAlertTypes, staffTypes, safetyDepartments, safetyEmail, safetyPush, safetyText } = safetySettings)
    ;({ environmentAlertTypes, equipmentTypes, environmentDepartments, environmentEmail, environmentPush, environmentText } = environmentSettings)
    ;({ adminAlertTypes, adminDepartments, adminEmail, adminPush, adminText } = adminSettings)

    LoginPage.loginToApplication(username, password).then(({ userId, authToken }) => {
      cy.api({
        method: commandOptions.requestMethod.patch,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        url: apiBaseURL + 'user/' + userId,
        headers: {
          authorization: authToken,
        },
        body: [
          {
            op: 'replace',
            path: 'metadata',
            value: {
              lastModified: 1680095425853,
              notifications: {
                assets: {
                  alertTypes: assetAlertTypes,
                  assetTypes: assetTypes,
                  departments: assetDepartments,
                  email: assetEmail,
                  hours: 'all',
                  push: assetPush,
                  text: assetText,
                  weekdays: 'all',
                },
                core: {
                  alertTypes: adminAlertTypes,
                  departments: adminDepartments,
                  email: adminEmail,
                  hours: 'all',
                  push: adminPush,
                  text: adminText,
                  weekdays: 'all',
                },
                environment: {
                  alertTypes: environmentAlertTypes,
                  departments: environmentDepartments,
                  email: environmentEmail,
                  equipmentTypes: equipmentTypes,
                  hours: 'all',
                  push: environmentPush,
                  text: environmentText,
                  weekdays: 'all',
                },
                safety: {
                  alertTypes: safetyAlertTypes,
                  departments: safetyDepartments,
                  email: safetyEmail,
                  hours: 'all',
                  push: safetyPush,
                  staffTypes: staffTypes,
                  text: safetyText,
                  weekdays: 'all',
                },
                timeZone: 'Eastern Standard Time',
              },
              temperatureSetting: 'degc',
            },
          },
        ],
      })
    })
  }

  /**
   * This function is used to update the email id
   * @param {String} email - The email address that needs to be updated
   */
  static updateEmailIdForTheProfile = (email) => {
    LoginPage.loginToApplication(username, password).then(({ userId, authToken }) => {
      SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
        cy.api({
          method: commandOptions.requestMethod.patch,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          url: apiBaseURL + accountEndpoint + userId,
          headers: {
            authorization: architectAuthToken,
          },
          body: [
            {
              op: 'replace',
              path: 'email',
              value: email,
            },
            {
              op: 'replace',
              path: 'name',
              value: username,
            },
            {
              op: 'replace',
              path: 'phone',
              value: '',
            },
            {
              op: 'replace',
              path: 'password',
              value: password,
            },
          ],
        }).then((response) => {
          expect(response.status).eq(200)
          expect(response.body.email).eq(email)
        })
      })
    })
  }
}
