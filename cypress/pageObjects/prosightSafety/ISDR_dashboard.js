import APIEndpoints from '../../../APIEndpoints'
import commandOptions from '../../utils/constants/commandOptions'

const apiBaseURL = Cypress.env('API_BaseUrl')
const system_Id = Cypress.env('SystemId')
const hospital_Id = Cypress.env('HospitalId')
const { post } = commandOptions.requestMethod
const { baseEndpoint, staffSearchEndpoint, incidentSearchEndpoint } = APIEndpoints

export default class ISDR_OverviewDashboard {
  /**
   * Retrieves the count of staff members based on the specified filter.
   * The default filter is 'linked', which fetches staff members that have associated tags (e.g., linked devices or IDs).
   *
   * @param {string} [filter='linked'] - The filter type to apply. Defaults to 'linked'. Can be customized to add more filter types if necessary.
   *
   * - If `filter` is 'linked', it will search for staff members that have an associated tag (e.g., devices or IDs linked to the staff).
   *
   * @returns {Promise<number>} - A Cypress Promise that resolves with the count of staff members matching the filter criteria.
   *
   * Example:
   * ```js
   * getStaffCount().then(count => {
   *   console.log('Linked staff count:', count);
   * });
   * ```
   */
  static getStaffCount = (filter = 'linked') => {
    let filterBody

    if (filter === 'linked') {
      filterBody = {
        type: 'logical',
        operator: 'and',
        conditions: [
          {
            type: 'logical',
            operator: 'or',
            conditions: [
              {
                type: 'exists',
                field: 'data/tag/id',
                not: false,
              },
            ],
          },
        ],
      }
    }
    return new Cypress.Promise((resolve, reject) => {
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          url: apiBaseURL + baseEndpoint(system_Id, hospital_Id) + staffSearchEndpoint,
          method: post,
          headers: {
            authorization: authToken,
          },
          body: {
            limit: 0,
            filter: filterBody,
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
   * Fetches the count of staff-related alerts, specifically for a given alert type (default: 'Staff Emergency Alert').
   * It uses Cypress to make an API call with the provided filters, retrieves the count of matching alerts, and resolves with the count.
   *
   * @param {string} alertType - The type of alert to filter
   * @param {string} responseBodyRequired if response body required the true otherwise false
   * @returns {Promise<number>} - A Cypress Promise that resolves with the count of alerts matching the specified criteria.
   *
   * Example:
   * ```js
   * getStaffAlertsCount().then(count => {
   *   console.log('Staff Emergency Alert count:', count);
   * });
   * ```
   */
  static getStaffAlertsCount = (alertType, responseBodyRequired) => {
    //setting filter queries according to alert type filter
    const getFilter = () => {
      switch (alertType) {
        case 'Staff Emergency Alert':
          return {
            operator: 'and',
            type: 'logical',
            conditions: [
              {
                type: 'logical',
                operator: 'and',
                conditions: [
                  {
                    type: 'logical',
                    operator: 'and',
                    conditions: [
                      {
                        type: 'equals',
                        field: 'data/alertType',
                        value: [alertType],
                        fieldType: 'string',
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
                    empty: false,
                    type: 'equals',
                    field: 'data/alertType',
                    value: [
                      'Room Entry',
                      'Room Overcapacity',
                      'Room Exit',
                      'Tag Low Battery 20',
                      'Staff Emergency Alert',
                      'Tag Offline',
                      'Tag Low Battery < 5',
                    ],
                  },
                  {
                    empty: false,
                    type: 'equals',
                    field: 'data/acknowledged/status',
                    value: [false],
                  },
                  {
                    empty: false,
                    type: 'equals',
                    field: 'data/source/type',
                    value: ['staffMember'],
                  },
                ],
              },
              {
                not: false,
                type: 'equals',
                field: 'data.source.type',
                value: 'staffMember',
              },
            ],
          }

        default:
          return {
            operator: 'and',
            type: 'logical',
            conditions: [
              {
                empty: false,
                type: 'equals',
                field: 'data/alertType',
                value: [
                  'Room Entry',
                  'Room Overcapacity',
                  'Room Exit',
                  'Tag Low Battery 20',
                  'Staff Emergency Alert',
                  'Tag Offline',
                  'Tag Low Battery < 5',
                ],
              },
              {
                empty: false,
                type: 'equals',
                field: 'data/acknowledged/status',
                value: [false],
              },
              {
                empty: false,
                type: 'equals',
                field: 'data/source/type',
                value: ['staffMember'],
              },
              {
                not: false,
                type: 'equals',
                field: 'data.source.type',
                value: 'staffMember',
              },
            ],
          }
      }
    }

    return new Cypress.Promise((resolve, reject) => {
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          url: apiBaseURL + baseEndpoint(system_Id, hospital_Id) + incidentSearchEndpoint,
          failOnStatusCode: false,
          method: post,
          headers: {
            authorization: authToken,
          },
          body: {
            limit: responseBodyRequired ? 1000 : 0,
            offset: 0,
            filter: getFilter(),
            sort: null,
            nextToken: null,
          },
        }).then((res) => {
          expect(res.status).to.equal(200)
          const { count } = res.body
          if (responseBodyRequired) {
            resolve(res.body.items)
          } else resolve(count)
        })
      })
    })
  }
}
