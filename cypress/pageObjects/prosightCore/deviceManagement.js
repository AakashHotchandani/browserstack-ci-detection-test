///<reference types= 'cypress'/>
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import selectors from '../../utils/selectors/prosightCore'
import commandOptions from '../../utils/constants/commandOptions'
import deviceManagementConstants from '../../utils/constants/prosightCore/deviceManagementConstants'
import gatewayFiles from '../../fixtures/prosightCore/gateways.json'
import sensorFile from '../../fixtures/prosightCore/sensors.json'
import tagFile from '../../fixtures/prosightCore/tags.json'
import LoginPage from '../signIn/siginPage'
import APIEndpoints from '../../../APIEndpoints'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import globalSels from '../../utils/selectors/globalSels'
import prosightCore from '../../utils/selectors/prosightCore'
import Click from '../../utils/Interactions/click'
import Type from '../../utils/Interactions/type'
import globalConst from '../../utils/constants/globalConst'

import { Verify } from '../../utils/assertions'
const { hhSensor, tag, sensor, gateway, hospital } = leverageConstants.objectTypes
const { tableBtn, sidePanelBtn, editMenu } = globalConst.delete_EditActions
const { labelTag, createBtn, rowInTable, sidePanel, editBtn, deleteBtn, dialogueCancel_ContinueBtn, button } = globalSels
const { tableViewButton } = globalSels.smartLocation
const { associatedLocationLabel, manual, automatic, kontakt, hid } = deviceManagementConstants.label
const { Location } = deviceManagementConstants
const { hhSensorManagement } = deviceManagementConstants.buttonInnerText
const apiBaseURL = Cypress.env('API_BaseUrl')
const system_Id = Cypress.env('SystemId')
const hospital_Id = Cypress.env('HospitalId')
const { tagActionsEndpoint, sensorActionsEndpoint, gatewayActionsEndpoint } = APIEndpoints
let hhApiEndPoint = APIEndpoints.hhSensorEndpoint(system_Id, hospital_Id)
let baseEndPoint = APIEndpoints.baseEndpoint(system_Id, hospital_Id)
const { duration, scrollRight } = commandOptions
const { room, floors, buildings } = leverageConstants.objectTypes
const {
  addHhSensor,
  hhSensorIdSel,
  hhSensorNameSel,
  buildingSel,
  floorSel,
  hhSensorPolicySel,
  hhSensorTypeSel,
  manufacturer,
  manualDispenseCountSel,
  unassignGateway,
  nameInSidePanel,
  scrollBar,
  sensorTypeSel,
  deleteButtonOnSidePanel,
  deleteButtonOnPopup,
  tagIdInSidePanel,
} = prosightCore.deviceManagementPageSel
const { canNotDeleteMessage } = prosightCore.hospitalManagementPageSel
const { messageAfterEditingHhSensor, messageAfterHhSensorCreation, messageAfterHhSensorDeletion, messageAfterUnAssignHhSensor } =
  deviceManagementConstants.toastMessages
const { unAssignHhSensorConfirmation, deleteHhSensorConfirmation, unableToDeleteHhSensor } = deviceManagementConstants.confirmationMessages
/** This class consists of different static functions related to deviceManagement page
 * @class DeviceManagement
 */
export default class DeviceManagement {
  /**
   * Function that creates a new tag by filling required fields
   * @param {object} createTagDetails is an objects that accepts data tagName, tagType, Manufacturer, Model for creating tag
   * @param {String}  createTagDetails.tagName - Name used to create tag
   * @param {String} createTagDetails.tagType - Type of the tag
   * @param {String} createTagDetails.Manufacturer - Manufacturer of the tag
   * @param {String} createTagDetails.Model - Model of the tag
   * @param {boolean value} toastAssertion - its boolean value
   * @param {boolean value} inOneFlow - its boolean value
   */
  static addNewTag = (createTagDetails, toastAssertion = false, inOneFlow = false) => {
    const { tagName, tagType, Manufacturer, Model } = createTagDetails
    if (inOneFlow) {
      cy.get(selectors.deviceManagementPageSel.addTagButton).click(commandOptions.force)
    }
    cy.get(selectors.deviceManagementPageSel.tagIdTextField).type(tagName, commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.tagTypeDropDown).contains(deviceManagementConstants.TagTypeDropdown).click(commandOptions.force)
    cy.contains(tagType).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.manufacturerDropDown)
      .contains(deviceManagementConstants.ManufacturerDropdownLabel)
      .click(commandOptions.force)
    cy.contains(Manufacturer).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.modelDropDown).contains(deviceManagementConstants.ModelDropdown).click(commandOptions.force)
    cy.contains(Model).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.createButton).click(commandOptions.force)

    if (toastAssertion) Verify.theToast.showsToastMessage(deviceManagementConstants.TagtoastMessages[0])
  }

  /**
   * Function that edits the created tag by changing the required fields
   * @param {object} editCreatedTagDetails is an object that accepts the value tagType, Manufacturer, Model
   * @param {String} editCreatedTagDetails.tagName - Name used to create tag
   * @param {String} editCreatedTagDetails.tagType - Type of the tag
   * @param {String} editCreatedTagDetails.Manufacturer - Manufacturer of the tag
   * @param {String} editCreatedTagDetails.Model - Model of the tag
   * @param {String} action - place from where action needs to be executed
   */
  static editCreatedTag = (editCreatedTagDetails, action) => {
    const { tagType, Manufacturer, Model, tagName } = editCreatedTagDetails
    HelperFunction.search(tagName)
    if (action === deviceManagementConstants.tableView) {
      cy.get(selectors.deviceManagementPageSel.scrollBar).scrollTo(commandOptions.scrollRight, commandOptions.duration)
      HelperFunction.getRowByItemName(tagName, globalSels.resultRow, deviceManagementConstants.adminTable).as('tagData')
      HelperFunction.getElementFromSpecificDiv('@tagData', selectors.deviceManagementPageSel.editButton).as('editButton')
      cy.get('@editButton').click(commandOptions.force)
    } else if (action === deviceManagementConstants.sidePanel) {
      HelperFunction.getRowByItemName(tagName, globalSels.resultRow, deviceManagementConstants.adminTable).as('tagData')
      cy.get('@tagData').click(commandOptions.force)
      HelperFunction.getElementFromSpecificDiv(
        selectors.deviceManagementPageSel.sidePanel,
        selectors.deviceManagementPageSel.editButtonOnSidePanel
      ).as('editButtonOnSidePanel')
      cy.get('@editButtonOnSidePanel').click(commandOptions.force)
    }
    cy.get(selectors.deviceManagementPageSel.tagTypeDropDown).contains(tagFile.createTagData.tagType).click(commandOptions.force)
    cy.contains(tagType).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.manufacturerDropDown).contains(tagFile.createTagData.Manufacturer).click(commandOptions.force)
    cy.contains(Manufacturer).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.ModelLabel).contains(deviceManagementConstants.ModelLabel).next().click(commandOptions.force)
    cy.contains(Model).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.saveButton).click(commandOptions.force)
  }

  /**
   * Function that delete the created tag from the delete icon on Table View/Side Panel/Edit tag page
   * @param {string} tagName,its created tag name that user will use to search the tag and perform deletion function on it.
   * @param {string} action , its used to specify the place where action need to be done on
   */
  static deleteCreatedTag = (tagName, action) => {
    HelperFunction.search(tagName)
    HelperFunction.getRowByItemName(tagName, globalSels.resultRow, deviceManagementConstants.adminTable).as('tagData')
    if (action === deviceManagementConstants.tableView) {
      cy.get(selectors.deviceManagementPageSel.scrollBar).scrollTo(commandOptions.scrollRight, commandOptions.duration)
      HelperFunction.getElementFromSpecificDiv('@tagData', selectors.deviceManagementPageSel.deleteButton).as('deleteButton')
      cy.get('@deleteButton').click(commandOptions.force)
    } else if (action === deviceManagementConstants.editPage) {
      cy.get(selectors.deviceManagementPageSel.scrollBar).scrollTo(commandOptions.scrollRight, commandOptions.duration)
      HelperFunction.getElementFromSpecificDiv('@tagData', selectors.deviceManagementPageSel.editButton).as('editButton')
      cy.get('@editButton').click(commandOptions.force)
      cy.get(selectors.deviceManagementPageSel.deleteButtonOnSidePanel).click(commandOptions.force)
    } else if (action === deviceManagementConstants.sidePanel) {
      cy.get('@tagData').click(commandOptions.force)
      HelperFunction.getElementFromSpecificDiv(
        selectors.deviceManagementPageSel.sidePanel,
        selectors.deviceManagementPageSel.deleteButtonOnSidePanel
      ).as('deleteButtonOnSidePanel')
      cy.get('@deleteButtonOnSidePanel').click(commandOptions.force)
    }
    cy.get(selectors.deviceManagementPageSel.deleteButtonOnPopup).click(commandOptions.force)
  }

  /**
   * Function that is used to verify the data in the side panel
   * @param {String} tagName - Name used to create tag
   * @param {String} tagType - Type of the tag
   * @param {String} Manufacturer - Manufacturer of the tag
   * @param {String} Model - Model of the tag
   */
  static verifyingTagInSidePanel = (tagData) => {
    const { tagName, tagType, Manufacturer, Model } = tagData
    const sidePanelData = {
      'Tag Type': tagType,
      Manufacturer: Manufacturer,
      Model: Model,
    }
    HelperFunction.search(tagName)
    HelperFunction.getRowByItemName(tagName, globalSels.resultRow, deviceManagementConstants.adminTable).as('tagData')
    HelperFunction.verifyValuesExist('@tagData', tagData)
    cy.get('@tagData').click(commandOptions.force)
    //Verifying the data on side panel
    Verify.theElement(tagIdInSidePanel).hasText(tagName)
    HelperFunction.verifyValueFromSidePanel(sidePanelData, sidePanel)
    cy.get(selectors.deviceManagementPageSel.sidePanelCloseButton).click(commandOptions.force)
  }

  /**
   * Function that creates a new senor by filling required fields
   * @param {object} sensorDetails - object that accepts sensor, sensorType, manufacturer, modelName data for creating sensor
   * @param {String} sensorDetails.sensorId - Name of the sensor
   * @param {String} sensorDetails.sensorType - Type of the sensor
   * @param {String} sensorDetails.manufacturerName - manufacturer Name for the sensor
   * @param {String} sensorDetails.model - model Name for the sensor
   */
  static addNewSensor = (sensorDetails) => {
    const { sensorId, sensorType, manufacturerName, model } = sensorDetails
    cy.get(selectors.deviceManagementPageSel.sensorId).type(sensorId, commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.sensorTypeDropdown).click(commandOptions.force)
    cy.contains(sensorType).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.sensorAndManufacturerDropdown).click(commandOptions.force)
    cy.contains(manufacturerName).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.sensorModelName).type(model, commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.createButton).click(commandOptions.force)
  }

  /**
   * Function that is used to verify the sensor data from the side panel
   * @param {object} sensorData - object that accepts sensor, sensorType, manufacturer, modelName data for creating sensor
   * @param {String} sensorData.sensorId - Name of the sensor
   * @param {String} sensorData.sensorType - Type of the sensor
   * @param {String} sensorData.manufacturerName - manufacturer Name for the sensor
   * @param {String} sensorData.model - model Name for the sensor
   */
  static verifyingSensorInSidePanel = (sensorData) => {
    const { sensorId, sensorType, manufacturerName, model } = sensorData
    const sidePanelData = {
      'Sensor Type': sensorType,
      Manufacturer: manufacturerName,
      Model: model,
    }
    HelperFunction.search(sensorId)
    HelperFunction.getRowByItemName(sensorId, globalSels.resultRow, deviceManagementConstants.adminTable).as('sensorData')
    HelperFunction.verifyValuesExist('@sensorData', sensorData)
    cy.get('@sensorData').click(commandOptions.force)
    //Verifying the data on side panel
    Verify.theElement(tagIdInSidePanel).hasText(sensorId)
    HelperFunction.verifyValueFromSidePanel(sidePanelData, sidePanel)
    cy.get(selectors.deviceManagementPageSel.sidePanelCloseButton).click(commandOptions.force)
  }

  /**
   * The function that edits the created sensor from the edit button in table view and side panel
   * @param {object} sensorDetails - object that accepts sensor, sensorType, manufacturer, modelName data for creating sensor
   * @param {String} sensorDetails.sensorId - Name of the sensor
   * @param {String} sensorDetails.sensorType - Type of the sensor
   * @param {String} sensorDetails.manufacturerName - manufacturer Name for the sensor
   * @param {String} sensorDetails.model - model Name for the sensor
   * @param {String} action - place from where action needs to be executed
   */
  static editSensor = (sensorDetails, action) => {
    const { sensorId, sensorType, manufacturerName, model } = sensorDetails
    HelperFunction.search(sensorId)
    if (action === deviceManagementConstants.tableView) {
      HelperFunction.getRowByItemName(sensorId, globalSels.resultRow, deviceManagementConstants.adminTable).as('sensorData')
      HelperFunction.getElementFromSpecificDiv('@sensorData', selectors.deviceManagementPageSel.editButton).as('editButton')
      cy.get('@editButton').click(commandOptions.force)
    } else if (action === deviceManagementConstants.sidePanel) {
      HelperFunction.getRowByItemName(sensorId, globalSels.resultRow, deviceManagementConstants.adminTable).as('sensorData')
      cy.get('@sensorData').click(commandOptions.force)
      HelperFunction.getElementFromSpecificDiv(
        selectors.deviceManagementPageSel.sidePanel,
        selectors.deviceManagementPageSel.editButtonOnSidePanel
      ).as('editButtonOnSidePanel')
      cy.get('@editButtonOnSidePanel').click(commandOptions.force)
    }
    cy.get(selectors.deviceManagementPageSel.sensorTypeDropdown).click(commandOptions.force)
    cy.contains(sensorType).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.sensorAndManufacturerDropdown).click(commandOptions.force)
    cy.contains(manufacturerName).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.sensorModelName).clear(commandOptions.force).type(model, commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.saveButton).click(commandOptions.force)
  }

  /**
   * Function that delete the created sensor from the delete icon on the table view/Side panel/edit sensor page
   * @param {string} sensor,its created sensor name that user will use to search the sensor and perform deletion function on it.
   * @param {String} action - place from where action needs to be executed
   */
  static deleteCreatedSensor = (sensor, action) => {
    HelperFunction.search(sensor)
    HelperFunction.getRowByItemName(sensor, globalSels.resultRow, deviceManagementConstants.adminTable).as('sensorData')
    if (action === deviceManagementConstants.tableView) {
      HelperFunction.getElementFromSpecificDiv('@sensorData', selectors.deviceManagementPageSel.deleteButton).as('deleteButton')
      cy.get('@deleteButton').click(commandOptions.force)
    } else if (action === deviceManagementConstants.sidePanel) {
      cy.get('@sensorData').click(commandOptions.force)
      HelperFunction.getElementFromSpecificDiv(
        selectors.deviceManagementPageSel.sidePanel,
        selectors.deviceManagementPageSel.deleteButtonOnSidePanel
      ).as('deleteButtonOnSidePanel')
      cy.get('@deleteButtonOnSidePanel').click(commandOptions.force)
    } else if (action === deviceManagementConstants.editPage) {
      HelperFunction.getElementFromSpecificDiv('@sensorData', selectors.deviceManagementPageSel.editButton).as('editButton')
      cy.get('@editButton').click(commandOptions.force)
      cy.get(selectors.deviceManagementPageSel.deleteButtonOnSidePanel).click(commandOptions.force)
    }
    cy.get(selectors.deviceManagementPageSel.deleteButtonOnPopup).click(commandOptions.force)
  }

  /**
   * This function is used to create gateway and assign it to a location
   * @param {Object} gatewayData  - It is an object that contains data for creating gateway
   * @param {String} gatewayData.gatewaySID - Id that is used to create a gateway
   * @param {String} gatewayData.gatewayType - Type that is used to create a gateway
   * @param {String} gatewayData.manufacturer - Manufacture type that is used to create an gateway
   * @param {String} gatewayData.gatewayName - Name of the gateway that is used to create a gateway
   * @param {String} gatewayData.gatewayPolicy - Policy name for the gateway
   * @param {String} gatewayData.buildingName - Building name for the gateway
   * @param {String} gatewayData.floorName - Floor name for the gateway
   * @param {String} gatewayData.locationName - Location name for the gateway
   */
  static addNewGateway = (gatewayData) => {
    const { gatewaySID, gatewayType, manufacturer, gatewayName, gatewayPolicy, buildingName, floorName, locationName } = gatewayData
    Click.forcefullyOn(selectors.deviceManagementPageSel.sensorAndManufacturerDropdown)
    cy.contains(manufacturer).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.gatewaySid).type(gatewaySID, commandOptions.force)
    Click.forcefullyOn(selectors.deviceManagementPageSel.gatewayType)
    cy.contains(gatewayType).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.gatewayName).type(gatewayName, commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.gatewayTypeLabel)
      .contains(deviceManagementConstants.GatewayPolicy)
      .next()
      .click(commandOptions.force)
      .type(gatewayPolicy, commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.buildingDropdown).click(commandOptions.force)
    cy.contains(buildingName).click(commandOptions.force)
    Click.forcefullyOn(selectors.deviceManagementPageSel.floorDropdown)
    cy.contains(floorName).click(commandOptions.force)
    Verify.theElement(selectors.deviceManagementPageSel.locationDropdown).isEnabled()
    Click.forcefullyOn(selectors.deviceManagementPageSel.locationDropdown)
    cy.contains(locationName).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.createButton).click(commandOptions.force)
  }

  /**
   *  Function that is used to open side panel for the created sensor for which verification needs to be done
   * @param {Object} gatewayData  - It is an object that contains data for creating gateway
   * @param {String} gatewayData.gatewaySID - Id that is used to create a gateway
   * @param {String} gatewayData.gatewayType - Type that is used to create a gateway
   * @param {String} gatewayData.manufacturer - Manufacture type that is used to create an gateway
   * @param {String} gatewayData.gatewayName - Name of the gateway that is used to create a gateway
   * @param {String} gatewayData.gatewayPolicy - Policy name for the gateway
   * @param {String} gatewayData.buildingName - Building name for the gateway
   * @param {String} gatewayData.floorName - Floor name for the gateway
   * @param {String} gatewayData.locationName - Location name for the gateway
   */
  static verifyGatewayFromSidePanel = (gatewayData) => {
    const { gatewaySID, gatewayType, manufacturer, gatewayName, gatewayPolicy, buildingName = '-', floorName = '-', locationName = '-' } = gatewayData
    const verifyDataInTable = { gatewaySID, gatewayType, gatewayPolicy, manufacturer }
    const sidePanelData = {
      'Gateway Type': gatewayType,
      'Gateway Name': gatewayName,
      'Gateway/Location Policy': gatewayPolicy,
      Manufacturer: manufacturer,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
    }
    HelperFunction.search(gatewaySID)
    HelperFunction.getRowByItemName(gatewaySID, globalSels.resultRow, deviceManagementConstants.adminTable).as('gatewayData')
    HelperFunction.verifyValuesExist('@gatewayData', verifyDataInTable)
    cy.get('@gatewayData').click(commandOptions.force)
    //Verifying the data on side panel
    Verify.theElement(tagIdInSidePanel).hasText(gatewaySID)
    HelperFunction.verifyValueFromSidePanel(sidePanelData, sidePanel)
    cy.get(selectors.deviceManagementPageSel.sidePanelCloseButton).click(commandOptions.force)
  }

  /**
   * Function that edits the created gateway by changing the required fields
   * @param {Object} editCreatedGatewayDetails  - It is an object that contains data for creating gateway
   * @param {String} editCreatedGatewayDetails.gatewaySID - Id that is used to create a gateway
   * @param {String} editCreatedGatewayDetails.gatewayType - Type that is used to create a gateway
   * @param {String} editCreatedGatewayDetails.manufacturer - Manufacture type that is used to create an gateway
   * @param {String} editCreatedGatewayDetails.gatewayName - Name of the gateway that is used to create a gateway
   * @param {String} editCreatedGatewayDetails.gatewayPolicy - Policy name for the gateway
   *
   */
  static editCreatedGateway = (editCreatedGatewayDetails, action) => {
    const { gatewaySID, manufacturer, gatewayType, gatewayPolicy, gatewayName } = editCreatedGatewayDetails
    Click.forcefullyOn(tableViewButton)
    HelperFunction.search(gatewaySID)
    HelperFunction.getRowByItemName(gatewaySID, globalSels.resultRow, deviceManagementConstants.adminTable).as('gatewayData')
    if (action === deviceManagementConstants.tableView) {
      cy.get(selectors.deviceManagementPageSel.scrollBar).scrollTo(commandOptions.scrollRight, commandOptions.duration)
      HelperFunction.getElementFromSpecificDiv('@gatewayData', selectors.deviceManagementPageSel.editButton).as('editButton')
      cy.get('@editButton').click(commandOptions.force)
    } else if (action === deviceManagementConstants.sidePanel) {
      cy.get('@gatewayData').click(commandOptions.force)
      HelperFunction.getElementFromSpecificDiv(
        selectors.deviceManagementPageSel.sidePanel,
        selectors.deviceManagementPageSel.editButtonOnSidePanel
      ).as('editButtonOnSidePanel')
      cy.get('@editButtonOnSidePanel').click(commandOptions.force)
    }
    Click.forcefullyOn(selectors.deviceManagementPageSel.sensorAndManufacturerDropdown)
    cy.contains(manufacturer).click(commandOptions.force)
    Click.forcefullyOn(selectors.deviceManagementPageSel.gatewayType)
    cy.contains(gatewayType).click(commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.gatewayName)
      .click(commandOptions.force)
      .clear(commandOptions.force)
      .type(gatewayName, commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.gatewayTypeLabel)
      .contains(deviceManagementConstants.GatewayPolicy)
      .next()
      .click(commandOptions.force)
      .clear(commandOptions.force)
      .type(gatewayPolicy, commandOptions.force)
    cy.get(selectors.deviceManagementPageSel.saveButton).click(commandOptions.force)
  }

  /**
   * Function that deletes the created gateway from side panel/table view / edit gateway page
   * @param {string} gatewaySID,its created Gateway SID that user will use to search the Gateway and perform deletion function on it.
   * @param {string} action , its used to specify the place where action need to be done on
   */
  static deleteCreatedGateway = (gatewaySID, action) => {
    HelperFunction.search(gatewaySID)
    HelperFunction.getRowByItemName(gatewaySID, globalSels.resultRow, deviceManagementConstants.adminTable).as('gatewayData')
    if (action === deviceManagementConstants.tableView) {
      cy.get(selectors.deviceManagementPageSel.scrollBar).scrollTo(commandOptions.scrollRight, commandOptions.duration)
      HelperFunction.getElementFromSpecificDiv('@gatewayData', selectors.deviceManagementPageSel.deleteButton).as('deleteButton')
      cy.get('@deleteButton').click(commandOptions.force)
    } else if (action === deviceManagementConstants.sidePanel) {
      Click.forcefullyOn('@gatewayData')
      HelperFunction.getElementFromSpecificDiv(
        selectors.deviceManagementPageSel.sidePanel,
        selectors.deviceManagementPageSel.deleteButtonOnSidePanel
      ).as('deleteButtonOnSidePanel')
      cy.get('@deleteButtonOnSidePanel').click(commandOptions.force)
    } else if (action === deviceManagementConstants.editPage) {
      cy.get(selectors.deviceManagementPageSel.scrollBar).scrollTo(commandOptions.scrollRight, commandOptions.duration)
      HelperFunction.getElementFromSpecificDiv('@gatewayData', selectors.deviceManagementPageSel.editButton).as('editButton')
      cy.get('@editButton').click(commandOptions.force)
      cy.get(selectors.deviceManagementPageSel.deleteButtonOnSidePanel).click(commandOptions.force)
    }
    cy.get(selectors.deviceManagementPageSel.deleteButtonOnPopup).click(commandOptions.force)
  }

  /**
   * This function is used to unassign the gateway with the location
   * @param {string} gatewaySID,its created Gateway SID that user will use to search the Gateway and perform unassign function on it.
   * @param {string} action , its used to specify the place where action need to be done on
   */
  static unassignGateway = (gatewaySID, action) => {
    HelperFunction.search(gatewaySID)
    HelperFunction.getRowByItemName(gatewaySID, globalSels.resultRow, deviceManagementConstants.adminTable).as('gatewayData')
    if (action === deviceManagementConstants.sidePanel) {
      cy.get('@gatewayData').click(commandOptions.force)
      HelperFunction.getElementFromSpecificDiv(selectors.deviceManagementPageSel.sidePanel, selectors.deviceManagementPageSel.unassignGateway).as(
        'unassignGateway'
      )
      cy.get('@unassignGateway').click(commandOptions.force)
    } else if (action === deviceManagementConstants.tableView) {
      cy.get(selectors.deviceManagementPageSel.scrollBar).scrollTo(commandOptions.scrollRight, commandOptions.duration)
      HelperFunction.getElementFromSpecificDiv('@gatewayData', selectors.deviceManagementPageSel.unassignGateway).as('unassignGateway')
      cy.get('@unassignGateway').click(commandOptions.force)
    } else if (action === deviceManagementConstants.editPage) {
      cy.get(selectors.deviceManagementPageSel.scrollBar).scrollTo(commandOptions.scrollRight, commandOptions.duration)
      HelperFunction.getElementFromSpecificDiv('@gatewayData', selectors.deviceManagementPageSel.editButton).as('editButton')
      cy.get('@editButton').click(commandOptions.force)
      cy.get(selectors.deviceManagementPageSel.unassignGateway).should('be.enabled').click(commandOptions.force)
    }
    cy.get(selectors.deviceManagementPageSel.deleteButtonOnPopup).click(commandOptions.force)
  }
  /**
   * Function that is used to verifies the options available in the HID gateway type
   */
  static verifyHIDGatewayType = () => {
    cy.fixture('prosightCore/gateways').then((data) => {
      Click.forcefullyOn(selectors.deviceManagementPageSel.sensorAndManufacturerDropdown)
      cy.contains(data.manufacturer[0]).click({ force: true })
      cy.get(selectors.deviceManagementPageSel.sensorAndManufacturerDropdown).then((text1) => {
        var manufacturerVariable = text1.text()
        if (manufacturerVariable == data.manufacturer[0]) {
          {
            cy.get(selectors.deviceManagementPageSel.gatewayType).click({ force: true })
            cy.get(selectors.deviceManagementPageSel.gatewayDropdownOptions).eq(0).should('have.text', data.gatewayTypeHID[0])
            cy.get(selectors.deviceManagementPageSel.gatewayDropdownOptions).eq(1).should('have.text', data.gatewayTypeHID[1])
            cy.get(selectors.deviceManagementPageSel.gatewayDropdownOptions).eq(2).should('have.text', data.gatewayTypeHID[2])
          }
        }
      })
    })
  }

  /**
   * Function that is used to verifies the options available in the Kontakt gateway type
   */
  static verifyKontaktGatewayType = () => {
    cy.fixture('prosightCore/gateways').then((data) => {
      Click.forcefullyOn(selectors.deviceManagementPageSel.sensorAndManufacturerDropdown)
      cy.contains(data.manufacturer[1]).click({ force: true })
      cy.get(selectors.deviceManagementPageSel.gatewayTypeLabel)
        .contains(deviceManagementConstants.ManufacturerLabel)
        .next()
        .then((text1) => {
          var manufacturerVariable = text1.text()
          if (manufacturerVariable == data.manufacturer[1]) {
            {
              cy.get(selectors.deviceManagementPageSel.gatewayType).click({ force: true })
              cy.get(selectors.deviceManagementPageSel.gatewayDropdownOptions).eq(0).should('have.text', data.gatewayTypeKontakt[0])
              cy.get(selectors.deviceManagementPageSel.gatewayDropdownOptions).eq(1).should('have.text', data.gatewayTypeKontakt[1])
              cy.get(selectors.deviceManagementPageSel.gatewayDropdownOptions).eq(2).should('have.text', data.gatewayTypeKontakt[2])
              cy.get(selectors.deviceManagementPageSel.gatewayDropdownOptions).eq(3).should('have.text', data.gatewayTypeKontakt[3])
              cy.get(selectors.deviceManagementPageSel.gatewayDropdownOptions).eq(4).should('have.text', data.gatewayTypeKontakt[4])
              cy.get(selectors.deviceManagementPageSel.gatewayDropdownOptions).eq(5).should('have.text', data.gatewayTypeKontakt[5])
            }
          }
        })
    })
  }

  /**
   * Static function that creates a sensor using API calls
   * @param {Object} sensorDetails it the object that consists of required details to create a sensor
   * @param {String} sensorDetails.sensorId it the required sensor id for sensor
   * @param {String} sensorDetails.sensorType it the sensor type required
   * @param {String} sensorDetails.model it the required senior model
   * @param {String} sensorDetails.manufacturerName it is the required sensor manufacturer
   */
  static createSensor_API = (sensorDetails) => {
    const { sensorId, sensorType, model, manufacturerName } = sensorDetails
    const apiEndPoint = APIEndpoints.sensorActionsEndpoint(system_Id, hospital_Id)
    LoginPage.loginToApplication().then(({ authToken }) => {
      cy.api({
        url: apiBaseURL + apiEndPoint,
        method: 'POST',
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
        body: {
          networkAliases: {
            'cognosos-sensors': {
              deviceId: sensorId,
            },
          },
          networkId: 'cognosos-sensors',
          data: [
            {
              path: 'deviceId',
              value: sensorId,
            },
            {
              path: 'sensorType',
              value: sensorType,
            },
            {
              path: 'manufacturer',
              value: manufacturerName,
            },
            {
              path: 'model',
              value: model,
            },
          ],
          name: sensorId,
        },
      }).then((res) => {
        if(res.status === 200){
          expect(res.status, 'Checking for response status').to.equal(200)
        expect(res.body.data.deviceId, 'Verifying sensor id').to.equal(sensorId)
        expect(res.body.data.model, 'Verifying sensor model').to.equal(model)
        expect(res.body.data.manufacturer, 'Verifying sensor manufacturer').to.equal(manufacturerName)
        expect(res.body.data.sensorType, 'Verifying sensor type').to.equal(sensorType)
        }
        else{
          cy.log('unable to create sensor ')
        }
      })
    })
  }

  /**
   * Function that created HH sensor
   * @param {Object} hhSensorDetails - Object that contains list of hh sensor details
   * @param {String} hhSensorDetails.hhSensorId - Id used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorType - sensor type used to create hh sensor
   * @param {String} hhSensorDetails.sensorManufacturer - Manufacturer name used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorName- sensor name used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorPolicy- sensor policy used to create hh sensor
   * @param {String} hhSensorDetails.manualDispenseCounts- dispense counts used to create hh sensor
   * @param {String} hhSensorDetails.building- building name used to create hh sensor
   * @param {String} hhSensorDetails.floor- floor name used to create hh sensor
   * @param {String} hhSensorDetails.location- location name used to create hh sensor
   * @param {String} hhSensorDetails.associatedLocation- associated location used to create hh sensor
   */
  static createHhSensor = (hhSensorDetails) => {
    const {
      hhSensorId,
      hhSensorType,
      sensorManufacturer,
      hhSensorName,
      hhSensorPolicy,
      manualDispenseCounts,
      building,
      floor,
      location,
      associatedLocation,
    } = hhSensorDetails

    //Navigate to add HH sensor page
    Click.forcefullyOn(addHhSensor)
    Verify.theElement(createBtn).isDisabled()
    Click.forcefullyOn(manufacturer)
    cy.contains(sensorManufacturer).click(commandOptions.force)
    //Verifying the manufacture details
    cy.get(manufacturer).then((value) => {
      let currentManufacturer = value.text()
      if (currentManufacturer === hid) {
        cy.get(hhSensorPolicySel).should('be.enabled')
        Type.theText(hhSensorPolicy).into(hhSensorPolicySel)
      } else if (currentManufacturer === kontakt) {
        cy.get(hhSensorPolicySel).should('be.disabled')
      }
    })
    Type.theText(hhSensorId).into(hhSensorIdSel)
    //Verifying sensor type field
    Click.forcefullyOn(hhSensorTypeSel)
    cy.contains(hhSensorType).click(commandOptions.force)
    cy.get(hhSensorTypeSel).then((value) => {
      let sensorType = value.text()
      if (sensorType === manual) {
        cy.get(manualDispenseCountSel).should('be.enabled')
        Type.theText(manualDispenseCounts).into(manualDispenseCountSel)
      } else if (sensorType === automatic) {
        cy.get(manualDispenseCountSel).should('be.disabled')
      }
    })
    Type.theText(hhSensorName).into(hhSensorNameSel)
    //Verifying create button
    Verify.theElement(createBtn).isEnabled()
    //Updating location details
    Click.forcefullyOn(buildingSel)
    cy.contains(building).click(commandOptions.force)
    Click.forcefullyOn(floorSel)
    cy.contains(floor).click(commandOptions.force)
    cy.contains(labelTag, Location).next().should('be.enabled').click(commandOptions.force)
    cy.contains(location).click(commandOptions.force)
    cy.contains(labelTag, associatedLocationLabel).next().should('be.enabled').click(commandOptions.force)
    cy.contains(associatedLocation).click(commandOptions.force)
    //Verifying unassign button
    Verify.theElement(unassignGateway).isDisabled()
    //Verifying create button
    Click.forcefullyOn(createBtn)
  }

  /**
   * Function that verifies HH sensor on side panel
   * @param {Object} hhSensorDetails - Object that contains list of hh sensor details
   * @param {String} hhSensorDetails.hhSensorId - Id used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorType - sensor type used to create hh sensor
   * @param {String} hhSensorDetails.sensorManufacturer - Manufacturer name used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorName- sensor name used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorPolicy- sensor policy used to create hh sensor
   * @param {String} hhSensorDetails.manualDispenseCounts- dispense counts used to create hh sensor
   * @param {String} hhSensorDetails.building- building name used to create hh sensor
   * @param {String} hhSensorDetails.floor- floor name used to create hh sensor
   * @param {String} hhSensorDetails.location- location name used to create hh sensor
   * @param {String} hhSensorDetails.associatedLocation- associated location used to create hh sensor
   */
  static verifyDataFromSidePanel = (hhSensorDetails) => {
    const { hhSensorId, hhSensorType, sensorManufacturer, hhSensorName, hhSensorPolicy, building, floor, location, associatedLocation } =
      hhSensorDetails

    const sidePanelDataForHID = {
      'HH Sensor Type': hhSensorType,
      'HH Sensor Name': hhSensorName,
      'HH Sensor Policy': hhSensorPolicy,
      Manufacturer: sensorManufacturer,
      Building: building,
      Floor: floor,
      Location: location,
      'Associated Location': associatedLocation,
    }

    const sidePanelDataForKontakt = {
      'HH Sensor Type': hhSensorType,
      'HH Sensor Name': hhSensorName,
      'HH Sensor Policy': '-',
      Manufacturer: sensorManufacturer,
      Building: building,
      Floor: floor,
      Location: location,
      'Associated Location': associatedLocation,
    }
    HelperFunction.search(hhSensorId, false)
    HelperFunction.getRowByItemName(hhSensorId, rowInTable, 'admin').as('data')
    Click.forcefullyOn('@data')
    Verify.theElement(nameInSidePanel).hasText(hhSensorId)
    //Verifying the data on side panel
    if (sensorManufacturer === hid) {
      HelperFunction.verifyValueFromSidePanel(sidePanelDataForHID, sidePanel)
    } else {
      HelperFunction.verifyValueFromSidePanel(sidePanelDataForKontakt, sidePanel)
    }
  }

  /**
   * Function that verifies HH sensor on table view
   * @param {Object} hhSensorDetails - Object that contains list of hh sensor details
   * @param {String} hhSensorDetails.hhSensorId - Id used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorType - sensor type used to create hh sensor
   * @param {String} hhSensorDetails.sensorManufacturer - Manufacturer name used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorName- sensor name used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorPolicy- sensor policy used to create hh sensor
   * @param {String} hhSensorDetails.manualDispenseCounts- dispense counts used to create hh sensor
   * @param {String} hhSensorDetails.building- building name used to create hh sensor
   * @param {String} hhSensorDetails.floor- floor name used to create hh sensor
   * @param {String} hhSensorDetails.location- location name used to create hh sensor
   * @param {String} hhSensorDetails.associatedLocation- associated location used to create hh sensor
   */
  static verifyDataInTableView = (hhSensorDetails) => {
    const { hhSensorId, hhSensorType, hhSensorPolicy, sensorManufacturer, location, associatedLocation } = hhSensorDetails
    const valuesToVerifyKontak = { hhSensorId, hhSensorType, sensorManufacturer, location, associatedLocation }
    const valuesToVerifyHID = { hhSensorId, hhSensorType, hhSensorPolicy, sensorManufacturer, location, associatedLocation }
    //Search HH sensor Id
    HelperFunction.search(hhSensorId, false)
    //Switching to table view
    Click.forcefullyOn(tableViewButton)
    HelperFunction.getRowByItemName(hhSensorId, rowInTable, 'admin').as('hhSenorRow')
    if (sensorManufacturer === hid) {
      HelperFunction.verifyValuesExist('@hhSenorRow', valuesToVerifyHID)
    } else if (sensorManufacturer === kontakt) {
      //Verifying the data on table view
      HelperFunction.verifyValuesExist('@hhSenorRow', valuesToVerifyKontak)
    }
  }

  /**
   * Function that verifies HH sensor on table view
   * @param {Object} hhSensorDetails - Object that contains list of hh sensor details
   * @param {String} hhSensorDetails.hhSensorId - Id used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorType - sensor type used to create hh sensor
   * @param {String} hhSensorDetails.sensorManufacturer - Manufacturer name used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorName- sensor name used to create hh sensor
   * @param {String} hhSensorDetails.hhSensorPolicy- sensor policy used to create hh sensor
   * @param {String} hhSensorDetails.manualDispenseCounts- dispense counts used to create hh sensor
   * @param {String} hhSensorDetails.building- building name used to create hh sensor
   * @param {String} hhSensorDetails.floor- floor name used to create hh sensor
   * @param {String} hhSensorDetails.location- location name used to create hh sensor
   * @param {String} hhSensorDetails.associatedLocation- associated location used to create hh sensor
   * @param {String} hhSensorDetails.building_id - building id used to create hh sensor
   * @param {String} hhSensorDetails.floor_id - floor id used to create hh sensor
   * @param {String} hhSensorDetails.location_id - location id used to create hh sensor
   * @param {String} hhSensorDetails.associatedLocation_id - associated location id used to create hh sensor
   */
  static createHhSensorApi = (hhSensorDetails) => {
    const {
      hhSensorId,
      hhSensorType,
      sensorManufacturer,
      hhSensorName,
      hhSensorPolicy,
      manualDispenseCounts,
      building,
      floor,
      location,
      associatedLocation,
    } = hhSensorDetails
    let floorId, locationId, associatedLocationId, buildingsId
    // helper that wraps async into Cypress promise

    HelperFunction.search_API(floor, floors)
      .then(({ authToken, Id }) => {
        floorId = Id
      })
      .then(() => {
        HelperFunction.search_API(location, room)
          .then(({ authToken, Id }) => {
            locationId = Id
          })
          .then(() => {
            HelperFunction.search_API(associatedLocation, room)
              .then(({ authToken, Id }) => {
                associatedLocationId = Id
              })
              .then(() => {
                HelperFunction.search_API(associatedLocation, room)
                  .then(({ authToken, Id }) => {
                    associatedLocationId = Id
                  })
                  .then(() => {
                    HelperFunction.search_API(building, buildings).then(({ authToken, Id }) => {
                      buildingsId = Id
                    })
                  })
              })
          })
      })

    // return chain so Cypress waits
    return LoginPage.loginToApplication().then(({ authToken }) => {
      return cy
        .api({
          url: apiBaseURL + hhApiEndPoint,
          method: 'POST',
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          body: {
            networkAliases: {
              'hid-dispensers': {
                'SID-64': hhSensorId,
              },
            },
            networkId: 'hid-dispensers',
            data: [
              { path: 'associatedLocation/room/id', value: associatedLocationId },
              { path: 'associatedLocation/room/name', value: associatedLocation },
              { path: 'dispenserId', value: hhSensorId },
              { path: 'dispenserName', value: hhSensorName },
              { path: 'dispenserPolicy', value: hhSensorPolicy },
              { path: 'dispenserType', value: hhSensorType },
              { path: 'location/building/name', value: building },
              { path: 'location/building/id', value: buildingsId },
              { path: 'location/floor/id', value: floorId },
              { path: 'location/floor/name', value: floor },
              { path: 'location/room/id', value: locationId },
              { path: 'location/room/name', value: location },
              { path: 'manualDispenseCounts', value: manualDispenseCounts },
              { path: 'manufacturer', value: sensorManufacturer },
            ],
            name: hhSensorName,
          },
        })
        .then((res) => {
          if (res.status === 200) {
            cy.log('✅ Created HH sensor')
            expect(res.body.data.dispenserId).to.equal(hhSensorId)
            expect(res.body.data.dispenserName).to.equal(hhSensorName)

            const hhId = res.body.id
            return cy
              .api({
                url: apiBaseURL + baseEndPoint + `buildings/${buildingsId}/floors/${floorId}/rooms/${locationId}/dispenser`,
                method: 'POST',
                failOnStatusCode: false,
                headers: { authorization: authToken },
                body: { id: hhId },
              })
              .then((res) => {
                if (res.status === 200) {
                  cy.log('✅ Location assigned to HH sensor')
                } else {
                  cy.log('❌ Unable to assign location to HH sensor')
                }
              })
          } else {
            cy.log('❌ Unable to create HH sensor')
          }
        })
    })
  }

  /**
   * Functions that edit the created hh sensor
   * @param {Object} hhSensorDetails - Object that contains list of hh sensor details
   * @param {String} hhSensorDetails.hhSensorId - Id used to edit hh sensor
   * @param {String} hhSensorDetails.hhSensorType - sensor type used to edit hh sensor
   * @param {String} hhSensorDetails.sensorManufacturer - Manufacturer name used to edit hh sensor
   * @param {String} hhSensorDetails.hhSensorName- sensor name used to edit hh sensor
   * @param {String} hhSensorDetails.hhSensorPolicy- sensor policy used to edit hh sensor
   * @param {String} hhSensorDetails.manualDispenseCounts- dispense counts used to edit hh sensor
   * @param {String} hhSensorDetails.building- building name used to edit hh sensor
   * @param {String} hhSensorDetails.floor- floor name used to edit hh sensor
   * @param {String} hhSensorDetails.location- location name used to edit hh sensor
   * @param {String} hhSensorDetails.associatedLocation- associated location used to edit hh sensor
   * @param {String} alertAction - Place where action needs to be done
   */
  static editHhSensor = (hhSensorDetails, alertAction) => {
    const {
      hhSensorId,
      hhSensorType,
      sensorManufacturer,
      hhSensorName,
      hhSensorPolicy,
      manualDispenseCounts,
      building,
      floor,
      location,
      associatedLocation,
    } = hhSensorDetails
    //Switching to table view
    Click.forcefullyOn(tableViewButton)
    HelperFunction.search(hhSensorId)
    HelperFunction.getRowByItemName(hhSensorId, rowInTable, 'admin').as('hhSenorRow')
    if (alertAction === tableBtn) {
      cy.get(scrollBar).scrollTo(scrollRight, duration)
      Click.onButton('@hhSenorRow', editBtn)
    } else if (alertAction === sidePanelBtn) {
      Click.forcefullyOn('@hhSenorRow')
      Click.forcefullyOn(editBtn)
    }
    //Verifying save button
    Verify.theElement(createBtn).isDisabled()
    //Verifying unassign button
    Verify.theElement(unassignGateway).isEnabled()
    Click.forcefullyOn(manufacturer)
    cy.contains(sensorManufacturer).click(commandOptions.force)
    //Verifying the manufacture details
    cy.get(manufacturer).then((value) => {
      let currentManufacturer = value.text()
      if (currentManufacturer === hid) {
        cy.get(hhSensorPolicySel).should('be.enabled')
        Type.theText(hhSensorPolicy).into(hhSensorPolicySel)
      } else if (currentManufacturer === kontakt) {
        cy.get(hhSensorPolicySel).should('be.disabled')
      }
    })
    Type.theText(hhSensorId).into(hhSensorIdSel)
    //Verifying sensor type field
    Click.forcefullyOn(hhSensorTypeSel)
    cy.contains(sensorTypeSel, hhSensorType).click(commandOptions.force)
    cy.get(hhSensorTypeSel).then((value) => {
      let sensorType = value.text()
      if (sensorType === manual) {
        cy.get(manualDispenseCountSel).should('be.enabled')
        Type.theText(manualDispenseCounts).into(manualDispenseCountSel)
      } else if (sensorType === automatic) {
        cy.get(manualDispenseCountSel).should('be.disabled')
      }
    })
    Type.theText(hhSensorName).into(hhSensorNameSel)
    //Updating location details
    Click.forcefullyOn(buildingSel)
    cy.contains(building).click(commandOptions.force)
    Click.forcefullyOn(floorSel)
    cy.contains(floor).click(commandOptions.force)
    cy.contains(labelTag, Location).next().should('be.enabled').click(commandOptions.force)
    cy.contains(location).click(commandOptions.force)
    cy.contains(labelTag, associatedLocationLabel).next().should('be.enabled').click(commandOptions.force)
    cy.contains(associatedLocation).click(commandOptions.force)
    //create button
    Click.forcefullyOn(createBtn)
  }

  /**
   * This function is used to delete Hh sensor
   * @param {String} hhSensorId  - The ID of sensor which is used to achieve delete functionality
   * @param {String} alertAction - Place where action needs to be done
   */
  static deleteHhSensor = (hhSensorId, alertAction) => {
    // Switch to table view and search for the sensor
    Click.forcefullyOn(tableViewButton)
    HelperFunction.search(hhSensorId)
    HelperFunction.getRowByItemName(hhSensorId, rowInTable, 'admin').as('hhSensorRow')

    const attemptDelete = (deleteSelector) => {
      cy.get(deleteSelector).then((deleteElement) => {
        if (deleteElement.prop('disabled')) {
          // If sensor is disabled, verify and delete
          HelperFunction.getElementFromSpecificDiv('@hhSensorRow', selectors.deviceManagementPageSel.deleteButton).as('deleteGateway')
          Click.forcefullyOn('@deleteGateway')
          // Verify the confirmation
          Verify.theElement(canNotDeleteMessage).hasText(deleteHhSensorConfirmation)
          Click.forcefullyOn(deleteButtonOnPopup)
          // Verify the toast message
          Verify.theToast.showsToastMessage(messageAfterHhSensorDeletion)
        } else {
          Click.forcefullyOn(deleteBtn)

          // Verify the confirmation if sensor couldn't be deleted
          Verify.theElement(canNotDeleteMessage).contains(unableToDeleteHhSensor)
          Click.forcefullyOn(dialogueCancel_ContinueBtn)
        }
      })
    }

    const handleTableButton = () => {
      cy.get(scrollBar).scrollTo(scrollRight, duration)
      HelperFunction.getElementFromSpecificDiv('@hhSensorRow', selectors.deviceManagementPageSel.unassignGateway).as('unassignGateway')
      attemptDelete('@unassignGateway')
    }

    const handleSidePanelButton = () => {
      Click.forcefullyOn('@hhSensorRow')
      HelperFunction.getElementFromSpecificDiv(selectors.deviceManagementPageSel.sidePanel, selectors.deviceManagementPageSel.unassignGateway).as(
        'unassignGateway'
      )
      attemptDelete('@unassignGateway')
    }

    const handleEditMenu = () => {
      Click.forcefullyOn('@hhSensorRow')
      HelperFunction.getElementFromSpecificDiv(
        selectors.deviceManagementPageSel.sidePanel,
        selectors.deviceManagementPageSel.editButtonOnSidePanel
      ).as('editBtn')
      Click.forcefullyOn('@editBtn')
      Verify.theElement(createBtn).isDisabled()
      cy.get(unassignGateway).then((unAssignHhSensor) => {
        if (unAssignHhSensor.prop('disabled')) {
          Click.forcefullyOn(deleteBtn)
          // Verify the confirmation
          Verify.theElement(canNotDeleteMessage).hasText(deleteHhSensorConfirmation)
          Click.forcefullyOn(deleteButtonOnPopup)
          // Verify the toast message
          Verify.theToast.showsToastMessage(messageAfterHhSensorDeletion)
        } else {
          Click.forcefullyOn(deleteBtn)
        }
      })
    }

    // Choose the appropriate action based on alertAction
    if (alertAction === tableBtn) {
      handleTableButton()
    } else if (alertAction === sidePanelBtn) {
      handleSidePanelButton()
    } else if (alertAction === editMenu) {
      handleEditMenu()
    }
  }

  /**
   * This function is used to unassign  Hh sensor
   * @param {String} hhSensorId  - The ID of sensor which is used to achieve unassign functionality
   * @param {String} alertAction - Place where action needs to be done
   */
  static unassignHhSensor = (hhSensorId, alertAction) => {
    // Switch to table view and search for the sensor
    Click.forcefullyOn(tableViewButton)
    HelperFunction.search(hhSensorId, true)
    HelperFunction.getRowByItemName(hhSensorId, rowInTable, 'admin').as('hhSensorRow')

    const attemptUnassign = (unassignSelector) => {
      cy.get(unassignSelector).then((unassignElement) => {
        if (unassignElement.attr('disabled')) {
          cy.log('Location not assigned for the sensor')
        } else {
          cy.get(unassignSelector).click(commandOptions.force)
        }
      })
    }

    const handleTableButton = () => {
      cy.get(scrollBar).scrollTo(scrollRight, duration)
      HelperFunction.getElementFromSpecificDiv('@hhSensorRow', selectors.deviceManagementPageSel.unassignGateway).as('unassignGateway')
      attemptUnassign('@unassignGateway')
    }

    const handleSidePanelButton = () => {
      cy.get('@hhSensorRow').click(commandOptions.force)
      HelperFunction.getElementFromSpecificDiv(selectors.deviceManagementPageSel.sidePanel, selectors.deviceManagementPageSel.unassignGateway).as(
        'unassignGateway'
      )
      attemptUnassign('@unassignGateway')
    }

    const handleEditMenu = () => {
      Click.forcefullyOn('@hhSensorRow')
      HelperFunction.getElementFromSpecificDiv(
        selectors.deviceManagementPageSel.sidePanel,
        selectors.deviceManagementPageSel.editButtonOnSidePanel
      ).as('editButton')
      Click.forcefullyOn('@editButton')
      Verify.theElement(createBtn).isDisabled()
      cy.get(unassignGateway)
        .wait(5000) // Necessary wait due to slow DOM loading
        .then((unassignElement) => {
          if (unassignElement.attr('disabled')) {
            cy.log('Location not assigned for the sensor')
          } else {
            Click.forcefullyOn(unassignGateway)
          }
        })
    }

    // Choose action path
    if (alertAction === tableBtn) {
      handleTableButton()
    } else if (alertAction === sidePanelBtn) {
      handleSidePanelButton()
    } else if (alertAction === editMenu) {
      handleEditMenu()
    }

    // Final confirmation and cleanup
    Verify.theElement(canNotDeleteMessage).hasText(unAssignHhSensorConfirmation)
    Click.forcefullyOn(deleteButtonOnPopup)
    Verify.theToast.showsToastMessage(messageAfterUnAssignHhSensor)
    HelperFunction.navigateToModule(button, hhSensorManagement)
  }

  /**
   * This function is used to unassign and delete Hh sensor using API
   * @param {Object} hhSensorDetails - Object that contains list of hh sensor details
   * @param {String} hhSensorDetails.hhSensorId - Id used to edit hh sensor
   * @param {String} hhSensorDetails.building- building name used to unassign hh sensor
   * @param {String} hhSensorDetails.floor - floor name used to unassign hh sensor
   * @param {String} hhSensorDetails.location - location name used to unassign hh sensor
   */
  static unassignAndDeleteHHSensorAPI = (hhSensorDetails) => {
    const { hhSensorId, building, floor, location } = hhSensorDetails
    const searchEntity = async (name, collection) => {
      const { Id } = await HelperFunction.search_API(name, collection)
      return Id
    }
    const getIds = async (floor, location, building) => {
      const [floorId, locationId, buildingsId] = await Promise.all([
        searchEntity(floor, floors),
        searchEntity(location, room),
        searchEntity(building, buildings),
      ])
      return {
        floorId,
        locationId,
        buildingsId,
      }
    }
    getIds(floor, location, building).then(({ floorId, locationId, buildingsId }) => {
      HelperFunction.search_API(hhSensorId, hhSensor).then(({ authToken, Id }) => {
        cy.api({
          url: apiBaseURL + baseEndPoint + `buildings/${buildingsId}/floors/${floorId}/rooms/${locationId}/dispenser/${Id}`,
          method: 'DELETE',
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
        }).then((res) => {
          if (res.status === 200) {
            cy.log('unassigned the sensor')
          } else {
            cy.log('Failed to unassign the sensor')
          }
        })
        cy.api({
          url: apiBaseURL + baseEndPoint + `dispensers/${Id}`,
          method: 'DELETE',
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          body: {
            deleteDevice: 'force',
          },
        }).then((res) => {
          if (res.status === 200) {
            cy.log('Deleted the sensor')
          } else {
            cy.log('Failed to Delete the sensor')
          }
        })
      })
    })
  }

  /**
   * This function is used to unassign and delete Hh sensor using API
   * @param {Object} hhSensorDetails - Object that contains list of hh sensor details
   * @param {String} hhSensorDetails.hhSensorId - Id used to edit hh sensor
   * @param {String} hhSensorDetails.building- building name used to unassign hh sensor
   * @param {String} hhSensorDetails.floor - floor name used to unassign hh sensor
   * @param {String} hhSensorDetails.location - location name used to unassign hh sensor
   */
  static deleteHHSensorAPI = (hhSensorId) => {
    HelperFunction.search_API(hhSensorId, hhSensor).then(({ authToken, Id }) => {
      cy.api({
        url: apiBaseURL + baseEndPoint + `dispensers/${Id}`,
        method: 'DELETE',
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
        body: {
          deleteDevice: 'force',
        },
      }).then((res) => {
        if (res.status === 200) {
          cy.log('Deleted the sensor')
        } else {
          cy.log('Failed to Delete the sensor')
        }
      })
    })
  }

  /**
   * This function is used to create gateway and assign it to a location
   * @param {Object} gatewayDetails  - It is an object that contains data for creating gateway
   * @param {String} gatewayDetails.gatewaySID - Id that is used to create a gateway
   * @param {String} gatewayDetails.gatewayType - Type that is used to create a gateway
   * @param {String} gatewayDetails.manufacturer - Manufacture type that is used to create an gateway
   * @param {String} gatewayDetails.gatewayName - Name of the gateway that is used to create a gateway
   * @param {String} gatewayDetails.gatewayPolicy - Policy name for the gateway
   */
  static createGatewayAPI = (gatewayDetails) => {
    const { gatewaySID, gatewayType, manufacturer, gatewayName, gatewayPolicy } = gatewayDetails
    LoginPage.loginToApplication().then(({ authToken }) => {
      cy.api({
        method: 'POST',
        failOnStatusCode: false,
        url: apiBaseURL + baseEndPoint + `blufis`,
        headers: {
          authorization: authToken,
        },
        body: {
          networkAliases: {
            'hid-blufis': {
              policyName: gatewayPolicy,
              'SID-64': gatewaySID,
            },
          },
          networkId: 'hid-blufis',
          data: [
            {
              path: 'manufacturer',
              value: manufacturer,
            },
            {
              path: 'gatewayType',
              value: gatewayType,
            },
            {
              path: 'gatewayPolicy',
              value: gatewayPolicy,
            },
            {
              path: 'gatewayId',
              value: gatewaySID,
            },
            {
              path: 'gatewayName',
              value: gatewayName,
            },
          ],
          name: gatewaySID,
        },
      }).then((response) => {
        if (response.status === 200) {
          cy.log('Gateway created successfully')
        } else {
          cy.log('unable to create gateway')
        }
      })
    })
  }

  /**
   * The Function is used to delete tags using API
   * @param {String} tagName - Name of the tag that needs to be deleted
   */
  static deleteTagAPI = (tagName, hospitalName) => {
    let tagId
    HelperFunction.search_API(hospitalName, hospital).then(({ authToken, Id }) => {
      let hospital = Id
      HelperFunction.search_API(tagName, tag, false, hospitalName).then(({ authToken, Id }) => {
        tagId = Id
        cy.api({
          method: 'DELETE',
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          url: apiBaseURL + tagActionsEndpoint(system_Id, hospital) + tagId,
          body: {
            deleteDevice: 'force',
          },
        }).then((response) => {
          if (response.status === 200) {
            cy.log('Tag  deleted successfully')
          } else {
            cy.log('Unable to delete Tag')
          }
        })
      })
    })
  }

  /**
   * The Function is used to delete tags using API
   * @param {String} sensor - Name of the sensor that needs to be deleted
   */
  static deleteSensorAPI = (sensor, hospitalName) => {
    let sensorId
    HelperFunction.search_API(hospitalName, hospital).then(({ authToken, Id }) => {
      let hospitalID = Id
      HelperFunction.search_API(sensor, leverageConstants.objectTypes.sensor, false, hospitalName).then(({ authToken, Id }) => {
        sensorId = Id
        cy.api({
          method: 'DELETE',
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          url: apiBaseURL + sensorActionsEndpoint(system_Id, hospitalID) + sensorId,
          body: {
            deleteDevice: 'force',
          },
        }).then((response) => {
          if (response.status === 200) {
            cy.log('Sensor  deleted successfully')
          } else {
            cy.log('Unable to delete sensor')
          }
        })
      })
    })
  }

  /**
   * The Function is used to delete gateway using API
   * @param {String} gatewaySID - Name of the gateway that needs to be deleted
   */
  static deleteGatewayAPI = (gatewaySID, hospitalName) => {
    let gatewayId
    HelperFunction.search_API(hospitalName, hospital).then(({ authToken, Id }) => {
      let hospital_Id = Id
      HelperFunction.search_API(gatewaySID, gateway, false, hospitalName).then(({ authToken, Id }) => {
        gatewayId = Id
        cy.api({
          method: 'DELETE',
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          url: apiBaseURL + gatewayActionsEndpoint(system_Id, hospital_Id) + gatewayId,
          body: {
            deleteDevice: 'force',
          },
        }).then((response) => {
          if (response.status === 200) {
            cy.log('Gateway  deleted successfully')
          } else {
            cy.log('Unable to delete Gateway')
          }
        })
      })
    })
  }

  /**
   * @param {object} tagDetails is an object that accepts the value tagType, Manufacturer, Model
   * @param {String} tagDetails.tagName - Name used to create tag
   * @param {String} tagDetails.tagType - Type of the tag
   * @param {String} tagDetails.Manufacturer - Manufacturer of the tag
   * @param {String} tagDetails.Model - Model of the tag
   */
  static createTagsAPI = (tagDetails) => {
    const { tagType, Manufacturer, Model, tagName } = tagDetails

    const tagActionsEndpoint = APIEndpoints.tagActionsEndpoint(system_Id, hospital_Id)

    cy.task('getAuthToken').then((authToken) => {
      cy.api({
        method: 'POST',
        failOnStatusCode: leverageConstants.failOnStatusCode,
        url: apiBaseURL + tagActionsEndpoint,
        headers: {
          authorization: authToken,
        },
        body: {
          networkAliases: {
            'hid-beacons': {
              deviceId: tagName,
            },
          },
          networkId: 'hid-beacons',
          data: [
            {
              path: 'uniqueDeviceId',
              value: tagName,
            },
            {
              path: 'manufacturer',
              value: Manufacturer,
            },
            {
              path: 'model',
              value: Model,
            },
            {
              path: 'type',
              value: tagType,
            },
          ],
          name: tagName,
        },
      }).then((res) => {
        expect(res.status).to.equal(200)
        expect(res.body).to.have.property('data')
        cy.log(`Tag ${tagName} created successfully`)
      })
    })
  }
}
