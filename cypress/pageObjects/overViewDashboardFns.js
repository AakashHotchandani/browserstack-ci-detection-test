/// <reference types="cypress" />
import commandOptions from '../utils/constants/commandOptions'
import APIEndpoints from '../../APIEndpoints'

const hospitalId = Cypress.env('HospitalId')
const systemId = Cypress.env('SystemId')
const apiBaseUrl = Cypress.env('API_BaseUrl')
const { force, visible, requestMethod } = commandOptions
const { sensorSearchEndpoint, baseEndpoint, gatewaySearch, tagSearchEndpoint, incidentSearchEndpoint } = APIEndpoints

export default class OverviewDashboard {
  /**
   * Fetches data from the provided report.
   *
   * @param {Object} report - The report object from which to fetch data.
   * @returns {Promise<Array>} A promise that resolves to an array of arrays, each containing the title and data of a visual.
   *
   */
  static getDataFromReport(report) {
    return cy.wrap(
      report.getActivePage().then((page) => {
        return page.getVisuals().then((visuals) => {
          // Mapping over visuals to export data
          const promises = visuals.map((v) => {
            return v
              .exportData(1)
              .then((data) => [v.title, data.data]) // Resolve with title and data
              .catch(() => null) // Handle errors by returning null
          })
      
          // Wait for all promises to resolve, and filter out nulls
          return Promise.all(promises).then((results) => results.filter(Boolean))
        })
      })
    )
  }

  /**
   * Retrieves Power BI report data from an embedded iframe.
   *
   * This function searches for an iframe containing a Power BI report, ensures it is visible,
   * and extracts the embedded report instance. Once the report is rendered, it resolves with
   * the report data and processes the data using `getDataFromReport`.
   * @returns {Cypress.Chainable} A Cypress chainable promise that resolves with the processed report data.
   */
  static getPowerBIReportData = () => {
    //location iframe and taking the embed report
    return cy
      .get('iframe[src^="https://app.powerbi.com"]')
      .should(visible)
      .first()
      .parent()
      .then((elem) => {
        console.log('Iframe found, accessing embedded report') // Debugging with console.log

        const report = elem[0].powerBiEmbed

        //waiting for the report to render properly
        return new Cypress.Promise((resolve) => {
          report.on('rendered', () => resolve(report))
        })
      })
      .then(this.getDataFromReport)//extracting report data
  }

  /**
   * Retrieves the count of environment sensors based on the specified filter criteria.
   * This function supports filtering for sensors that are either "pending" or "offline."
   * It makes an API call to fetch the total number of sensors that match the filter.
   *
   * @param {string} filter - The filter criteria for the sensors. Can be either 'pending' or 'offline' or'onlineAndLinked' .
   *                          If 'pending', filters for sensors that have not reported data.
   *                          If 'offline', filters for sensors that have reported data before a certain timestamp.
   * @returns {Promise<number>} - A promise that resolves with the total count of sensors that match the applied filter.
   *
   * @example
   * // Example usage:
   * getEnvironmentSensorsCount('pending').then(count => {
   *   console.log('Total pending sensors:', count);
   * });
   */
  static getEnvironmentSenorsCount = (filter) => {
    //setting filters for request body
    const getFilter = () => {
      switch (filter) {
        case 'pending':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'or',
                conditions: [
                  {
                    type: 'logical',
                    operator: 'and',
                    conditions: [
                      {
                        type: 'exists',
                        field: 'data/lastReported',
                        not: true,
                      },
                    ],
                  },
                ],
              },
            ],
          }
        case 'offline':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'or',
                conditions: [
                  {
                    type: 'logical',
                    operator: 'and',
                    conditions: [
                      {
                        type: 'exists',
                        field: 'data/lastReported',
                      },
                      {
                        type: 'comparison',
                        field: 'data/lastReported',
                        empty: false,
                        comparator: '<',
                        value: 1724057246044,
                        isDate: true,
                      },
                    ],
                  },
                ],
              },
            ],
          }

        case 'onlineAndLinked':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'or',
                conditions: [
                  {
                    type: 'logical',
                    operator: 'and',
                    conditions: [
                      {
                        type: 'exists',
                        field: 'data/lastReported',
                      },
                      {
                        type: 'comparison',
                        field: 'data/lastReported',
                        comparator: '>',
                        empty: false,
                        value: 1724057695716,
                        isDate: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'logical',
                operator: 'or',
                conditions: [
                  {
                    type: 'exists',
                    field: 'data/equipment/id',
                    not: false,
                  },
                ],
              },
            ],
          }

        default:
          return null
      }
    }

    //calling api to get the total number of sensors

    return new Cypress.Promise((resolve, reject) => {
      //applying filter and getting total count of sensors according to applied filter
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          url: apiBaseUrl + baseEndpoint(systemId, hospitalId) + sensorSearchEndpoint,
          method: requestMethod.post,
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          body: {
            limit: 0,
            offset: 0,
            filter: getFilter(),
            sort: [
              {
                field: 'lastModified',
                order: 'desc',
              },
            ],
            nextToken: null,
          },
        }).then((response) => {
          expect(response.status).to.equal(200)
          const { count } = response.body
          resolve(count)
        })
      })
    })
  }

  /**
   * Retrieves the count of gateways based on the specified type and filter.
   *
   * @param {string} type - The type of gateway to filter by (e.g., 'AC', 'DC').
   * @param {string} filter - The filter condition to apply (e.g., 'pending', 'offline').
   * @returns {Promise<number>} - A promise that resolves to the count of gateways matching the filter criteria.
   *
   * The method uses different filter conditions based on the `filter` parameter:
   * - 'pending': Filters for gateways that do not have a status field.
   * - 'offline': Filters for gateways with a status of 'Offline'.
   * - Default: Filters for gateways of given type .
   */

  static getGatewaysCount = (type, filter) => {
    //assigning filter body according to filter type
    const getFilter = () => {
      switch (filter) {
        case 'pending':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'equals',
                field: 'data/gatewayType',
                value: [type],
                empty: false,
                fieldType: 'string',
              },
              {
                type: 'logical',
                operator: 'or',
                conditions: [
                  {
                    type: 'logical',
                    operator: 'or',
                    conditions: [
                      {
                        type: 'exists',
                        field: 'data/status',
                        not: true,
                      },
                    ],
                  },
                ],
              },
            ],
          }

        case 'offline':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'equals',
                field: 'data/gatewayType',
                value: [type],
                empty: false,
                fieldType: 'string',
              },
              {
                type: 'logical',
                operator: 'or',
                conditions: [
                  {
                    type: 'logical',
                    operator: 'and',
                    conditions: [
                      {
                        type: 'exists',
                        field: 'data/status',
                      },
                      {
                        type: 'equals',
                        field: 'data/status',
                        value: 'Offline',
                      },
                    ],
                  },
                ],
              },
            ],
          }

        default:
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'equals',
                field: 'data/gatewayType',
                value: [type],
                empty: false,
                fieldType: 'string',
              },
            ],
          }
      }
    }

    return new Cypress.Promise((resolve, reject) => {
      //logging in and requesting data on api end point
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          url: apiBaseUrl + baseEndpoint(systemId, hospitalId) + gatewaySearch,
          method: requestMethod.post,
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          body: {
            limit: 0,
            offset: 0,
            filter: getFilter(),
            sort: [
              {
                field: 'lastModified',
                order: 'desc',
              },
            ],
            nextToken: null,
          },
        }).then((res) => {
          expect(res.status).to.equal(200)
          const { count } = res.body
          resolve(count) //returning the count as promise resolve
        })
      })
    })
  }

  /**
   * Retrieves the count of tags from an API based on the specified type and filter.
   *
   * @param {string} type - The type of tag to filter by (e.g., 'Asset', 'Staff').
   * @param {string} filter - The filter condition to apply (e.g., 'pending', 'linkedAndOnline', 'unlinkedAndOnline').
   * @returns {Cypress.Chainable<number>} - A Cypress chainable that resolves to the count of tags matching the filter criteria.
   *
   * The method constructs a filter object based on the `filter` parameter:
   * - 'pending': Filters for tags without a timestamp and with a specific name.
   * - 'linkedAndOnline': Filters for tags with a timestamp, not online, and either has asset or staff ID, with a specific name.
   * - 'unlinkedAndOnline': Filters for tags with a timestamp, not online, without asset or staff ID, and with a specific name.
   * - Default: Filters for tags with a specific type and name.
   *
   * The method makes a POST request to the API endpoint with the constructed filter and returns the count of tags from the response.
   */

  static getTagsCount = (type, filter) => {
    //setting filter for request body
    const getFilter = () => {
      switch (filter) {
        case 'pending':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'equals',
                    field: 'data/type',
                    value: [`${type} Tag`],
                    empty: false,
                    fieldType: 'string',
                  },
                  {
                    type: 'logical',
                    operator: 'or',
                    conditions: [
                      {
                        type: 'logical',
                        operator: 'and',
                        conditions: [
                          {
                            type: 'exists',
                            field: 'data/timestamp',
                            not: true,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'groupedText',
                    fields: [
                      {
                        type: 'interfixFinalToken',
                        field: 'name.keyword',
                      },
                    ],
                    value: 'ZSD-TAG',
                    not: true,
                  },
                ],
              },
            ],
          }

        case 'linkedAndOnline':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'equals',
                    field: 'data/type',
                    value: [`${type} Tag`],
                    empty: false,
                    fieldType: 'string',
                  },
                  {
                    type: 'logical',
                    operator: 'or',
                    conditions: [
                      {
                        type: 'logical',
                        operator: 'or',
                        conditions: [
                          {
                            type: 'logical',
                            operator: 'and',
                            conditions: [
                              {
                                type: 'exists',
                                field: 'data/timestamp',
                              },
                              {
                                type: 'equals',
                                field: 'data/online',
                                value: false,
                                not: true,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'logical',
                    operator: 'or',
                    conditions: [
                      {
                        type: 'exists',
                        field: 'data/asset/id',
                        not: false,
                      },
                      {
                        type: 'exists',
                        field: 'data/staff/id',
                        not: false,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'groupedText',
                    fields: [
                      {
                        type: 'interfixFinalToken',
                        field: 'name.keyword',
                      },
                    ],
                    value: 'ZSD-TAG',
                    not: true,
                  },
                ],
              },
            ],
          }
        case 'unlinkedAndOnline':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'equals',
                    field: 'data/type',
                    value: [`${type} Tag`],
                    empty: false,
                    fieldType: 'string',
                  },
                  {
                    type: 'logical',
                    operator: 'or',
                    conditions: [
                      {
                        type: 'logical',
                        operator: 'or',
                        conditions: [
                          {
                            type: 'logical',
                            operator: 'and',
                            conditions: [
                              {
                                type: 'exists',
                                field: 'data/timestamp',
                              },
                              {
                                type: 'equals',
                                field: 'data/online',
                                value: false,
                                not: true,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'logical',
                    operator: 'and',
                    conditions: [
                      {
                        type: 'exists',
                        field: 'data/asset/id',
                        not: true,
                      },
                      {
                        type: 'exists',
                        field: 'data/staff/id',
                        not: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'groupedText',
                    fields: [
                      {
                        type: 'interfixFinalToken',
                        field: 'name.keyword',
                      },
                    ],
                    value: 'ZSD-TAG',
                    not: true,
                  },
                ],
              },
            ],
          }
        default:
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'equals',
                    field: 'data/type',
                    value: [`${type} Tag`],
                    empty: false,
                    fieldType: 'string',
                  },
                ],
              },
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'groupedText',
                    fields: [
                      {
                        type: 'interfixFinalToken',
                        field: 'name.keyword',
                      },
                    ],
                    value: 'ZSD-TAG',
                    not: true,
                  },
                ],
              },
            ],
          }
      }
    }

    //making request on api
    return new Cypress.Promise((resolve, reject) => {
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          url: apiBaseUrl + baseEndpoint(systemId, hospitalId) + tagSearchEndpoint,
          failOnStatusCode: false,
          method: requestMethod.post,
          headers: {
            authorization: authToken,
          },
          body: {
            limit: 0,
            offset: 0,
            filter: getFilter(),
            sort: [
              {
                field: 'lastModified',
                order: 'desc',
              },
            ],
            nextToken: null,
          },
        }).then((res) => {
          expect(res.status).to.equal(200)
          const { count } = res.body
          resolve(count)
        })
      })
    })
  }

  /**
   * Retrieves the count of alerts based on specific filter conditions.
   *
   * @param {boolean} [events=false] - The event status to filter the alerts. Defaults to `false`.
   * @returns {Cypress.Chainable<number>} A Cypress Promise that resolves to the count of alerts.
   *
   * @example
   * // Get the count of alerts where events are acknowledged
   * getAlertsCount(true).then((count) => {
   *   cy.log(`Alert count: ${count}`);
   * });
   *
   * @throws Will throw an error if the API response status is not 200.
   */
  static getAlertsCount = (events = false, application = 'admin') => {
    //setting condition to get alerts according to application
    let requiredAlerts
    if (application === 'admin') {
      requiredAlerts = [
        'EM Server Offline',
        'Gateway Offline',
        'Sensor Low Battery',
        'Tag Low Battery 20',
        'Tag Offline',
        'Sensor Offline',
        'Gateway Low Battery 20',
        'Gateway Low Battery < 5',
        'Calibration Due in 10 days',
        'Calibration Due in 30 days',
        'Calibration Due in 60 days',
        'Tag Low Battery < 5',
        'Calibration Due in 5 days',
      ]
    } else if (application === 'iap') {
      requiredAlerts = ['asset']
    }
    return new Cypress.Promise((resolve, reject) => {
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          url: apiBaseUrl + baseEndpoint(systemId, hospitalId) + incidentSearchEndpoint,
          failOnStatusCode: false,
          method: requestMethod.post,
          headers: {
            authorization: authToken,
          },
          body: {
            limit: 0,
            offset: 0,
            filter: {
              type: 'logical',
              operator: 'and',
              conditions: [
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/acknowledged/status',
                  value: [events],
                },
                {
                  type: 'exists',
                  field: 'data/description',
                  not: true,
                },
                {
                  empty: false,
                  type: 'equals',
                  field: application !== 'admin' ? 'data/source/type' : 'data/alertType',
                  value: requiredAlerts,
                },
              ],
            },
            sort: null,
            nextToken: null,
          },
        }).then((res) => {
          expect(res.status).to.equal(200)
          const { count } = res.body
          resolve(count)
        })
      })
    })
  }
}
