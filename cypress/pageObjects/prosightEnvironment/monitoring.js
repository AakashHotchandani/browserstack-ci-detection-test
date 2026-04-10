/// <reference types="cypress" />
import prosightEnvironmentSel from '../../utils/selectors/prosightEnvironment'
import commandOptions from '../../utils/constants/commandOptions'
import globalSels from '../../utils/selectors/globalSels'
import { Verify } from '../../utils/assertions'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import globalConst from '../../utils/constants/globalConst'
import prosightAssets from '../../utils/selectors/prosightAssets'
import monitoringConsts from '../../utils/constants/smartAlertsManagementConst'


const {
  viewOnMapButton,
  historicalLogButton
} = prosightAssets.smartLocation
const { inspectButton, inspectEqpTitle, inspectComment } = prosightEnvironmentSel.monitoring
const { inspectEquipment, inspect, inspectEquipmentMessage, inspectionCompleteMessage } = monitoringConsts.monitoring
const { iem } = globalConst.application
const { force, haveText } = commandOptions

/**
 *
 * @Class EquipmentMonitoring consists of static functions related to Equipment monitoring module
 */
export default class EquipmentMonitoring {
  /**
  
  Verifies the equipment details displayed in the side panel of the application.
  
  @function VerifyEquipementDataFromSidePanel
  
  @param {Object} equipmentData - The equipment data to verify.
  @param {string} equipmentData.equipmentName - Name of the equipment (title in side panel).
  @param {string} equipmentData.sensorId - Sensor ID of the equipment. 
  @param {string} equipmentData.departmentName - Department/assigned owner. 
  @param {string} equipmentData.buildingName - Name of the building.
  @param {string} equipmentData.floorName - Floor where the equipment is located. 
  @param {string} equipmentData.locationName - Specific location of the equipment. 
  @param {string} equipmentData.currentTemp - Current temperature reading. 
  @param {string} equipmentData.operatingTempRange - Operating temperature range. 
  @param {string} equipmentData.monitoredTempRange - Monitored temperature range. 
  @param {string} equipmentData.humidityRange - Humidity range. 
  @param {string} equipmentData.manufacturerName - Manufacturer of the equipment. 
  @param {string} equipmentData.lastClibrationDate - Date of last calibration. 
  @param {string} equipmentData.nextCalibrationDate - Date of next scheduled calibration.
  */
  static VerifyEquipementDataFromSidePanel = (equipmentData) => {
    const {
      equipmentName,
      sensorId,
      departmentName,
      buildingName,
      locationName,
      floorName,
      currentTemp,
      operatingTempRange,
      monitoredTempRange,
      humidityRange,
      manufacturerName,
      lastClibrationDate,
      nextCalibrationDate,
    } = equipmentData

    const sidePanelDataObj = {
      'Sensor ID': sensorId || '-',
      'Assigned Owner': departmentName || '-',
      Building: buildingName || '-',
      Floor: floorName || '-',
      Location: locationName || '-',
      'Current Temperature': currentTemp || '-',
      'Operating Temp. Range': operatingTempRange || '-',
      'Monitored Temp. Range': monitoredTempRange || '-',
      'Humidity Range': humidityRange || '-',
      'Manufacturer Name': manufacturerName || '-',
      'Last Calibration Date': lastClibrationDate || '-',
      'Next Calibration Date': nextCalibrationDate || '-',
    }

    //verify the equipment name which is a title in the sidepanel
    cy.get(globalSels.sidePanel).within(() => {
      Verify.theElement(`div[title="${equipmentName}"]`).hasText(equipmentName)
    })

    //Verify the map and history icons
    cy.get(globalSels.sidePanel).within(() => {
      cy.get(viewOnMapButton).should('be.visible')
      cy.get(historicalLogButton).should('be.visible')
    })

    //Verify the asset details
    HelperFunction.verifyValueFromSidePanel(sidePanelDataObj)
  }

  /**
 * Inspects an equipment item from the Equipment Monitoring table.
 *
 * This function:
 * 1. Searches for the equipment by name.
 * 3. Verifies the inspection popup content.
 * 4. Enters the inspection comment.
 * 5. Captures the exact date/time when the inspection is submitted.
 * 6. Stores the timestamp as a Cypress alias "@inspectionTime" for later verification.
 *
 * @function inspectEquipment
 * 
 * @param {string} equipmentName - The name of the equipment to search and inspect.
 */
  static inspectEquipment = (equipmentName) => {

    //search and select the equipment row by equipment name
    HelperFunction.search(equipmentName)
    HelperFunction.getRowByItemName(equipmentName, globalSels.rowInTable, iem).as('equipmentRow')

    //Verify and click on inpect button
    cy.get("@equipmentRow").find(inspectButton).click(force);
    cy.get(inspectEqpTitle).should(haveText, inspectEquipment)
    cy.get(inspectEqpTitle).next().should(haveText, inspectEquipmentMessage)
    cy.get(globalSels.confirmationBtnInConfirmationDialogue).should(haveText, inspect).should('be.enabled')
    cy.get(inspectComment).type(inspectionCompleteMessage)

    //Click on inpect button and get the time and date of inpected
    let clickTime = "";
    cy.get(globalSels.confirmationBtnInConfirmationDialogue).contains(inspect).click(force).then(() => {
      clickTime = new Date().toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
      cy.wrap(clickTime).as("inspectionTime");
    });

  }
}
