///<reference types= 'cypress'/>
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import APIEndpoints from '../../../APIEndpoints'
import signIn from '../../fixtures/SignIn/user.json'
import option from '../../utils/constants/commandOptions'
import LoginPage from '../signIn/siginPage'
const apiBaseURL = Cypress.env('API_BaseUrl')
const hospital_Id = Cypress.env('HospitalId')
const project_Id = Cypress.env('ProjectId')
const system_Id = Cypress.env('SystemId')
import HelperFunction from '../../utils/helpers/crossModuleFunctions'

const { room, floors, departments } = leverageConstants.objectTypes

/** This class consists of different static functions related to smart alerts page
 * @class SmartAlertsUsingAPI
 */

export default class SmartAlertsUsingAPI {
  /**
   * This function is used to login to the Architect
   * @returns architectAuthToken it is the token required to perform any action in leverage application
   */
  static loginToArchitect = () => {
    const loginEndPoint = APIEndpoints.loginEndpoint
    return cy
      .api({
        method: option.requestMethod.post,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        url: apiBaseURL + loginEndPoint,
        body: {
          username: signIn.leverageUsername,
          password: signIn.leveragePassword,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          expect(res.status).to.eq(200)
          expect(res.body).to.have.property('idToken')
          const architectAuthToken = 'Bearer ' + res.body.idToken
          return architectAuthToken
        } else {
          cy.log('Unable to login to Architect')
        }
      })
  }

  /**
   * This function is used to create tags and assign location to the tags
   * @param {String} tagDetails.deviceId  - Id that is used to create tags i.e tag id
   * @param {Object} tagDetails - Object that consists of necessary details to create tag and assign location
   * @param{String} tagDetails.type it is the required tag type
   * @param{String} tagDetails.manufacturer it is the required tag manufacturer
   * @param{String} tagDetails.model it is the required tag model
   * @param{String} tagDetails.floorName it is the required floor name for tag location
   * @param{String} tagDetails.floorId it is the required floor id for tag location
   * @param{String} tagDetails.locationName it is the required current room  name for tag location
   * @param{String} tagDetails.locationId it is the required locationId for tag location
   * @param{String} tagDetails.previousRoomName it is the required previousRoomName for tag location
   * @param{String} tagDetails.previousRoomId it is the required previousRoomId for tag location
   * @param{String} tagDetails.departmentName it is the required departmentName for tag location
   * @param{String} tagDetails.departmentId it is the required departmentId for tag location
   * @param{String} tagDetails.buildingName it is the required buildingName for tag location
   * @param{String} tagDetails.buildingId it is the required departmentName for tag location
   */
  static createTags = (tagDetails) => {
    const { type, manufacturer, model, floorName, locationName, previousRoomName, departmentName, buildingName, buildingId, deviceId } = tagDetails

    const tagActionsEndpoint = APIEndpoints.tagActionsEndpoint(system_Id, hospital_Id)

    return HelperFunction.search_API(floorName, floors).then(({ authToken, Id }) => {
      let floorId = Id
      return HelperFunction.search_API(departmentName, departments).then(({ authToken, Id }) => {
        let departmentId = Id
        return HelperFunction.search_API(locationName, room).then(({ authToken, Id }) => {
          let locationId = Id
          return HelperFunction.search_API(previousRoomName, room).then(({ authToken, Id }) => {
            let previousRoomId = Id
            return cy.task('getAuthToken').then((authToken) => {
              return cy
                .api({
                  method: option.requestMethod.post,
                  failOnStatusCode: leverageConstants.failOnStatusCode,
                  url: apiBaseURL + tagActionsEndpoint,
                  headers: {
                    authorization: authToken,
                  },
                  body: {
                    networkAliases: {
                      'hid-beacons': {
                        deviceId: deviceId,
                      },
                    },
                    networkId: 'hid-beacons',
                    data: [
                      {
                        path: 'uniqueDeviceId',
                        value: deviceId,
                      },
                      {
                        path: 'type',
                        value: type,
                      },
                      {
                        path: 'manufacturer',
                        value: manufacturer,
                      },
                      {
                        path: 'model',
                        value: model,
                      },
                      {
                        path: 'tagType',
                        value: model,
                      },
                      {
                        path: 'location',
                        value: {
                          floor: {
                            name: floorName,
                            id: floorId,
                          },
                          department: {
                            name: departmentName,
                            id: departmentId,
                          },
                          room: {
                            name: locationName,
                            id: locationId,
                          },
                          building: {
                            name: buildingName,
                            id: buildingId,
                          },
                          timestamp: new Date().getTime(),
                        },
                      },
                      {
                        path: 'p',
                        value: {
                          floor: {
                            name: floorName,
                            id: floorId,
                          },
                          department: {
                            name: departmentName,
                            id: departmentId,
                          },
                          room: {
                            name: locationName,
                            id: locationId,
                          },
                          building: {
                            name: buildingName,
                            id: buildingId,
                          },
                          timestamp: new Date().getTime(),
                        },
                      },
                      {
                        path: 'prevLocation',
                        value: {
                          floor: {
                            name: floorName,
                            id: floorId,
                          },
                          department: {
                            name: departmentName,
                            id: departmentId,
                          },
                          room: {
                            name: previousRoomName,
                            id: previousRoomId,
                          },
                          building: {
                            name: buildingName,
                            id: buildingId,
                          },
                          timestamp: new Date().getTime(),
                        },
                      },
                    ],
                    name: deviceId,
                  },
                })
                .then((res) => {
                  expect(res.status).to.equal(200)
                  expect(res.body).to.have.property('data')
                  expect(res.body.data.uniqueDeviceId).to.equal(deviceId)
                  cy.log(`Tag ${deviceId} created successfully`)
                })
            })
          })
        })
      })
    })
  }

  static updateDateinTag = (tagDetails) => {
    return HelperFunction.search_API(tagDetails.deviceId, leverageConstants.objectTypes.tag).then(({ authToken, Id }) => {
      let tagLevID = Id
      return cy.task('getAuthToken').then((authToken) => {
        return cy
          .api({
            method: option.requestMethod.put,
            failOnStatusCode: false,
            url: apiBaseURL + `device/${tagLevID}/setValue`,
            headers: {
              authorization: authToken,
            },
            body: {
              values: [
                {
                  path: 'firstReported',
                  value: Date.now(),
                },
                {
                  path: 'timestamp',
                  value: Date.now(),
                },
                {
                  path: 'timestampCleared',
                  value: Date.now(),
                },
              ],
            },
          })
          .then((res) => {
            if (res.status === 200) {
              cy.log(res.body)
            }
          })
      })
    })
  }

  /**
   * This function is used to delete the timer that is created
   */
  static deleteTimer = () => {
    const timerSearchEndPoint = APIEndpoints.timerEndpoint(project_Id)
    const timerEndPoint = APIEndpoints.timerEndpoint(project_Id)
    let timerIdsToDelete
    this.loginToArchitect().then((architectAuthToken) => {
      cy.api({
        method: option.requestMethod.get,
        url: apiBaseURL + timerSearchEndPoint,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: architectAuthToken,
        },
        qs: {
          start: 0,
          search: leverageConstants.timerName,
        },
      }).then((timerIdDetails) => {
        expect(timerIdDetails.status, 'Verifying the status code').eql(200)
        expect(timerIdDetails.body, 'Verifying response body should have a property items').to.have.property('items')
        timerIdsToDelete = timerIdDetails.body.items
        const timerLists = timerIdsToDelete.map((elements) => elements.id)
        timerLists.forEach((id) => {
          cy.api({
            method: option.requestMethod.delete,
            url: apiBaseURL + timerEndPoint + `${id}`,
            failOnStatusCode: leverageConstants.failOnStatusCode,
            headers: {
              authorization: architectAuthToken,
            },
          }).then((res) => {
            if (res.status === 200) {
              expect(res.status, 'Verifying the status code').to.eql(200)
              cy.log(`timer ${leverageConstants.timerName} deleted from architecture`)
            } else {
              cy.log('unable to delete the timer')
            }
          })
        })
      })
    })
  }

  /**
   * This function is used to delete the existing alerts for given item name i.e asset, equipment or staff
   * @param {String} deviceName - Name of the device for which alerts needs to be cleared
   */
  static deleteAllAlerts = (deviceName) => {
    const baseEndPoint = APIEndpoints.baseEndpoint(system_Id, hospital_Id)
    const incidentSearchEndPoint = APIEndpoints.incidentSearchEndpoint
    const incidentPageEndPoint = APIEndpoints.incidentPageEndpoint(system_Id, hospital_Id)
    let incidentId
    this.loginToArchitect().then((architectAuthToken) => {
      cy.api({
        method: option.requestMethod.post,
        url: apiBaseURL + baseEndPoint + incidentSearchEndPoint,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: architectAuthToken,
        },
        body: {
          limit: 100,
          offset: 0,
          filter: {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'groupedText',
                value: `*${deviceName}*`,
              },
            ],
          },
          sort: [
            {
              field: 'created',
              order: 'desc',
            },
          ],
          nextToken: null,
        },
      }).then((incident) => {
        expect(incident.status, 'Verifying the response code').to.equal(200)
        expect(incident.body, 'Verifying response body should have property item').to.have.property('items')
        incidentId = incident.body.items
        //cy.log(incidentId)
        const incidentLists = incidentId.map((elements) => elements.id)
        //cy.log(incidentLists)
        incidentLists.forEach((id) => {
          cy.api({
            method: option.requestMethod.delete,
            failOnStatusCode: leverageConstants.failOnStatusCode,
            url: apiBaseURL + incidentPageEndPoint + `${id}`,
            headers: {
              authorization: architectAuthToken,
            },
            body: {
              deleteDevice: 'force',
            },
          }).then((res) => {
            if (res.status === 200) {
              expect(res.status, 'Verifying the response code').to.eql(200)
              cy.log(`Alerts related to ${deviceName} deleted successfully`)
            } else {
              cy.log('unable to delete alerts')
            }
          })
        })
      })
    })
  }
}
