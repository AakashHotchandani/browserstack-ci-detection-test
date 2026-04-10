/// <reference types="cypress" />
import commandOptions from '../../utils/constants/commandOptions'
import APIEndpoints from '../../../APIEndpoints'

const hospitalId = Cypress.env('HospitalId')
const systemId = Cypress.env('SystemId')
const apiBaseUrl = Cypress.env('API_BaseUrl')
const { force, visible, requestMethod } = commandOptions
const { sensorSearchEndpoint, baseEndpoint, equipmentSearchEndpoint, incidentSearchEndpoint } = APIEndpoints

/**
 * @class IEMDashboard consists of static function related with IAP dashboard
 */
export default class IEMDashboard {
  /**
   * Retrieves equipment details based on the provided filter.
   *
   * This function builds a filter object based on the filter parameter, makes an API request
   * to retrieve the equipment details, and returns the count of equipment records found.
   *
   * @param {string} filter - The type of filter to apply. Valid values are 'linked' or any other string for no filter e.g 'monitored', 'inRange', 'outOfRange', 'warning'.
   * @param {string} status - The type status to be check either temperature or humidity by default value will be 'temperatureStatus' and for humidity it will 'humidityStatus'
   * @returns {Promise<number>} A promise that resolves to the count of equipment records matching the filter.
   *
   * @example
   * // Retrieves equipment details with 'linked' filter
   * getEquipmentDetails('linked').then((count) => {
   *   console.log(`Found ${count} equipment items.`);
   * });
   *
   * @throws {Error} If the API request fails or returns a non-200 status code.
   */
  static getEquipmentDetails = (filter, status = 'temperatureStatus') => {
    const getFilter = () => {
      switch (filter) {
        case 'linked':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'or',
                conditions: [
                  {
                    type: 'exists',
                    field: 'data/sensor/id',
                    not: false,
                  },
                ],
              },
            ],
          }
        //monitored means count of those equipments which are linked and assigned to valid department
        case 'monitored':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'exists',
                    field: 'data/sensor/id',
                    not: false,
                  },
                  {
                    type: 'exists',
                    field: 'data/location/building/id',
                  },
                ],
              },
            ],
          }

        case 'outOfRange':
        case 'inRange':
        case 'warning':
          return {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'logical',
                    operator: 'or',
                    conditions: [
                      {
                        type: 'equals',
                        field: `data/${status}`,
                        not: false,
                        value: filter,
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
                    field: 'data/sensor/id',
                    not: false,
                  },
                  {
                    type: 'exists',
                    field: 'data/location/building/id',
                  },
                ],
              },
            ],
          }

        default:
          return null
      }
    }

    //making API request
    return new Promise((resolve, reject) => {
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          method: requestMethod.post,
          url: apiBaseUrl + baseEndpoint(systemId, hospitalId) + equipmentSearchEndpoint,
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
   * Fetches the count of IEM  alerts based on the specified alert type.
   * This function sends a request to the server to retrieve data about various alert types, filtering and aggregating
   * as specified. The available alert types include 'calibrationDue' and a default case for other alerts.
   *
   * @param {string} alertType - Type of alert to filter by, such as 'calibrationDue'.
   * @returns {Promise<number>} - A promise that resolves to the count of alerts. For 'calibrationDue',
   * it returns the count of calibration alerts with specific conditions; for others, it returns the total count.
   *
   * @example
   * getIEMAlerts('calibrationDue').then(count => console.log(count));
   *
   * @example
   * getIEMAlerts('Temperature Warning').then(count => console.log(count));
   */
  static getIEMAlerts = (alertType) => {
    const getQuery = () => {
      switch (alertType) {
        case 'calibrationDue':
          return {
            limit: 0,
            aggs: {
              calibrationAlerts: {
                type: 'terms',
                field: 'data.source.id',
              },
            },
            filter: {
              type: 'logical',
              operator: 'and',
              conditions: [
                {
                  type: 'equals',
                  field: 'data/alertType',
                  empty: false,
                  fieldType: 'string',
                  value: ['Calibration Due in 5 days', 'Calibration Due in 10 days', 'Calibration Due in 30 days', 'Calibration Due in 60 days'],
                },
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/source/type',
                  value: ['equipment'],
                },
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/acknowledged/status',
                  value: [false],
                },
                {
                  type: 'exists',
                  field: 'data/description',
                  not: true,
                },
              ],
            },
          }

        default:
          return {
            limit: 0,
            filter: {
              type: 'logical',
              operator: 'and',
              conditions: [
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/acknowledged/status',
                  value: [false],
                },
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/alertType',
                  value: [
                    'Rental Due',
                    'Temperature Warning',
                    'EM Server Offline',
                    'Temperature Out of Range',
                    'Inspection Overdue',
                    'Sensor Offline',
                    'Humidity Out of Range',
                    'Sensor Low Battery',
                    'Calibration Due in 10 days',
                    'Calibration Due in 30 days',
                    'Calibration Due in 60 days',
                    'Calibration Due in 5 days',
                  ],
                },
                {
                  type: 'exists',
                  field: 'data/description',
                  not: true,
                },
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/source/type',
                  value: ['equipment'],
                },
              ],
            },
          }
      }
    }
    return new Promise((resolve, reject) => {
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          method: requestMethod.post,
          url: apiBaseUrl + baseEndpoint(systemId, hospitalId) + incidentSearchEndpoint,
          headers: {
            authorization: authToken,
          },
          body: getQuery(),
        }).then((res) => {
          expect(res.status).to.equal(200)
          const { count } = res.body

          if (alertType === 'calibrationDue') {
            const count = res.body.aggs?.calibrationAlerts?.buckets?.length
            resolve(count)
          } else {
            resolve(count)
          }
        })
      })
    })
  }
}
