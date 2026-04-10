import APIEndpoints from '../../../APIEndpoints'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import userData from '../../fixtures/SignIn/user.json'
const apiBaseURL = Cypress.env('API_BaseUrl')
const hospital_Id = Cypress.env('HospitalId')
const project_Id = Cypress.env('ProjectId')
const system_Id = Cypress.env('SystemId')
const { baseEndpoint, assetSearchEndpoint } = APIEndpoints
export default class ruleLocStatus {
  static verifyAssetStatus(assetName) {
    return cy.task('getAuthToken').then((authToken) => {
      return cy
        .request({
          method: 'POST',
          url: `${apiBaseURL}${baseEndpoint(system_Id, hospital_Id)}${assetSearchEndpoint}`,
          headers: {
            authorization: authToken,
            'Content-Type': 'application/json',
          },
          body: {
            limit: 100,
            offset: 0,
            filter: {
              type: 'exists',
              field: 'data/tag/id',
              not: false,
            },
            sort: [
              {
                field: 'lastModified',
                order: 'desc',
              },
            ],
            nextToken: null,
          },
        })
        .then((res) => {
          return res.body.items.find((asset) => asset.name === assetName)
        })
    })
  }
  static statusHistory(asset, data) {
    return cy.task('getAuthToken').then((authToken, body) => {
      return HelperFunction.search_API(asset, leverageConstants.objectTypes.asset).then(({ authToken, Id }) => {
        return cy
          .api({
            method: 'PATCH',
            url: `${apiBaseURL}${baseEndpoint(system_Id, hospital_Id)}assets/${Id}`,
            headers: {
              authorization: authToken,
            },
            body: data,
          })
          .then((resdata) => {
            expect(resdata.body.data.name).equal(asset)
            expect(
              Object.entries(resdata.body.data.prevStatus)
                .filter(([K, V]) => V === true)
                .map(([K]) => K.trim())
            ).to.be.eql(
              Object.entries(data.data.prevStatus)
                .filter(([K, V]) => V === true)
                .map(([K]) => K.trim())
            )
            expect(
              Object.entries(resdata.body.data.status)
                .filter(([K, V]) => V === true)
                .map(([K]) => K.trim())
            ).to.be.eql(
              Object.entries(data.data.status)
                .filter(([K, V]) => V === true)
                .map(([K]) => K.trim())
            )
          })
      })
    })
  }
}
