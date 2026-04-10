import APIEndpoints from '../../../APIEndpoints'
import commandOptions from '../../utils/constants/commandOptions'
import overviewDashboard from '../../utils/constants/prosightAssets/overviewDashboard'
const apiBaseURL = Cypress.env('API_BaseUrl')
const system_Id = Cypress.env('SystemId')
const hospital_Id = Cypress.env('HospitalId')
const { assetSearchEndpoint, baseEndpoint, parLevelStatus } = APIEndpoints

export default class IAP_OverviewDashboard {
  /**
   * Retrieves the count of assets based on the provided status and filter conditions.
   * The function supports filtering by asset status and linked/unlinked assets.
   *
   * @param {string} [status] - Optional. The status of the asset (e.g., 'operational', 'missing'). Used to filter assets by their status.
   * @param {string} [filterText] - Optional. The filter text to specify if the assets are 'linked' or 'unlinked'.
   *                                If set to 'linked', the function will filter assets that are tagged/linked.
   *
   * @returns {Cypress.Promise<number>} - A Cypress Promise that resolves with the count of assets matching the filters.
   *
   * @example
   * // Get count of assets with status 'active'
   * getAssetsCount('active', 'linked').then((count) => {
   *   console.log('Total linked active assets:', count);
   * });
   */
  static getAssetsCount = (status, filterText, responseData) => {
    //setting filter according to the user input status
    let filter
    if (status) {
      filter = {
        type: 'logical',
        operator: 'and',
        conditions: [
          {
            type: 'exists',
            field: 'data/tag/id',
          },
          {
            type: 'equals',
            field: `data/status/${status}`,
            value: [true],
            empty: false,
            fieldType: 'boolean',
          },
        ],
      }
    }
    //in case of filtering assets on basis of linked and unlinked
    if (filterText === 'linked') {
      filter = {
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
    //making a api call to the asset count by status
    return new Cypress.Promise((resolve, reject) => {
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          url: apiBaseURL + baseEndpoint(system_Id, hospital_Id) + assetSearchEndpoint,
          method: commandOptions.requestMethod.post,
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          body: {
            limit: responseData ? 1000 : 0,
            filter: filter,
          },
        }).then((response) => {
          expect(response.status).to.equal(200)
          const { count } = response.body
          if (responseData) {
            resolve(response.body.items)
          } else resolve(count)
        })
      })
    })
  }

  static getPARLevelStatusCount = () => {
    const statusKey = {}
    //function to get PAR Level status count from API
    return new Cypress.Promise((resolve, reject) => {
      cy.task('getAuthToken').then((authToken) => {
        cy.api({
          url: apiBaseURL + parLevelStatus(system_Id, hospital_Id),
          method: commandOptions.requestMethod.post,
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
        }).then((response) => {
          const statusKey = {
            out: 0,
            critical: 0,
            under: 0,
            over: 0,
            ok: 0,
            full: 0,
            warning: 0,
            'ok-soiled': 0,
          }
          response.body.forEach((item) => {
            const statusRoomtype =
              item.roomType === overviewDashboard.parLevelStatus.soiledRoomType && item.status === 'ok' ? item.status + '-soiled' : item.status
            statusKey[statusRoomtype] += 1
          })
          resolve(statusKey)
        })
      })
    })
  }
}
