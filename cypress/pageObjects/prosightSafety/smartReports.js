import assetsSelectors from '../../utils/selectors/prosightAssets'
import safetySelectors from '../../utils/selectors/prosightSafety'
import safetyConstants from '../../utils/constants/prosightSafety/smartReports'
import Click from '../../utils/Interactions/click'
import { Verify } from '../../utils/assertions'
import commandOptions from '../../utils/constants/commandOptions'
import globals from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import APIEndpoints from '../../../APIEndpoints'
import LoginPage from '../signIn/siginPage'
import userData from '../../fixtures/SignIn/user.json'
import smartReports from '../../utils/constants/smartReports'

const systemId = Cypress.env('SystemId')
const hospitalId = Cypress.env('HospitalId')
const apiBaseURL = Cypress.env('API_BaseUrl')
const serverId = Cypress.env('ServerId')
const emailAddress = Cypress.env('EmailAddress')
const { reportTypes, date, department } = smartReports.emailTemplates
/**
 * Class SmartReports consists static functions related to Smart Reports Module from ISDR
 * @class SmartReports
 */

export default class SmartReports {
  /**
   * Verifies the Select All option is checked.
   */
  static verifySelectAllOption = () => {
    Click.forcefullyOn(assetsSelectors.smartReports.departmentButton)
    cy.get(safetySelectors.smartReports.checkboxLabel).contains(safetyConstants.buttonInnerTxt.selectAll).parent().parent().as('parentCheckbox')
    cy.get('@parentCheckbox').find(globals.checkbox).as('checkbox')
    Verify.theElement('@checkbox').isChecked()
  }

  /**
   * Function that creates a report using api calls
   * @param {object} reportDetails it is the object that consists of required details for scheduling reports
   * @param {string} reportDetails.reportType required report type
   * @param {string} reportDetails.reportName required report name
   * @param {string} reportDetails.scheduleType required report delivery type i.e one time or recurring
   * @param {string} reportDetails.email required email for sending the report
   * @param {string} reportDetails.departmentId required report department id
   * @param {string} reportDetails.equipmentType required equipment type
   */
  static scheduleSafetyReport_API = (reportDetails) => {
    const reportsEndpoint = APIEndpoints.reportsEndPoint(systemId, hospitalId)
    let {
      reportType,
      reportName,
      scheduleType,
      email,
      departmentId,
      reportDelivery = null,
      sendReportStartingOn = null,
      dateTimeSelectMin = null,
      sendReportStartingAt = null,
      sendReportEndingOn = null,
      sendReportEndingOnMax = null,
      sendReportFrequency = null,
      enableSendReportEndingOn = null,
      sendReportOn = null,
      sendReportAt = null,
      dateRange = null,
    } = reportDetails
    let reportTypeRequired

    if (reportType.includes('Non-Emergency')) {
      reportTypeRequired = 'nonEmergencyAlerts'
    } else if (reportType.includes('Staff Emergency Alerts Report')) {
      reportTypeRequired = 'emergencyAlerts'
    }
    // Create a new Date object for the current date
    const currentDate = new Date()
    // Add two days to the current date
    currentDate.setDate(currentDate.getDate() + 2)

    // Convert the date to ISO 8601 format
    const isoStringDate = currentDate.toISOString()
    //add 10am time to current date
    currentDate.setHours(10, 0, 0, 0, 0)

    const isoStringTime = currentDate.toISOString()

    let schedule
    let presentData = new Date().toISOString()
    if (scheduleType === 'One-Time Report') {
      ;(schedule = 'oneTime'),
        (enableSendReportEndingOn = false),
        (sendReportOn = isoStringDate),
        (sendReportAt = isoStringTime),
        (dateRange = 'last7Days')
    } else if (scheduleType === 'Recurring Report') {
      ;((enableSendReportEndingOn = true), (reportDelivery = 'recurring')),
        (dateRange = 'last1Week'),
        (schedule = 'recurring'),
        (sendReportStartingOn = presentData),
        (dateTimeSelectMin = isoStringTime),
        (sendReportStartingAt = presentData),
        (sendReportFrequency = 'daily'),
        (sendReportEndingOn = isoStringDate),
        (sendReportEndingOnMax = presentData)
    }
    LoginPage.loginToApplication().then(({ authToken }) => {
      cy.api({
        method: commandOptions.requestMethod.post,
        url: apiBaseURL + reportsEndpoint,
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
        body: {
          form: {
            basicInformation: {
              type: `safety.smartReports.${reportTypeRequired}`,
              name: reportName,
              schedule: schedule,
              disabled: false,
            },
            filters: {
              application: 'safety',
              dateRange: dateRange,
              department: [departmentId],
              itemType: null,
              showCalendar: true,
              itemName: null,
              itemNamesList: [],
              dateRangeType: 'RANGE_TYPES_BACKWARD',
              departmentLabel: 'Assigned Department',
            },
            delivery: {
              application: 'safety',
              sendWhen: reportDelivery || 'later',
              sendReportOn: sendReportOn,
              sendReportAt: sendReportAt,
              sendReportStartingOn: sendReportStartingOn,
              sendReportStartingAt: sendReportStartingAt,
              sendReportEndingOn: sendReportEndingOn,
              sendReportFrequency: sendReportFrequency,
              sendReportEndingOnMax: sendReportEndingOnMax,
              dateTimeSelectMin: dateTimeSelectMin,
              enableSendReportEndingOn: enableSendReportEndingOn,
              disabled: false,
              type: `safety.smartReports.${reportTypeRequired}`,
            },
            recipients: [email],
          },
          config: {
            title: reportType,
            type: `safety.smartReports.${reportTypeRequired}`,
            dataType: 'imagine',
            forwardDateDisable: true,
            interface: [
              {
                path: [
                  ['interface', '{systemId}', 'hospital'],
                  ['obj', '{hospitalId}'],
                  ['srv', 'prosightAnalytics'],
                  [
                    'post',
                    'scheduledReports/{type}/data',
                    {
                      context: '{}',
                    },
                  ],
                ],
              },
            ],
            accessors: [
              {
                type: 'value',
                label: 'Name',
                path: 'sourceName',
              },
              {
                type: 'value',
                label: 'Staff Id',
                path: 'sourceExternalId',
              },
              {
                type: 'value',
                label: 'Date/Time',
                path: 'created',
                modifier: ['formatDate', 'MM/dd/yyyy hh:mm a'],
              },
              {
                type: 'value',
                label: 'Alert Type',
                path: 'alertType',
              },
              {
                type: 'value',
                label: 'Response Time',
                path: 'responseTime',
              },
              {
                type: 'value',
                label: 'Event Log',
                path: '/',
                modifier: ['safety.eventLogAccessor'],
              },
              {
                type: 'value',
                label: 'Performed by',
                path: '/',
                modifier: ['safety.eventAuthorAccessor'],
              },
              {
                type: 'value',
                label: 'Comments',
                path: '/',
                modifier: ['safety.eventMessageAccessor'],
              },
            ],
            form: {
              defaults: {
                basicInformation: {
                  type: `safety.smartReports.${reportTypeRequired}`,
                  schedule: schedule,
                },
                filters: {
                  dateRange: 'last7Days',
                },
              },
              useDateRangeDirection: 'backward',
              useItemTypeFilter: false,
            },
          },
          context: {
            systemId: systemId,
            hospitalId: hospitalId,
            type: `safety.smartReports.${reportTypeRequired}`,
            filters: {
              hospitalId: hospitalId,
              buildingIds: ['0EFlqEU049bQWxOnfcNPAj', '4UAoO7IFOStsrb3tyREwiO', '6ym0YtAahfFjRl8AZj4yuN', '531sFx9AqcRoJAi7E0cC5F'],
              departmentIds: [departmentId],
              itemTypeValues: [],
              itemNameValues: [],
              dateRange: 'last7Days',
            },
            offset: 0,
            limit: 9999,
          },
          updatedBy: userData.username,
          createdBy: userData.username,
        },
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('form')
        const { name } = res.body.form.basicInformation
        expect(name).to.eq(reportName)
        cy.log(`Report ${reportName} created successfully`)
      })
    })
  }

  /**
   * Deletes a report by its name using the API.
   * @param {string} reportName The name of the report to delete.
   * @param {string} application The name of the application where search functionlaity needs to be executed
   */
  static deleteReports_API = (reportName, application) => {
    let reportNames
    if (application === 'IAP') {
      reportNames =
        'assets.smartReports.inventory,assets.smartReports.utilization,assets.smartReports.shrinkage,assets.smartReports.rentals,assets.smartReports.alerts,assets.smartReports.parLevelFrequency,assets.smartReports.parLevelVariance,assets.smartReports.preventativeMaintenance,assets.smartReports.siemensLocation,assets.smartReports.siemensProcess,assets.smartReports.siemensExit,assets.smartReports.siemensLowUtilization,assets.smartReports.siemensProcessingTimeAsset,assets.smartReports.siemensProcessingTimeTypes,assets.smartReports.siemensBatteryManagement'
    } else if (application === 'ISDR') {
      reportNames = 'safety.smartReports.emergencyAlerts,safety.smartReports.nonEmergencyAlerts'
    } else if (application === 'IEM') {
      reportNames =
        'environment.smartReports.environmental,environment.smartReports.alerts,environment.smartReports.compliance,environment.smartReports.calibration'
    }
    const reportsEndPoint = APIEndpoints.reportsEndPoint(systemId, hospitalId)

    return new Cypress.Promise((resolve, reject) => {
      cy.task('getAuthToken').then((authToken) => {
        //first will search for the the required report take id and then proceed for deleting it
        cy.api({
          url: apiBaseURL + reportsEndPoint,
          method: 'GET',
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          qs: {
            type: reportNames,
          },
        }).then((res) => {
          expect(res.status, 'Verifying response code').to.equal(200)
          expect(res.body, 'Verifying reposne body should have property items').to.have.property('items')
          const requiredReport = res.body.items.filter((elem) => elem.report_name === reportName)
          const finalIds = requiredReport.map((ele) => ele.id) // extract just the IDs
          if (finalIds.length) {
            finalIds.forEach((requiredReportId) => {
              cy.api({
                url: apiBaseURL + `${reportsEndPoint}/${requiredReportId}`,
                method: 'DELETE',
                failOnStatusCode: false,
                headers: {
                  authorization: authToken,
                },
              }).then((res) => {
                if (res.status === 200) {
                  expect(res.status).to.equal(200)
                  cy.log(`Report ${reportName} deleted successfully`)
                  resolve(`Report ${reportName} deleted successfully`)
                } else {
                  cy.log('Failed to delete report')
                  reject('Failed to delete report')
                }
              })
            })
          }
        })
      })
    })
  }
  /**
   * User to initiate mailsour server and verify the email
   * @param {Object} reportDetails - Object that contains details for verifying email
   * @param {String} reportDetails.reportName - Name of the report to be verified
   * @param {String} reportDetails.reportType - Type of report to be verified
   * @param {String} reportDetails.departmentName - Name of the department to be verified
   * @param {String} reportDetails.dateRange - Date range to be verified
   */
  static verifyEmailTemplate = (reportDetails) => {
    const { reportName, reportType, departmentName, dateRange } = reportDetails
    const titleOfTheReport = `"${reportName}" has been shared with you`
    //Initiating mail server
    cy.mailosaurGetMessage(
      serverId,
      {
        sentTo: emailAddress,
      },
      {
        timeout: 40000, // 20 seconds (in milliseconds)
      }
    ).then((email) => {
      expect(email.subject).to.equal(reportName)
      expect(email.html.body).to.contain(`<h3 style="color: #435883; font-weight: 600;">${titleOfTheReport}</h3>`)
      expect(email.html.body).to.contain(`<span style="font-weight: 600">${reportTypes}</span><span>: ${reportType}</span>`)
      expect(email.html.body).to.contain(`<span style="font-weight: 600">${date}</span><span>: ${dateRange}</span>`)
      expect(email.html.body).to.contain(`<span style="font-weight: 600">${department}</span><span>: ${departmentName}</span>`)
    })
  }
}
