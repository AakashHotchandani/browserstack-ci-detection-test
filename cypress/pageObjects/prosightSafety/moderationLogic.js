import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import commandOptions from '../../utils/constants/commandOptions'
import globalSels from '../../utils/selectors/globalSels'
import prosightSafety from '../../utils/selectors/prosightSafety'
import prosightCore from '../../utils/selectors/prosightCore'
import safetySmartAlerts from '../../utils/constants/prosightSafety/safetySmartAlerts'
import { Verify } from '../../utils/assertions'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import APIEndpoints from '../../../APIEndpoints'
import SmartAlertsUsingAPI from '../prosightCore/triggeringAlerts'

const apiBaseURL = Cypress.env('API_BaseUrl')
const project_Id = Cypress.env('ProjectId')
const { divTag } = globalSels

/** This class consists of different static functions related to moderation login for alerts
 * @class Asset_API
 */
export default class Moderation_Logic {
  /**
   * Unified function to verify alert data in table view
   * @param {Object} valuesToVerifyInTableView - Object containing details for verification
   * @param {String} typeOfAlert - Type of the alert
   */
  static verifyAlertData = (valuesToVerifyInTableView, typeOfAlert) => {
    let finalValuesToVerifyInTableView = { typeOfAlert }
    let searchTerm = ''
    const resultRowType = 'alerts'

    // Determine the item type and prepare final values for verification
    if (valuesToVerifyInTableView.hasOwnProperty('staffName') || valuesToVerifyInTableView.hasOwnProperty('staffId')) {
      // Handle staff alerts
      const { staffName, staffId, floorName, locationName } = valuesToVerifyInTableView
      finalValuesToVerifyInTableView = { staffName, staffId, floorName, locationName, typeOfAlert }
      searchTerm = staffName || locationName

      if (typeOfAlert === leverageConstants.alertTypes.staffAlertTypes.nonEmergencyAlert.roomOvercapacity) {
        finalValuesToVerifyInTableView = { floorName, staffId, locationName, typeOfAlert }
        searchTerm = locationName
      }
    } else if (valuesToVerifyInTableView.hasOwnProperty('assetName') || valuesToVerifyInTableView.hasOwnProperty('assetId')) {
      // Handle asset alerts
      const { assetName, assetId, floorName, locationName, departmentName } = valuesToVerifyInTableView
      if (typeOfAlert === 'Shrinkage') {
        typeOfAlert = 'Asset Exited Building'
      }
      if (typeOfAlert === leverageConstants.alertTypes.assetAlertTypes.parAlerts.criticallyUnderPAR || typeOfAlert === leverageConstants.alertTypes.assetAlertTypes.parAlerts.underPar || typeOfAlert === leverageConstants.alertTypes.assetAlertTypes.parAlerts.stockedOut) {
           finalValuesToVerifyInTableView={assetName,assetId,typeOfAlert}
         }else{
      finalValuesToVerifyInTableView = { assetName, assetId, floorName, locationName, departmentName, typeOfAlert }
         }
      searchTerm = assetName
    } else if (valuesToVerifyInTableView.hasOwnProperty('equipmentName') || valuesToVerifyInTableView.hasOwnProperty('id')) {
      // Handle equipment alerts
      const { equipmentName, id, departmentName } = valuesToVerifyInTableView
      finalValuesToVerifyInTableView = { equipmentName, id, departmentName, typeOfAlert }
      searchTerm = equipmentName
    }

    // Perform search and verification based on the determined item type
    cy.get(prosightSafety.smartAlerts.searchBar).clear().type(`${searchTerm}${commandOptions.enter}`)
    cy.reload()
    HelperFunction.getRowByItemName(searchTerm, globalSels.resultRow, resultRowType).as('data1')
    HelperFunction.verifyValuesExist('@data1', finalValuesToVerifyInTableView)
  }

  /**
   * This function is used to verify the count of the alert on the page
   * @param {Number} n - Number of alert present on the screen
   */
  static verifyTheAlertCount = (n) => {
    HelperFunction.getNumPagination(prosightCore.floorPlanManagement.pagination).then((count) => {
      if (count === 0) {
        if (n === 0) {
          Verify.elementContainingText(divTag).isVisibleAndContains(safetySmartAlerts.noAlerts)
          cy.log('No alert exists')
        } else {
          cy.log(`${n} alert exists assertion fail`)
          Verify.theElement(divTag).isVisibleAndContains(safetySmartAlerts.noAlerts)
        }
      } else if (count === n) {
        expect(count).to.eql(n)
        cy.log(`${n} alert exists`)
      }
    })
  }

  /**
   * Function that move an asset back to hospital location
   * @param {String} deviceId - Tag Id for which you need to move back to location
   */
  static moveAssetBackToLocation = (deviceId) => {
    SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      const timerEndPoint = APIEndpoints.timerEndpoint(project_Id)
      cy.api({
        method: commandOptions.requestMethod.post,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: architectAuthToken,
        },
        url: apiBaseURL + timerEndPoint,
        body: {
          name: leverageConstants.timerName,
          timer: {
            type: leverageConstants.timerType,
            delay: leverageConstants.delay,
          },
          action: {
            type: leverageConstants.type,
            topic: leverageConstants.moveTagToLocationType,
            message: {
              beaconName: deviceId,
              blufiId: '0',
              blufiName: 'dev table ',
              eventUuid: '0264e5f8-fe49-476b-531e-606c002503ba',
              metricType: 'PRESENCE',
              namespace: 'BEACON',
              newState: 'OK',
              oldState: 'VIOLATING',
              policyId: 263052,
              policyName: 'LGMC:10-1039_AC',
              projectId: 47423,
              shopperTrackEventId: 0,
              timestamp: new Date().getTime(),
              timestampCleared: new Date().getTime(),
              uniqueDeviceId: deviceId,
              value: JSON.stringify({ c: 82, d: deviceId, t: 54504215, v: 82 }),
            },
          },
        },
      }).then((timerData) => {
        expect(timerData.status).eql(200)
        expect(timerData.body).to.have.property('id')
        let timerId = timerData.body.id
        cy.wrap(timerId).as('createdTimerId')
      })

      cy.get('@createdTimerId').then((timerId) => {
        cy.api({
          method: commandOptions.requestMethod.put,
          url: apiBaseURL + timerEndPoint + `${timerId}/start`,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          headers: {
            authorization: architectAuthToken,
          },
        }).then((res) => {
          expect(res.status).to.eql(200)
        })
      })
    })
  }
}
