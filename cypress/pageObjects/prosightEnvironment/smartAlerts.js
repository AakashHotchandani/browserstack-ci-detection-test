/// <reference types="cypress" />
import SmartAlertsUsingAPI from '../prosightCore/triggeringAlerts'
import APIEndpoints from '../../../APIEndpoints'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import prosightEnvironment from '../../utils/selectors/prosightEnvironment'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import commandOptions from '../../utils/constants/commandOptions'
import { Verify } from '../../utils/assertions'
import globalSels from '../../utils/selectors/globalSels'
import constants from '../../utils/constants/prosightSafety/smartLocation'
import Click from '../../utils/Interactions/click'
import Type from '../../utils/Interactions/type'
import smartAlertsManagementConst from '../../utils/constants/smartAlertsManagementConst'
import equipmentAlertData from '../../fixtures/prosightEnvironment/equipmentAlertData.json'

const apiBaseURL = Cypress.env('API_BaseUrl')
const hospital_Id = Cypress.env('HospitalId')
const project_Id = Cypress.env('ProjectId')
const system_Id = Cypress.env('SystemId')
const apiKey = Cypress.env('API_Key')
const secret = Cypress.env('Secret')
const building_Name = Cypress.env('BuildingName')
const building_ID = Cypress.env('BuildingId')

const { calibrationDueIn10Days, calibrationDueIn30Days, calibrationDueIn5Days, calibrationDueIn60Days } =
  leverageConstants.alertTypes.environmentalAlerts.calibrationDue
const { sensorLowBattery, sensorOffline, equipmentRentalDue, inspectionOverdue, humidityOutOfRange, temperatureOutOfRange, temperatureWarning } =
  leverageConstants.alertTypes.environmentalAlerts
const { equipment, sensor, departments, floors, room } = leverageConstants.objectTypes
const { building, floor, department, acknowledgedBy, alertTypeHeader, equipmentType, location, sensorID, assignedDepartment } =
  smartAlertsManagementConst.tableColumnHeaders
const { apply, save, escalate, clearButton, create, complete, comment, createTask } = smartAlertsManagementConst.buttonsInnerText
const { tableView, sidePanel, carousel } = smartAlertsManagementConst.actionPlace
const { acknowledge, acknowledgeTitle } = smartAlertsManagementConst
const { commentForAcknowledge, commentForEditedTask, commentForTask } = smartAlertsManagementConst.comments
const { alertTypeBtn, sortOptionDialog, searchBar } = globalSels
const { desktop, mobile } = globalSels.viewport

/** This class consists of different static functions related to smart alerts page
 * @class IEM_SmartAlerts
 */
export default class IEM_SmartAlerts {
  /**
   * Fetches the device ID for the given equipment name.
   *
   * This method logs into the Architect API, performs an equipment search
   * filtered by the provided name, and returns the first matching device ID.
   *
   * @param {string} equipmentName - The name of the equipment to search for.
   */
  static fetchDeviceIdByEquipmentName = (equipmentName) => {
    return SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      const searchEndpoint = APIEndpoints.equipmentSearchEndpoint
      const baseEndPoint = APIEndpoints.baseEndpoint(system_Id, hospital_Id)
      let deviceId
      return cy
        .api({
          method: leverageConstants.requestMethod.post,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          url: apiBaseURL + baseEndPoint + searchEndpoint,
          body: {
            limit: 100,
            offset: 0,
            filter: {
              type: 'logical',
              operator: 'and',
              conditions: [
                {
                  type: 'equals',
                  field: 'data/name',
                  value: [equipmentName],
                  empty: false,
                  fieldType: 'string',
                },
              ],
            },
            sort: [
              {
                field: 'lastModified',
                order: 'desc',
              },
            ],
            nextToken: null,
          },
          headers: {
            authorization: architectAuthToken,
          },
        })
        .then((deviceData) => {
          expect(deviceData.status).eql(200)
          deviceId = deviceData.body.items[0].id
          // cy.wrap(deviceId).as('deviceId')

          cy.log('deviceID', deviceId)
          return cy.wrap({ deviceId })
        })
    })
  }

  /**
   *This function is used to login to leverage create timer and trigger the alerts
   * @param {Object} equipmentDetails , this object consists of all equipment details required for triggering alerts
   * @param {String} equipmentDetails.equipmentName , this parameter consists of the name for an Equipment
   * @param {String} equipmentDetails.type , this parameter consists of the name for the type of an equipment
   * @param {String} equipmentDetails.floorName , this parameter consists of the name of the floor where the equipment is located.
   * @param {String} equipmentDetails.departmentName , this parameter consists of the nameo fthe department to which the equipment is assigned.
   * @param {String} equipmentDetails.locationName , this parameter consists of the name of the specific location of the equipment.
   * @param {String} equipmentDetails.id , this parameter consists of the ID of an equipment
   * @param {String} alertType , this parameter consists of type of alert that needs to be triggered
   * @param {String} sensorID , this parameter consists of sensor Id that is linked to an equipment
   */
  static TriggerAlerts = (equipmentDetails, alertType, sensorID, deviceId) => {
    const { equipmentName, type, id, departmentName, locationName, floorName, floorId, departmentId, locationId } = equipmentDetails
    const environmentBlueprintId = Cypress.env('EnvironmentBlueprintId')
    const timerEndPoint = APIEndpoints.timerEndpoint(project_Id)
    let timerId

    SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      let msg
      if (alertType === sensorOffline) {
        msg = {
          alertPriority: 9,
          alertType: leverageConstants.alertTypeIds.sensorOffline,
          application: leverageConstants.application.environment,
          blueprintId: environmentBlueprintId,
          deviceExternalId: id,
          deviceHardwareExternalId: sensorID,
          deviceId: deviceId,
          deviceName: equipmentName,
          deviceType: type,
          objectType: leverageConstants.objectTypes.equipment,
          projectId: project_Id,
          systemId: system_Id,
          templateId: leverageConstants.templateId.sensorOffline,
          time: new Date().getTime(),
          type: leverageConstants.alertMessage,
          deviceLocation: {
            building: {
              id: building_ID,
              name: building_Name,
            },
            department: {
              id: departmentId,
              name: departmentName,
            },
            floor: {
              id: floorId,
              name: floorName,
            },
            room: {
              id: locationId,
              name: locationName,
            },
          },
        }
      } else if (alertType === inspectionOverdue) {
        msg = {
          blueprintId: environmentBlueprintId,
          deviceId: deviceId,
          systemId: system_Id,
          projectId: project_Id,
          data: [
            {
              path: 'inspection/status',
              value: 'Overdue',
            },
          ],
        }
      } else if (alertType === calibrationDueIn5Days) {
        msg = {
          alertPriority: 5,
          alertType: calibrationDueIn5Days,
          application: leverageConstants.application.environment,
          blueprintId: environmentBlueprintId,
          deviceExternalId: id,
          deviceHardwareExternalId: sensorID,
          deviceId: deviceId,
          deviceName: equipmentName,
          deviceType: type,
          objectType: leverageConstants.objectTypes.equipment,
          projectId: project_Id,
          systemId: system_Id,
          templateId: leverageConstants.templateId.calibrationDue,
          time: new Date().getTime(),
          type: leverageConstants.alertMessage,
          deviceLocation: {
            building: {
              id: building_ID,
              name: building_Name,
            },
            department: {
              id: departmentId,
              name: departmentName,
            },
            floor: {
              id: floorId,
              name: floorName,
            },
            room: {
              id: locationId,
              name: locationName,
            },
          },
        }
      } else if (alertType === calibrationDueIn10Days) {
        msg = {
          alertPriority: 5,
          alertType: calibrationDueIn10Days,
          application: leverageConstants.application.environment,
          blueprintId: environmentBlueprintId,
          deviceExternalId: id,
          deviceHardwareExternalId: sensorID,
          deviceId: deviceId,
          deviceName: equipmentName,
          deviceType: type,
          objectType: leverageConstants.objectTypes.equipment,
          projectId: project_Id,
          systemId: system_Id,
          templateId: leverageConstants.templateId.calibrationDue,
          time: new Date().getTime(),
          type: leverageConstants.alertMessage,
          deviceLocation: {
            building: {
              id: building_ID,
              name: building_Name,
            },
            department: {
              id: departmentId,
              name: departmentName,
            },
            floor: {
              id: floorId,
              name: floorName,
            },
            room: {
              id: locationId,
              name: locationName,
            },
          },
        }
      } else if (alertType === calibrationDueIn30Days) {
        msg = {
          alertPriority: 5,
          alertType: calibrationDueIn30Days,
          application: leverageConstants.application.environment,
          blueprintId: environmentBlueprintId,
          deviceExternalId: id,
          deviceHardwareExternalId: sensorID,
          deviceId: deviceId,
          deviceName: equipmentName,
          deviceType: type,
          objectType: leverageConstants.objectTypes.equipment,
          projectId: project_Id,
          systemId: system_Id,
          templateId: leverageConstants.templateId.calibrationDue,
          time: new Date().getTime(),
          type: leverageConstants.alertMessage,
          deviceLocation: {
            building: {
              id: building_ID,
              name: building_Name,
            },
            department: {
              id: departmentId,
              name: departmentName,
            },
            floor: {
              id: floorId,
              name: floorName,
            },
            room: {
              id: locationId,
              name: locationName,
            },
          },
        }
      } else if (alertType === calibrationDueIn60Days) {
        msg = {
          alertPriority: 5,
          alertType: calibrationDueIn60Days,
          application: leverageConstants.application.environment,
          blueprintId: environmentBlueprintId,
          deviceExternalId: id,
          deviceHardwareExternalId: sensorID,
          deviceId: deviceId,
          deviceName: equipmentName,
          deviceType: type,
          objectType: leverageConstants.objectTypes.equipment,
          projectId: project_Id,
          systemId: system_Id,
          templateId: leverageConstants.templateId.calibrationDue,
          time: new Date().getTime(),
          type: leverageConstants.alertMessage,
          deviceLocation: {
            building: {
              id: building_ID,
              name: building_Name,
            },
            department: {
              id: departmentId,
              name: departmentName,
            },
            floor: {
              id: floorId,
              name: floorName,
            },
            room: {
              id: locationId,
              name: locationName,
            },
          },
        }
      } else if (alertType === equipmentRentalDue) {
        msg = {
          alertPriority: 6,
          alertType: equipmentRentalDue,
          application: leverageConstants.application.environment,
          blueprintId: environmentBlueprintId,
          deviceExternalId: id,
          deviceHardwareExternalId: sensorID,
          deviceId: deviceId,
          deviceName: equipmentName,
          deviceType: type,
          objectType: leverageConstants.objectTypes.equipment,
          projectId: project_Id,
          systemId: system_Id,
          templateId: leverageConstants.templateId.equipmentRentalDue,
          time: new Date().getTime(),
          type: leverageConstants.alertMessage,
          deviceLocation: {
            building: {
              id: building_ID,
              name: building_Name,
            },
            department: {
              id: departmentId,
              name: departmentName,
            },
            floor: {
              id: floorId,
              name: floorName,
            },
            room: {
              id: locationId,
              name: locationName,
            },
          },
        }
      }

      cy.api({
        method: leverageConstants.requestMethod.post,
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
            topic: topic,
            message: msg,
          },
        },
      }).then((TimerData) => {
        expect(TimerData.status).eql(200)
        expect(TimerData.body, 'Verifying existence of timer id property').to.have.property('id')
        timerId = TimerData.body.id
        cy.api({
          method: leverageConstants.requestMethod.put,
          url: apiBaseURL + timerEndPoint + `${timerId}/start`,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          headers: {
            authorization: architectAuthToken,
          },
        }).then((data) => {
          expect(data.status, 'Verifying status code').eql(200)
          cy.log(`${alertType} triggered successfully`)
        })
      })
    })
  }

  /**
   * This function is used to apply the alert type filter
   * @param {string} alertType - Type of the alert that you need to do actions on
   * @param {string} [viewport=desktop] - The viewport setting, with a default value of 'desktop'.
   */
  static selectAlertTypeFromFilter = (alertType, viewport = desktop) => {
    //please use object destructuring for all
    if (viewport === desktop) {
      cy.get(globalSels.clearAllButton).then(($button) => {
        const isDisabled = $button.is(':disabled')

        if (isDisabled) {
          expect($button).is.disabled
        } else {
          cy.wrap($button).click()
        }
      })
      cy.reload()
      cy.get(prosightEnvironment.smartAlerts.filterLabels).contains(alertTypeHeader).next().click(commandOptions.force)
      Verify.elementContainingText(globalSels.button, apply).parentElementIsDisabled()
      cy.get(prosightEnvironment.smartAlerts.searchBarOnFilter).type(alertType)
    } else if (viewport === mobile) {
      Click.forcefullyOn(alertTypeBtn)
      cy.get(sortOptionDialog).find(searchBar).type(alertType)
    }
    if (alertType === sensorOffline) {
      cy.get(prosightEnvironment.smartAlerts.sensorOfflineFilter).click(commandOptions.force)
    } else if (alertType === sensorLowBattery) {
      cy.get(prosightEnvironment.smartAlerts.sensorLowBatteryFilter).click(commandOptions.force)
    } else if (alertType === calibrationDueIn5Days) {
      cy.get(prosightEnvironment.smartAlerts.calibrationDueIn5DayFilter).click(commandOptions.force)
    } else if (alertType === calibrationDueIn10Days) {
      cy.get(prosightEnvironment.smartAlerts.calibrationDueIn10DayFilter).click(commandOptions.force)
    } else if (alertType === calibrationDueIn30Days) {
      cy.get(prosightEnvironment.smartAlerts.calibrationDueIn30DayFilter).click(commandOptions.force)
    } else if (alertType === calibrationDueIn60Days) {
      cy.get(prosightEnvironment.smartAlerts.calibrationDueIn60DayFilter).click(commandOptions.force)
    } else if (alertType === equipmentRentalDue) {
      cy.get(prosightEnvironment.smartAlerts.rentalDue).click(commandOptions.force)
    } else if (alertType === inspectionOverdue) {
      cy.get(prosightEnvironment.smartAlerts.inspectionDue).click(commandOptions.force)
    } else if (alertType === temperatureOutOfRange) {
      cy.get(prosightEnvironment.smartAlerts.temperatureOutRange).click(commandOptions.force)
    } else if (alertType === temperatureWarning) {
      cy.get(prosightEnvironment.smartAlerts.temperatureWarning).click(commandOptions.force)
    } else if (alertType === humidityOutOfRange) {
      cy.get(prosightEnvironment.smartAlerts.humidityOutOfRange).click(commandOptions.force)
    }

    cy.get(prosightEnvironment.smartAlerts.labels).contains(apply).click(commandOptions.force)
  }

  /**
   * This function is used to perform acknowledge functions on alerts
   * @param {object} valuesToVerify - Object that contains equipmentName, id, floorName, departmentName, locationName, for performing actions
   * @param {string} valuesToVerify.equipmentName ,required name for an equipment
   * @param {string} valuesToVerify.type , required type for an equipment
   * @param {string} valuesToVerify.id , required id for an equipment
   * @param {string} valuesToVerify.departmentName,required departmentName for an equipment
   * @param {string} valuesToVerify.floorName,required floorName for an equipment
   * @param {string} valuesToVerify.locationName,required locationName for an equipment
   * @param {string} valuesToVerify.buildingName ,required buildingName for an equipment
   * @param {string} actionType - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} sensorId It is te id of the device
   */
  static acknowledgeAlert = (valuesToVerify, actionType, typeOfAlert, sensorId) => {
    const { equipmentName, type, id, floorName, departmentName, locationName, buildingName } = valuesToVerify
    const finalValuesToVerifyInTableView = { equipmentName, id, departmentName, typeOfAlert }
    //Data to verify on side panel
    let sidePanelData = {
      'Equipment Type': type,
      'Sensor ID': sensorId,
      Building: buildingName,
      'Assigned Owner': departmentName,
      Floor: floorName,
      Location: locationName,
    }
    //search equipment name
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, globalSels.resultRow, 'equipment-alerts').as('data1')
    //Verify data on table view
    HelperFunction.verifyValuesExist('@data1', finalValuesToVerifyInTableView)
    //Action on table view
    if (actionType === tableView) {
      Click.onButton('@data1', prosightEnvironment.smartAlerts.selectActionDropDown)
      cy.contains(acknowledge).click(commandOptions.force)
    }
    //Action on side panel
    else if (actionType === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(prosightEnvironment.smartAlerts.sidePanelEquipmentName).hasText(equipmentName)
      Verify.theElement(prosightEnvironment.smartAlerts.alertTypeInSidePanel).hasText(typeOfAlert)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      cy.get(prosightEnvironment.smartAlerts.acknowledgeFromSidePanel).click(commandOptions.force)
    }
    //Acknowledge the alert
    cy.get(prosightEnvironment.smartAlerts.acknowledgeTitle).should('have.text', acknowledgeTitle)
    cy.get(prosightEnvironment.smartAlerts.acknowledgeComment).click(commandOptions.force).type(commentForAcknowledge)
    cy.get(prosightEnvironment.smartAlerts.labels).contains(acknowledge).click(commandOptions.force)
  }

  /**
   *
   * This function is used to perform create task functions on alerts
   * @param {object} valuesToVerify - Object that contains equipmentName, id, floorName, departmentName, locationName, for performing actions
   * @param {string} valuesToVerify.equipmentName ,required name for an equipment
   * @param {string} valuesToVerify.type , required type for an equipment
   * @param {string} valuesToVerify.id , required id for an equipment
   * @param {string} valuesToVerify.departmentName,required departmentName for an equipment
   * @param {string} valuesToVerify.floorName,required floorName for an equipment
   * @param {string} valuesToVerify.locationName,required locationName for an equipment
   * @param {string} valuesToVerify.buildingName ,required buildingName for an equipment
   * @param {string} actionType - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} sensorId It is te id of the device
   */
  static createTask = (valuesToVerify, actionType, typeOfAlert, sensorId) => {
    const { equipmentName, type, id, floorName, departmentName, locationName, buildingName } = valuesToVerify
    const finalValuesToVerifyInTableView = { equipmentName, id, departmentName, typeOfAlert }
    //Data to verify on side panel
    let sidePanelData = {
      'Equipment Type': type,
      'Sensor ID': sensorId,
      Building: buildingName,
      'Assigned Owner': departmentName,
      Floor: floorName,
      Location: locationName,
    }
    //Search equipment name
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, globalSels.resultRow, 'equipment-alerts').as('data1')
    //Verify data on table view
    HelperFunction.verifyValuesExist('@data1', finalValuesToVerifyInTableView)
    //Action on table view
    if (actionType === tableView) {
      Click.onButton('@data1', prosightEnvironment.smartAlerts.selectActionDropDown)
      cy.contains(createTask).click(commandOptions.force)
    }
    //Action on side panel
    else if (actionType === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(prosightEnvironment.smartAlerts.sidePanelEquipmentName).hasText(equipmentName)
      Verify.theElement(prosightEnvironment.smartAlerts.alertTypeInSidePanel).hasText(typeOfAlert)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      cy.get(prosightEnvironment.smartAlerts.createTaskFromSidePanel).click(commandOptions.force)
    }
    //Create task
    cy.get(prosightEnvironment.smartAlerts.commentForCreatingTask).click().type(commentForTask)
    cy.get(prosightEnvironment.smartAlerts.labels).contains(create).click(commandOptions.force)
  }

  /**
   * This function is used to perform unacknowledged functions on alerts
   * @param {Object} equipmentInfo - Object that contains equipmentName, id, floorName, departmentName, locationName, for performing actions
   * @param {string} equipmentInfo.equipmentName,required name for an equipment
   * @param {string} equipmentInfo.type , required type for an equipment
   * @param {string} equipmentInfo.id , required id for an equipment
   * @param {string} equipmentInfo.floorName,required floorName for an equipment
   * @param {string} equipmentInfo.locationName,required locationName for an equipment
   * @param {string} equipmentInfo.buildingName ,required buildingName for an equipment
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} actionType - Place where alert action needs to be made
   * @param {string} username - Name of the user that made actions on the alert
   */
  static unacknowledgedAlert = (equipmentInfo, typeOfAlert, actionType, username) => {
    const { equipmentName, type, id, floorName, locationName, buildingName } = equipmentInfo
    let values = { equipmentName, id, typeOfAlert, username }
    //data to verify on side panel
    let sidePanelData = {
      'Equipment Type': type,
      Building: buildingName,
      'Acknowledged By': username,
      Floor: floorName,
      Location: locationName,
    }
    //Search equipment name
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, globalSels.resultRow, 'equipment-alerts').as('data1')
    //Verify data on table view
    HelperFunction.verifyValuesExist('@data1', values)
    //Action on table view
    if (actionType === tableView) {
      cy.wait(2000)
      Click.onButton('@data1', prosightEnvironment.smartAlerts.unacknowledgedFromTable)
    }
    //Action on side panel
    else if (actionType === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(prosightEnvironment.smartAlerts.sidePanelEquipmentName).hasText(equipmentName)
      Verify.theElement(prosightEnvironment.smartAlerts.unacknowledgedFromSidePanel).isEnabled()
      Verify.theElement(prosightEnvironment.smartAlerts.alertTypeInSidePanel).hasText(typeOfAlert)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      Verify.verifySidePanels(globalSels.sidePanel, comment).verifyDataInSidePanel(commentForAcknowledge)
      Verify.theElement(prosightEnvironment.smartAlerts.unacknowledgedFromSidePanel).isEnabled()
      cy.wait(2000)
      cy.get(prosightEnvironment.smartAlerts.unacknowledgedFromSidePanel).click(commandOptions.force).click(commandOptions.force)
    }
    //Unacknowledged alert
    Verify.theElement(prosightEnvironment.smartAlerts.unacknowledgedButtonOnPopup).isEnabled()
    cy.get(prosightEnvironment.smartAlerts.unacknowledgedButtonOnPopup).click(commandOptions.force)
  }

  /**
   * This function is used to edit the create task on the alert
   * @param {Object} equipmentInfo - Object that contains equipmentName, id, floorName, departmentName, locationName, for performing actions
   * @param {string} equipmentInfo.equipmentName ,required name for an equipment
   * @param {string} equipmentInfo.id , required id for an equipment
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} username - Name of the user that made actions on the alert
   */
  static editCreatedTask = (equipmentInfo, typeOfAlert, username) => {
    const { equipmentName, id } = equipmentInfo
    let finalValuesToVerify = { equipmentName, id, typeOfAlert, username, commentForTask }
    //Search equipment name
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, globalSels.resultRow, 'equipment-alerts').as('data1')
    //Verify data on table view
    HelperFunction.verifyValuesExist('@data1', finalValuesToVerify)
    cy.get('@data1').click(commandOptions.force)
    cy.wait(2000)
    //Edit task
    Click.onButton('@data1', prosightEnvironment.smartAlerts.editTask)
    Verify.theElement(prosightEnvironment.smartAlerts.unacknowledgedButtonOnPopup).isDisabled()
    Verify.theElement(prosightEnvironment.smartAlerts.commentForCreatingTask).hasText(commentForTask)
    cy.get(prosightEnvironment.smartAlerts.commentForCreatingTask).click().clear().type(commentForEditedTask)
    cy.get(prosightEnvironment.smartAlerts.labels).contains(save).click(commandOptions.force)
  }

  /**
   * This function is used to complete task for the alerts
   * @param {Object} equipmentInfo - Object that contains equipmentName, id, floorName, departmentName, locationName, for performing actions
   * @param {string} equipmentInfo.equipmentName ,required name for an equipment
   * @param {string} equipmentInfo.type , required type for an equipment
   * @param {string} equipmentInfo.id , required id for an equipment
   * @param {string} equipmentInfo.floorName,required floorName for an equipment
   * @param {string} equipmentInfo.locationName,required locationName for an equipment
   * @param {string} equipmentInfo.buildingName ,required buildingName for an equipment
   * @param {string} equipmentInfo.departmentName ,required departmentName for an equipment
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} username - Name of the user that made actions on the alert
   * @param {string} actionType - Place where alert action needs to be made
   */
  static completeTask = (equipmentInfo, typeOfAlert, username, actionType, sensorId) => {
    const { equipmentName, id, type, departmentName, buildingName, floorName, locationName } = equipmentInfo
    let finalValuesToVerify = { equipmentName, id, typeOfAlert, username, commentForTask }
    //Verify data on side panel
    let sidePanelData = {
      'Equipment Type': type,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
      'Sensor ID': sensorId,
      'Assigned Owner': departmentName,
    }
    //Search equipment name
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, globalSels.resultRow, 'equipment-alerts').as('data1')
    //Verify data on table view
    HelperFunction.verifyValuesExist('@data1', finalValuesToVerify)
    //Action on table view
    if (actionType === tableView) {
      Click.onButton('@data1', prosightEnvironment.smartAlerts.completeTaskFromTableView)
      cy.get(prosightEnvironment.smartAlerts.unacknowledgedButtonOnPopup).click(commandOptions.force)
    }
    //Action on side panel
    else if (actionType === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(prosightEnvironment.smartAlerts.sidePanelEquipmentName).hasText(equipmentName)
      Verify.theElement(prosightEnvironment.smartAlerts.alertTypeInSidePanel).hasText(typeOfAlert)
      Verify.theElement(prosightEnvironment.smartAlerts.taskDescription).contains(commentForTask)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      HelperFunction.getElementFromSpecificDiv(
        prosightEnvironment.smartAlerts.taskCard,
        prosightEnvironment.smartAlerts.completeTaskFromSidePanel
      ).click(commandOptions.force)
      cy.get(prosightEnvironment.smartAlerts.unacknowledgedButtonOnPopup).click(commandOptions.force)
    }
  }

  /**
   * This function is used to clear alerts
   * @param {object} valuesToVerify - Object that contains equipmentName, id, floorName, departmentName, locationName, for performing actions
   * @param {string} actionType - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} sensorId It is te id of the device
   */
  static clearAlert = (valuesToVerify, actionType, typeOfAlert, sensorId) => {
    const { equipmentName, type, id, floorName, departmentName, locationName, buildingName } = valuesToVerify
    let finalValuesToVerifyInTableView = { equipmentName, id, departmentName }
    const values = { ...finalValuesToVerifyInTableView, typeOfAlert }
    //Verify data on side panel
    let sidePanelData = {
      'Equipment Type': type,
      'Sensor ID': sensorId,
      Building: buildingName,
      'Assigned Owner': departmentName,
      Floor: floorName,
      Location: locationName,
    }
    //Search equipment name
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, globalSels.resultRow, 'equipment-alerts').as('data1')
    //Verify data on table view
    HelperFunction.verifyValuesExist('@data1', values)
    //Action on table view
    if (actionType === tableView) {
      Click.onButton('@data1', prosightEnvironment.smartAlerts.selectActionDropDown)
      cy.get(prosightEnvironment.smartAlerts.clearButtonOnTableView).contains(clearButton).click(commandOptions.force)
    }
    //Action on side panel
    else if (actionType === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(prosightEnvironment.smartAlerts.sidePanelEquipmentName).hasText(equipmentName)
      Verify.theElement(prosightEnvironment.smartAlerts.alertTypeInSidePanel).hasText(typeOfAlert)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      cy.get(prosightEnvironment.smartAlerts.clearAlertFromSidePanel).click(commandOptions.force)
    }
    //Clear alert
    cy.get(prosightEnvironment.smartAlerts.clearButtonOnPopUp).click(commandOptions.force)
  }

  /**
   * This Function is used to create an environment Rule to trigger Environment Alerts
   * @param {String} equipmentName - Name of the equipment for which environment alerts needs t be triggered
   * @param {Object} temperatureDetails - This object contains the temperature and humidity values that must be added to the equipment
   * @param {Number}temperatureDetails.minTemperature - Minimum value of temperature that must be updated for the rule to an equipment.
   * @param {Number}temperatureDetails.maxTemperature - Maximum  value of temperature that must be updated for the rule to an equipment.
   * @param {Number}temperatureDetails.minHumidity - Minimum value of temperature that must be updated for the rule to an equipment.
   * @param {Number}temperatureDetails.maxHumidity - Maximum value of temperature that must be updated for the rule to an equipment.
   * @param {Number}temperatureDetails.optimalMaxTemperature - Optimal Maximum value of temperature that must be updated for the rule to an equipment.
   * @param {Number}temperatureDetails.optimalMinTemperature -Optimal Minimum value of temperature that must be updated for the rule to an equipment.
   */
  static createEnvironmentRule = (equipmentName, temperatureDetails) => {
    const { minHumidity, minTemperature, maxHumidity, maxTemperature, optimalMaxTemperature, optimalMinTemperature } = temperatureDetails
    const equipmentActionsEndpoint = APIEndpoints.equipmentActionsEndpoint(system_Id, hospital_Id)
    HelperFunction.search_API(equipmentName, equipment).then(({ authToken, Id }) => {
      cy.api({
        method: leverageConstants.requestMethod.patch,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: authToken,
        },
        url: apiBaseURL + equipmentActionsEndpoint + `${Id}`,
        body: {
          data: [
            {
              path: 'rule/lastModified',
              value: new Date().getTime(),
            },
            {
              path: 'delayedAlerts/delay',
              value: 0,
            },
            {
              path: 'range/temperature/min',
              value: minTemperature,
            },
            {
              path: 'range/temperature/max',
              value: maxTemperature,
            },
            {
              path: 'range/temperature/optimalMin',
              value: optimalMinTemperature,
            },
            {
              path: 'range/temperature/optimalMax',
              value: optimalMaxTemperature,
            },
            {
              path: 'range/humidity/min',
              value: minHumidity,
            },
            {
              path: 'range/humidity/max',
              value: maxHumidity,
            },
          ],
        },
      }).then((response) => {
        if (response.status === 200) {
          expect(response.status).to.equal(200)
          cy.log('Environment Rule created successfully')
        } else {
          cy.log('Unable to created Environment Rule')
        }
      })
    })
  }

  /**
   * This function is used to update the temperature and humidity value for a sensor
   * @param {String} deviceName - Name of the sensor for which humidity and temperature values needs to be updated
   * @param {Object} TemperatureAndHumidityData - Object that contains humidity and temperature values
   * @param {Number} TemperatureAndHumidityData.temperature -Temperature Value that needs to be updated for the sensor
   * @param {Number} TemperatureAndHumidityData.humidity  -Humidity Value that needs to be updated for the sensor
   */

  static updateTemperatureForSensor = (deviceName, TemperatureAndHumidityData) => {
    const { temperature, humidity } = TemperatureAndHumidityData
    const setTemperatureAndHumidityForSensorEndPoint = APIEndpoints.setTemperatureAndHumidityForSensorEndPoint(system_Id)
    const setValue = APIEndpoints.setValuesEndPoint
    SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      HelperFunction.search_API(deviceName, sensor).then(({ authToken, Id }) => {
        cy.api({
          method: leverageConstants.requestMethod.put,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          headers: {
            authorization: architectAuthToken,
          },
          url: apiBaseURL + setTemperatureAndHumidityForSensorEndPoint + `${Id}` + setValue,
          body: {
            values: [
              {
                path: 'temperature',
                value: temperature,
              },
              {
                path: 'humidity',
                value: humidity,
              },
              {
                path: "lastReported",
                value: Date.now()
              }
            ],
          },
        }).then((response) => {
          if (response.status === 200) {
            expect(response.status).to.equal(200)
            cy.log('Temperature updated successfully')
          } else {
            cy.log('Unable to updated the temperature')
          }
        })
      })
    })
  }

  /**
   * This function is used to delete the Environment Alert Carousel
   */
  static removeEnvironmentAlertCarousel = () => {
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
            path: 'openEnvironmentalAlerts',
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
   *
   * @param {String} comment  - Text need to acknowledge any alert
   * @param {Object} equipmentDetails Object that contains equipmentName, id,type, floorName, departmentName, locationName, for performing actions
   * @param {string} equipmentDetails.equipmentName ,required name for an equipment
   * @param {string} equipmentDetails.type , required type for an equipment
   * @param {string} equipmentDetails.id , required id for an equipment
   * @param {string} equipmentDetails.departmentName,required departmentName for an equipment
   * @param {string} equipmentDetails.floorName,required floorName for an equipment
   * @param {string} equipmentDetails.locationName,required locationName for an equipment
   */
  static acknowledgeEnvironmentalAlerts = (comment, equipmentDetails) => {
    const { incidentContainer, enterComment, acknowledgeButtonInAlert } = prosightEnvironment.smartAlerts
    const { equipmentName, id, type, floorName, departmentName, locationName } = equipmentDetails
    Verify.theElement(incidentContainer).contains(equipmentName)
    Verify.theElement(incidentContainer).contains(id)
    Verify.theElement(incidentContainer).contains(floorName)
    // Verify.theElement(incidentContainer).contains(type)
    Verify.theElement(incidentContainer).contains(departmentName)
    Verify.theElement(incidentContainer).contains(locationName)
    Click.forcefullyOn(acknowledgeButtonInAlert)
    cy.get(prosightEnvironment.smartAlerts.acknowledgeTitle).should('have.text', acknowledgeTitle)
    Verify.theElement(globalSels.confirmationBtnInConfirmationDialogue).contains(constants.buttonInnerTxt.acknowledge)
    Verify.theElement(enterComment).isVisible()
    Type.theText(comment).into(enterComment)
    Click.forcefullyOn(globalSels.confirmationBtnInConfirmationDialogue)
  }

  /**
   * This function is used to escalate the environmental alert
   * @param {string} option Option to select when escalating
   * @param {object} equipmentDetails - Object that contains equipmentName, id, floorName, departmentName, locationName, for performing actions
   * @param {string} equipmentDetails.equipmentName ,required name for an equipment
   * @param {string} equipmentDetails.type , required type for an equipment
   * @param {string} equipmentDetails.id , required id for an equipment
   * @param {string} equipmentDetails.departmentName,required departmentName for an equipment
   * @param {string} equipmentDetails.floorName,required floorName for an equipment
   * @param {string} equipmentDetails.locationName,required locationName for an equipment
   * @param {string} equipmentDetails.buildingName ,required buildingName for an equipment
   * @param {string} Action - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} sensorId It is te id of the device
   */
  static escalateAlert = (option, equipmentDetails, Action, typeOfAlert, sensorId) => {
    const { equipmentName, id, type, floorName, buildingName, departmentName, locationName } = equipmentDetails
    const finalValuesToVerifyInTableView = { equipmentName, id, departmentName, typeOfAlert }
    const { incidentContainer, escalateButton, escalateOptionsContainer } = prosightEnvironment.smartAlerts
    if (Action === carousel) {
      Verify.theElement(incidentContainer).contains(equipmentName)
      Verify.theElement(incidentContainer).contains(id)
      Click.forcefullyOn(escalateButton)
      Click.onContainText(escalateOptionsContainer, option)
      Click.forcefullyOn(globalSels.dialogueDeleteBtn)
    } else if (Action != carousel) {
      cy.get(prosightEnvironment.smartAlerts.searchBar).clear().type(`${equipmentName}${commandOptions.enter}`)
      cy.reload()
      HelperFunction.getRowByItemName(equipmentName, globalSels.resultRow, 'equipment-alerts').as('data1')
      if (Action === sidePanel) {
        cy.get('@data1').click(commandOptions.force)
        HelperFunction.verifyValuesExist('@data1', finalValuesToVerifyInTableView)
        Verify.theElement(prosightEnvironment.smartAlerts.sidePanelEquipmentName).hasText(equipmentName)
        Verify.theElement(prosightEnvironment.smartAlerts.alertTypeInSidePanel).hasText(typeOfAlert)
        Verify.verifySidePanels(globalSels.sidePanel, equipmentType).verifyDataInSidePanel(type)
        Verify.verifySidePanels(globalSels.sidePanel, building).verifyDataInSidePanel(buildingName)
        Verify.verifySidePanels(globalSels.sidePanel, assignedDepartment).verifyDataInSidePanel(departmentName)
        Verify.verifySidePanels(globalSels.sidePanel, floor).verifyDataInSidePanel(floorName)
        Verify.verifySidePanels(globalSels.sidePanel, location).verifyDataInSidePanel(locationName)
        Verify.verifySidePanels(globalSels.sidePanel, sensorID).verifyDataInSidePanel(sensorId)
        Click.forcefullyOn(prosightEnvironment.smartAlerts.escalateButtonFromSidePanel)
        Click.onContainText(escalateOptionsContainer, option)
        Click.forcefullyOn(globalSels.dialogueDeleteBtn)
      } else if (Action == tableView) {
        cy.get(prosightEnvironment.smartAlerts.selectActionDropDown).click(commandOptions.force)
        cy.contains(escalate).click(commandOptions.force)
        cy.wait(2000)
        Click.onContainText(escalateOptionsContainer, option)
        Click.forcefullyOn(globalSels.dialogueDeleteBtn)
      }
    }
  }

  /**
   * This function is used to update the timestamp for the alert
   * @param {String} deviceName - Name of the device for which timestamp needs to be updated
   */
  static updateTimestampForIncident = (deviceName) => {
    SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      let time = new Date()
      let timeToUpdate = time.setHours(time.getHours() - 2)
      HelperFunction.search_API(deviceName, leverageConstants.objectTypes.incident).then(({ Id }) => {
        const updateTimestamp = APIEndpoints.setTemperatureAndHumidityForSensorEndPoint(system_Id)
        const setValue = APIEndpoints.setValuesEndPoint

        cy.api({
          method: leverageConstants.requestMethod.put,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          headers: {
            authorization: architectAuthToken,
          },
          url: apiBaseURL + updateTimestamp + `${Id}` + setValue,
          body: {
            values: [
              {
                path: 'acknowledged/time',
                value: timeToUpdate,
              },
            ],
          },
        }).then((response) => {
          if (response.status === 200) {
            expect(res.status).to.equal(200)
            cy.log('Timestamp Updated to 2 hours ago')
          } else {
            cy.log('Unable to Update the timestamp')
          }
        })
      })
    })
  }

  /**
   * This function is used to delete environment rule
   * @param {String} deviceName - Name of the device for which rules need to be deleted
   */
  static deleteEnvironmentRule = (deviceName) => {
    SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      HelperFunction.search_API(deviceName, leverageConstants.objectTypes.equipment).then(({ Id }) => {
        const deleteEnvironmentRule = APIEndpoints.deleteEnvironmentRule(system_Id, hospital_Id)
        cy.api({
          method: leverageConstants.requestMethod.put,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          headers: {
            authorization: architectAuthToken,
          },
          url: apiBaseURL + deleteEnvironmentRule,
          body: {
            equipmentId: Id,
          },
        }).then((response) => {
          if (expect(response.status).to.equal(200)) {
            cy.log('Rules Deleted')
          } else {
            cy.log('Unable to delete rule')
          }
        })
      })
    })
  }

  /**
   * Function that is used to trigger and clear the sensor offline alert
   */
  static autoClearLogicForSensorOfflineAlert = () => {
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
            message: {
              message: {
                apiKey: apiKey,
                config: {
                  projectId: project_Id,
                  type: leverageConstants.alertTypeIds.sensorReportOverdue,
                },
                hospitalId: hospital_Id,
                host: apiBaseURL,
                projectId: project_Id,
                secret: secret,
                type: 'reasonRunScript',
              },
              options: {
                reasoner: {
                  foo: 'bar',
                  id: leverageConstants.scriptIds.sensorReportOverdue,
                  targetFunction: leverageConstants.targetFunction,
                },
              },
              type: 'routeMsg',
            },
            topic: 'reason',
            type: 'publishTopic',
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

  /**
   * This function is used to update the last reported date for the sensor
   * @param {String} deviceName - Name of the sensor for which last reported date needs to be updated
   * @param {Number} lastReported - Timestamp that is required to be updated for the sensor
   */
  static updateTheLastReportedDateForSensor = (deviceName, lastReported) => {
    SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      let twoDaysAgo = new Date().setDate(new Date().getDate() - 2)
      let timeTwoDaysAgo = new Date(twoDaysAgo).setHours(18, 0, 0)
      const currentTime = new Date().getTime()

      if (lastReported === leverageConstants.timestamps.twoDaysAgo) {
        lastReported = timeTwoDaysAgo
      } else if (lastReported === leverageConstants.timestamps.currentTime) {
        lastReported = currentTime
      }
      HelperFunction.search_API(deviceName, leverageConstants.objectTypes.sensor).then(({ Id }) => {
        const updateTimestamp = APIEndpoints.setTemperatureAndHumidityForSensorEndPoint(system_Id)
        const setValue = APIEndpoints.setValuesEndPoint

        cy.api({
          method: leverageConstants.requestMethod.put,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          headers: {
            authorization: architectAuthToken,
          },
          url: apiBaseURL + updateTimestamp + `${Id}` + setValue,
          body: {
            values: [
              {
                path: 'lastReported',
                value: lastReported,
              },
            ],
          },
        }).then((response) => {
          expect(response.status).to.equal(200)
          cy.log('Last reported dated updated')
        })
      })
    })
  }
}
