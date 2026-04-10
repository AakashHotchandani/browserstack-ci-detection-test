/// <reference types="cypress" />
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import prosightSafety from '../../utils/selectors/prosightSafety'
import commandOptions from '../../utils/constants/commandOptions'
import { Verify } from '../../utils/assertions'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import globalSels from '../../utils/selectors/globalSels'
import userData from '../../fixtures/SignIn/user.json'
import SmartAlertsUsingAPI from '../prosightCore/triggeringAlerts'
import APIEndpoints from '../../../APIEndpoints'
import Type from '../../utils/Interactions/type'
import LoginPage from '../signIn/siginPage'
import smartAlertsManagementConst from '../../utils/constants/smartAlertsManagementConst'
import Click from '../../utils/Interactions/click'
let roomDetails
const system_Id = Cypress.env('SystemId')
const hospital_Id = Cypress.env('HospitalId')
const apiBaseURL = Cypress.env('API_BaseUrl')
const project_Id = Cypress.env('ProjectId')
const username = userData.username
const { departments, room, tag } = leverageConstants.objectTypes

const {
  unAcknowledgeButton,
  unacknowledgedFromSidePanelForRoomOvercapacityAlert,
  selectActionDropDown,
  searchBarOnFilter,
  sidePanelStaffName,
  alertTypeInSidePanel,
  acknowledgeFromSidePanel,
  unacknowledgedFromTable,
  unacknowledgedButtonOnPopup,
  unacknowledgedFromSidePanel,
  clearButtonOnTableView,
  clearAlertFromSidePanel,
  clearButtonOnPopUp,
} = prosightSafety.smartAlerts
const { staffTagOffline, tagLowBattery } =
  leverageConstants.alertTypes.staffAlertTypes.nonEmergencyAlert
const { staffEmergency } = leverageConstants.alertTypes.staffAlertTypes.emergencyAlert

const { clearAllButton, buttonTag, spanTag, labelTag, searchBar, sortOptionDialog, alertTypeBtn } = globalSels
const { apply, acknowledge, clearButton } = smartAlertsManagementConst.buttonsInnerText
const { alertTypeHeader, building, floor, location, staffIds, staffTypes, department, tagID, acknowledgedBy } =
  smartAlertsManagementConst.tableColumnHeaders
const { tableView, sidePanel, carousel } = smartAlertsManagementConst.actionPlace
const { enterComment } = prosightSafety.smartLocation
const { commentForAcknowledge } = smartAlertsManagementConst.comments
const { mobile, desktop } = globalSels.viewport

/** This class consists of different static functions related to smart alerts page
 * @class Safety_API
 */
export default class Safety_API {
  /**
   * Function which triggers staff related alerts
   * @param {String} staffName - Name of the staff against which alert need to be trigger
   * @param {String} alertType - Type of the staff alert i.e tagOffline, tagLowBattery etc
   */
  static triggerStaffAlerts = (staffName, alertType) => {
    let deviceId, timerId
    const staffBlueprintId = Cypress.env('StaffBlueprintId')
    const baseEndPoint = APIEndpoints.baseEndpoint(system_Id, hospital_Id)
    const timerEndPoint = APIEndpoints.timerEndpoint(project_Id)
    const staffSearchEndpoint = APIEndpoints.staffSearchEndpoint

    SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      cy.api({
        method: commandOptions.requestMethod.post,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        url: apiBaseURL + baseEndPoint + staffSearchEndpoint,
        headers: {
          authorization: architectAuthToken,
        },
        body: {
          limit: leverageConstants.staffSearchConstants.limit,
          offset: leverageConstants.staffSearchConstants.offset,
          filter: {
            type: leverageConstants.staffSearchConstants.type,
            operator: leverageConstants.staffSearchConstants.operator,
            conditions: [
              {
                type: leverageConstants.staffSearchConstants.conditionType,
                field: leverageConstants.staffSearchConstants.field,
                value: staffName,
                empty: leverageConstants.staffSearchConstants.empty,
                fieldType: leverageConstants.staffSearchConstants.fieldType,
              },
            ],
          },
          sort: [
            {
              field: leverageConstants.staffSearchConstants.sortField,
              order: leverageConstants.staffSearchConstants.order,
            },
          ],
          nextToken: leverageConstants.staffSearchConstants.nextToken,
        },
      }).then((deviceData) => {
        if (deviceData.status === 200) {
          expect(deviceData.status).eql(200)
          expect(deviceData.body).to.have.property('items')
          expect(deviceData.body.items).not.to.be.empty
          deviceId = deviceData.body.items[0].id
          cy.wrap(deviceId).as('deviceId')
          //cy.log(deviceId)
        } else {
          cy.log('Failed to fetch device id')
        }
      })
      cy.get('@deviceId').then((deviceId) => {
        let msg
        if (alertType === staffTagOffline) {
          msg = {
            blueprintId: staffBlueprintId,
            deviceId: deviceId,
            systemId: system_Id,
            projectId: project_Id,
            type: leverageConstants.alertTypeIds.staffTagOffline,
            data: [],
          }
        } else if (alertType === staffEmergency) {
          msg = {
            blueprintId: staffBlueprintId,
            deviceId: deviceId,
            systemId: system_Id,
            projectId: project_Id,
            data: [
              {
                path: 'tag/data/msgType',
                value: 'tagButton',
              },
            ],
          }
        }
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
              topic: leverageConstants.topic,
              message: msg,
            },
          },
        }).then((timerData) => {
          expect(timerData.status).eql(200)
          expect(timerData.body).to.have.property('id')
          timerId = timerData.body.id
          cy.wrap(timerId).as('createdTimerId')
        })
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
          if (res.status === 200) {
            expect(res.status).to.eql(200)
            cy.log(`${alertType} alert triggered successfully`)
          } else {
            cy.log('unable to trigger alert')
          }
        })
      })
    })
  }

  /**
   * This function is used to create staff type , then create staff and link the staff to te above created tag
   * @param {Object} staffDetails - object that contains staff data for staff creation (staffName, staffId, staffType, departmentName, departmentId)
   * @param {String} staffDetails.staffName - Name of the staff
   * @param {String} staffDetails.staffId - Id of the staff
   * @param {String} staffDetails.staffType - Type of the staff
   * @param {String} staffDetails.departmentName - Name of the department
   * @param {String} staffDetails.departmentId - Id of the department
   *
   */
  static createStaff = (staffDetails) => {
    const staffActionEndpoint = APIEndpoints.staffActionsEndpoint(system_Id, hospital_Id)
    const { staffName, staffId, staffType, departmentName } = staffDetails

    let staffDeviceId, tagsDeviceId, departmentId
    LoginPage.loginToApplication().then(({ authToken }) => {
      HelperFunction.search_API(departmentName, departments).then(({ authToken, Id }) => {
        departmentId = Id
        cy.api({
          method: leverageConstants.requestMethod.post,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          url: apiBaseURL + staffActionEndpoint,
          headers: {
            authorization: authToken,
          },
          body: {
            networkAliases: {
              staff: {
                name: staffName,
                deviceId: staffId,
              },
            },
            networkId: 'staff',
            name: staffName,
            data: [
              {
                path: 'staffType',
                value: staffType,
              },
              {
                path: 'name',
                value: staffName,
              },
              {
                path: 'staffId',
                value: staffId,
              },
              {
                path: 'assignedDepartment/id',
                value: departmentId,
              },
              {
                path: 'assignedDepartment/name',
                value: departmentName,
              },
            ],
          },
        }).then((staffDeviceData) => {
          expect(staffDeviceData.status).eql(200)
          //need to add assertions for checking creating staff name and remove this wrap and log items
          if (staffDeviceData.status === 200) {
            staffDeviceId = staffDeviceData.body.id
            cy.wrap(staffDeviceId).as('staffDeviceId')
            cy.log(staffDeviceId)
          } else {
            cy.log(`Failed to create staff ${staffName}`)
          }
        })
      })
    })
  }

  /**
   * This function is used to delete the Staff Emergency Carousel
   */
  static removeStaffEmergencyAlertCarousel = () => {
    const removeCarousel = APIEndpoints.removeStaffEmergencyAlertCarouselEndPoint(system_Id, hospital_Id)
    SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      cy.api({
        method: leverageConstants.requestMethod.put,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: architectAuthToken,
        },
        url: apiBaseURL + removeCarousel,
        body: [
          {
            path: 'openStaffDuressAlerts',
            value: null,
          },
        ],
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status).to.equal(200)
        } else {
          cy.log('Failed to remove carousel')
        }
      })
    })
  }

  /**
   * This function is used to apply the alert type filter
   * @param {string} alertType - Type of the alert that you need to do actions on
   * @param {string} [viewport=desktop] - The viewport setting, with a default value of 'desktop'.
   */
  static selectAlertTypeFromFilter = (alertType, viewport = desktop) => {
    const {
      filterLabels,
      tagOfflineFilter,
      tagLowBatteryFilter,
      staffEmergencyFilter,
    } = prosightSafety.smartAlerts

    if (viewport === desktop) {
      //clearing any applied filter first
      cy.get(clearAllButton).then(($button) => {
        const isDisabled = $button.is(':disabled')

        if (isDisabled) {
          expect($button).is.disabled
        } else {
          cy.wrap($button).click()
        }
      })
      cy.get(clearAllButton).should('be.visible')
      cy.reload()
      //applying the required alert filter
      cy.get(filterLabels).contains(alertTypeHeader).next().click(commandOptions.force)
      Verify.elementContainingText(spanTag, apply).parentElementIsDisabled()
      cy.get(searchBarOnFilter).type(alertType)
    } else if (viewport === mobile) {
      Click.forcefullyOn(alertTypeBtn)
      cy.get(sortOptionDialog).find(searchBar).should('be.enabled').type(alertType)
    }

    if (alertType === staffTagOffline) {
      cy.get(tagOfflineFilter).check(commandOptions.force)
    } else if (alertType === tagLowBattery) {
      cy.get(tagLowBatteryFilter).check(commandOptions.force)
    } else if (alertType === staffEmergency) {
      cy.get(staffEmergencyFilter).check(commandOptions.force)
    }
    //need to add one assertion here for button active
    cy.contains(spanTag, apply).click(commandOptions.force)
  }

  /**
   * This function is used to perform acknowledge functions on alerts
   * @param {object} staffInfo - Object that contains staffName, staffId, floorName, departmentName, locationName, for performing actions
   * @param {object} staffInfo.staffName - Name of the staff
   * @param {object} staffInfo.staffId - Id of the staff
   * @param {object} staffInfo.staffType - Type of the staff
   * @param {object} staffInfo.floorName - Name of the Floor
   * @param {object} staffInfo.departmentName - Name of the Department
   * @param {object} staffInfo.deviceId - Id of the Device
   * @param {object} staffInfo.locationName - Name of the room
   * @param {object} staffInfo.buildingName - Name of the Building
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {boolean} withinSmartAlerts True if acknowledging from smart alerts submodule page.
   */
  static acknowledgeAlert = (staffInfo, alertAction, typeOfAlert, withinSmartAlerts = true) => {
    const { staffName, staffType, staffId, floorName, departmentName, deviceId, locationName, buildingName } = staffInfo
    const values = { staffName, staffId, floorName, locationName, typeOfAlert }
    const valuesForRoomExitAlert = { staffName, staffId, floorName, typeOfAlert }

    const sidePanelData = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
      'Assigned Department': departmentName,
      'Tag ID': deviceId,
    }
    const sidePanelData1 = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      Location: locationName,
      'Tag ID': deviceId,
    }
    //Search Staff name
    HelperFunction.search(staffName, false)
    HelperFunction.getRowByItemName(staffName, globalSels.resultRow, 'staff-alerts').as('data1')
    if (withinSmartAlerts) {
      HelperFunction.verifyValuesExist('@data1', values)
    }
    //Performing action on table view
    if (alertAction === tableView) {
      Click.onButton('@data1', selectActionDropDown)
      cy.contains(acknowledge).click(commandOptions.force)
      cy.contains(buttonTag, acknowledge).click(commandOptions.force)
    }
    //Performing action on side panel
    else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(sidePanelStaffName).hasText(staffName)
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      //Verifying data on side panel

      if (!withinSmartAlerts) {
        HelperFunction.verifyValueFromSidePanel(sidePanelData1, globalSels.sidePanel)
      } else {
        HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      }
      //Acknowledge Alert
      cy.get(acknowledgeFromSidePanel).click(commandOptions.force)
      if (typeOfAlert === staffEmergency) {
        Verify.theElement(enterComment).isVisible()
        Type.theText(commentForAcknowledge).into(enterComment)
        cy.contains(buttonTag, acknowledge).click(commandOptions.force)
      } else {
        cy.contains(buttonTag, acknowledge).click(commandOptions.force)
      }
    }
  }

  /**
   * This function is used to perform unacknowledged functions on alerts
   * @param {Object} staffInfo - Object that contains staffName, staffId, floorName, departmentName, locationName, for performing actions
   * @param {object} staffInfo.staffName - Name of the staff
   * @param {object} staffInfo.staffType - Type of the staff
   * @param {object} staffInfo.staffId - Id of the staff
   * @param {object} staffInfo.floorName - Name of the Floor
   * @param {object} staffInfo.departmentName - Name of the Department
   * @param {object} staffInfo.deviceId - Id of the Device
   * @param {object} staffInfo.locationName - Name of the room
   * @param {object} staffInfo.buildingName - Name of the Building
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} alertAction - Place where alert action needs to be made
   */
  static unAcknowledgedAlert = (staffInfo, typeOfAlert, alertAction) => {
    const { staffName, staffId, staffType, buildingName, floorName, locationName, departmentName } = staffInfo
    const values = { staffName, staffId, typeOfAlert, username }
    const sidePanelData = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
      'Resolved By': username,
      'Assigned Department': departmentName,
    }
    //Search staff name
    HelperFunction.search(staffName, false)
    HelperFunction.getRowByItemName(staffName, globalSels.resultRow, 'staff-alerts').as('data1')
    HelperFunction.verifyValuesExist('@data1', values)
    //Performing action on table view
    if (alertAction === tableView) {
      cy.wait(2000)
      Click.onButton('@data1', unacknowledgedFromTable)
      Verify.theElement(unacknowledgedButtonOnPopup).isEnabled()
      cy.get(unacknowledgedButtonOnPopup).click(commandOptions.force)
    }
    //Performing action on side panel
    else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(sidePanelStaffName).hasText(staffName)
      Verify.theElement(unacknowledgedFromSidePanel).isEnabled()
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      Verify.theElement(unacknowledgedFromSidePanel).isEnabled()
      cy.wait(2000)
      cy.get(unacknowledgedFromSidePanel).click(commandOptions.force).click(commandOptions.force)
      Verify.theElement(unacknowledgedButtonOnPopup).isEnabled()
      cy.get(unacknowledgedButtonOnPopup).click(commandOptions.force)
    }
  }

  /**
   * This function is used to clear alerts
   * @param {object} staffInfo - Object that contains staffName, staffId, floorName, departmentName, locationName, for performing actions
   * @param {object} staffInfo.staffName - Name of the staff
   * @param {object} staffInfo.staffType - Type of the staff
   * @param {object} staffInfo.staffId - Id of the staff
   * @param {object} staffInfo.floorName - Name of the Floor
   * @param {object} staffInfo.departmentName - Name of the Department
   * @param {object} staffInfo.deviceId - Id of the Device
   * @param {object} staffInfo.locationName - Name of the room
   * @param {object} staffInfo.buildingName - Name of the Building
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} deviceId It is te id of the device
   * @param {boolean} withinSmartAlerts True if clearing from smart alerts submodule page.
   */
  static clearAlert = (staffInfo, alertAction, typeOfAlert, withinSmartAlerts = true) => {
    const { staffName, staffId, floorName, deviceId, departmentName, locationName, staffType, buildingName } = staffInfo
    const values = { staffName, staffId, floorName, locationName, typeOfAlert }
    const valuesForRoomExitAlert = { staffName, staffId, floorName, typeOfAlert }
    const sidePanelData = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
      'Assigned Department': departmentName,
      'Tag ID': deviceId,
    }
    const sidePanelData1 = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      Location: locationName,
      'Tag ID': deviceId,
    }
    //Search Staff Name
    HelperFunction.search(staffName, false)
    HelperFunction.getRowByItemName(staffName, globalSels.resultRow, 'staff-alerts').as('data1')
    if (withinSmartAlerts) {
      HelperFunction.verifyValuesExist('@data1', values)
    }
    //Performing actions on table view
    if (alertAction === tableView) {
      Click.onButton('@data1', selectActionDropDown)
      cy.get(clearButtonOnTableView).contains(clearButton).click(commandOptions.force)
      cy.get(clearButtonOnPopUp).click(commandOptions.force)
    }
    //Performing actions in side panel
    else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(sidePanelStaffName).hasText(staffName)
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      if (withinSmartAlerts) {
        HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      } else {
        HelperFunction.verifyValueFromSidePanel(sidePanelData1, globalSels.sidePanel)
      }
      cy.get(clearAlertFromSidePanel).click(commandOptions.force)
    }
    //Clear alert
    cy.get(clearButtonOnPopUp).click(commandOptions.force)
  }
}
