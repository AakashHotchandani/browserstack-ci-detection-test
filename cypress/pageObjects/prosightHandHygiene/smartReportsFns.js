import APIEndpoints from '../../../APIEndpoints'
import commandOptions from '../../utils/constants/commandOptions'
import userData from '../../fixtures/SignIn/user.json'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'

const systemId = Cypress.env('SystemId')
const hospitalId = Cypress.env('HospitalId')
const apiBaseURL = Cypress.env('API_BaseUrl')
/**
 * This class consists of function related to Smart reports operations
 */
export default class HHSmartReports {
  static scheduleHHReports_API = (reportDetails) => {
    let exactReportType
    const reportEndPoint = APIEndpoints.reportsEndPoint(systemId, hospitalId)
    const { reportType, reportName, scheduleType, email, departmentId = null } = reportDetails

    //assigning report type value for request value
    if (reportType === 'LeaderShip Board') {
      exactReportType = 'leaderboard'
    } else if (reportType === 'Compliance Report') {
      exactReportType = 'compliance'
    } else if (reportType === 'Facility Compliance Report') {
      exactReportType = 'facilityCompliance'
    } else if (reportType === 'Alerts Report') {
      exactReportType = 'alerts'
    }

    const [schedule, report] = scheduleType.split(' ')
    const requiredSchedule = HelperFunction.toCamelCase(schedule)

    // Create a new Date object for the current date
    const currentDate = new Date()

    // Add two days to the current date
    currentDate.setDate(currentDate.getDate() + 4)

    // Convert the date to ISO 8601 format
    const isoStringDate = currentDate.toISOString()
    //add 10am time to current date
    currentDate.setHours(10, 0, 0, 0, 0)

    const isoStringTime = currentDate.toISOString()

    //logging to application and scheduling a report according to given data
    cy.task('getAuthToken').then((authToken) => {
      cy.api({
        method: commandOptions.requestMethod.post,
        url: apiBaseURL + reportEndPoint,
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
        body: {
          form: {
            basicInformation: {
              type: `compliance.smartReports.${exactReportType}`,
              name: reportName,
              schedule: requiredSchedule,
            },
            filters: {
              application: 'compliance',
              dateRange: 'last7Days',
              department: null,
              itemType: null,
              showCalendar: true,
              itemName: null,
              itemNamesList: [],
              dateRangeType: 'RANGE_TYPES_BACKWARD',
              departmentLabel: 'Assigned Department',
            },
            delivery: {
              application: 'compliance',
              sendWhen: 'later',
              sendReportOn: isoStringDate,
              sendReportAt: isoStringTime,
              sendReportStartingOn: null,
              sendReportStartingAt: null,
              sendReportEndingOn: null,
              sendReportFrequency: null,
              sendReportEndingOnMax: null,
              dateTimeSelectMin: null,
              enableSendReportEndingOn: false,
              type: `compliance.smartReports.${exactReportType}`,
              originalSendWhen: null,
            },
            recipients: [email],
          },
          config: {
            title: reportType,
            type: `compliance.smartReports.${exactReportType}`,
            dataType: 'powerBI',
            interface: [
              {
                path: [
                  ['interface', '{systemId}', 'hospital'],
                  ['obj', '{hospitalId}'],
                  ['srv', 'prosightAnalytics'],
                  ['get', 'embed/{type}'],
                ],
              },
            ],
            form: {
              defaults: {
                basicInformation: {
                  type: `compliance.smartReports.${exactReportType}`,
                  schedule: requiredSchedule,
                },
                filters: {
                  dateRange: 'last7Days',
                },
              },
              useDateRangeDirection: 'backward',
              useItemTypeFilter: true,
            },
          },
          context: {
            systemId: systemId,
            hospitalId: hospitalId,
            type: `compliance.smartReports.${exactReportType}`,
            filters: {
              hospitalId: hospitalId,
              buildingIds: ['1uZ3dl9VEceRvYLVUUBPdn'],
              departmentIds: [],
              itemTypeValues: [],
              itemNameValues: [],
              dateRange: 'last7Days',
            },
          },
          updatedBy: userData.username,
          createdBy: userData.username,
        },
      }).then((res) => {
        expect(res.status, 'Verifying status code').to.eq(200)
        expect(res.body, 'Verifying form property should exist in response body').to.have.property('form')
        const { name } = res.body.form.basicInformation
        expect(name, 'Verifying report name').to.eq(reportName)
        cy.log(`Report ${reportName} scheduled successfully`)
      })
    })
  }
}
