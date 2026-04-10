import Click from '../../utils/Interactions/click'
import prosightEnvironment from '../../utils/selectors/prosightEnvironment'
import globalSels from '../../utils/selectors/globalSels'
import smartRulesConstant from '../../utils/constants/prosightEnvironment/smartRulesConstant'
import commandOptions from '../../utils/constants/commandOptions'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import { Verify } from '../../utils/assertions'
import Type from '../../utils/Interactions/type'
import userData from '../../fixtures/SignIn/user.json'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import APIEndpoints from '../../../APIEndpoints'
const { username, name } = userData
const { addRule, cancelButton } = prosightEnvironment.smartRules
const { equipment } = leverageConstants.objectTypes
const system_Id = Cypress.env('SystemId')
const hospital_Id = Cypress.env('HospitalId')
const apiBaseURL = Cypress.env('API_BaseUrl')

const {
  createBtn,
  divTag,
  spanTag,
  button,
  confirmationPopup,
  dialogueDeleteBtn,
  inputTag,
  labelTag,
  dialogueCancel_ContinueBtn,
  sidePanel,
  editBtn,
  deleteBtn,
} = globalSels
const { equipmentNames, equipmentType, selectEquipmentName, confirmationPopUpText, sidePanels, tableView, editPage, deleteConfirmationPopUpText } =
  smartRulesConstant
const { verifyCreatedValue, verifyEditedValue } = smartRulesConstant.verificationData
const {
  searchEquipmentNameSelector,
  searchEquipmentTypeSelector,
  monitoredMaxTemp,
  monitoredMinTemp,
  optimalMinTempSelector,
  optimalMaxTempSelector,
  humidityMax,
  humidityMin,
  returnButton,
  row,
  equipmentNameSidePanel,
  deleteButtonOnEditPage,
  startTime,
  subtitle,
  day,
  frequency,
  toggleButton,
  secondInspctionToggel,
  searchBarOnDropdown,
  checkedItems,
} = prosightEnvironment.smartRules

/**
 * Class SmartRules consists static functions related to Smart Rules Module from IEM
 * @class SmartRules
 */

export default class SmartRules {
  /**
   * This function is used to create Environment rule
   * @param {Object} ruleData - The object that contains parameters to create environment rule
   * @param {String} ruleData.type - An environment type for which rules needs to be created
   * @param {String} ruleData.equipmentName - The equipment name for which rules needs to be created
   * @param {String} ruleData.minTemperature -The minimum temperature value for which rules needs to be created
   * @param {String} ruleData.maxTemperature - The maximum temperature value for which rules needs to be created
   * @param {String} ruleData.optimalMinTemperature - The Optimal Minimum temperature value for which rules needs to be created
   * @param {String} ruleData.optimalMaxTemperature - The Optimal Maximum temperature value for which rules needs to be created
   * @param {String} ruleData.minHumidity - The minimum humidity value for which rules needs to be created
   * @param {String} ruleData.minHumidity - The maximum humidity value for which rules needs to be created
   */
  static createEnvironmentRule = (ruleData) => {
    const { type, equipmentName, minTemperature, maxTemperature, optimalMinTemperature, optimalMaxTemperature, minHumidity, maxHumidity } = ruleData

    //Click on add rule
    Click.forcefullyOn(addRule)

    //Verifying the button
    Verify.theElement(createBtn).isDisabled()
    Verify.theElement(cancelButton).isEnabled()

    //Adding data on the form
    cy.contains(labelTag, equipmentType).next().click(commandOptions.force)
    Type.theText(type).into(searchEquipmentTypeSelector)
    cy.contains(divTag, type).click(commandOptions.force)
    cy.contains(spanTag, selectEquipmentName).click(commandOptions.force)
    Type.theText(equipmentName).into(searchEquipmentNameSelector)
    cy.contains(divTag, equipmentName).click(commandOptions.force)
    Type.theText(minTemperature).into(monitoredMinTemp)
    Type.theText(maxTemperature).into(monitoredMaxTemp)
    Type.theText(minHumidity).into(humidityMin)
    Type.theText(maxHumidity).into(humidityMax)
    Verify.theElement(createBtn).isEnabled()
    Type.theText(optimalMinTemperature).into(optimalMinTempSelector)
    Type.theText(optimalMaxTemperature).into(optimalMaxTempSelector)

    //Saving the created rule
    Click.forcefullyOn(createBtn)
    Verify.theElement(confirmationPopup).hasText(confirmationPopUpText)
    Verify.theElement(dialogueCancel_ContinueBtn).isEnabled()
    Verify.theElement(returnButton).isEnabled()
    Click.forcefullyOn(returnButton)
  }

  /**
   * This function is used to Verify an Environment rule
   * @param {Object} ruleData - The object that contains parameters to Verify an environment rule
   * @param {String} ruleData.type - An environment type for which rules needs to be verified
   * @param {String} ruleData.equipmentName - The equipment name for which rules needs to be verified
   * @param {String} ruleData.minTemperature -The minimum temperature value for which rules needs to be verified
   * @param {String} ruleData.maxTemperature - The maximum temperature value for which rules needs to be verified
   * @param {String} ruleData.optimalMinTemperature - The Optimal Minimum temperature value for which rules needs to be verified
   * @param {String} ruleData.optimalMaxTemperature - The Optimal Maximum temperature value for which rules needs to be verified
   * @param {String} ruleData.minHumidity - The minimum humidity value for which rules needs to be verified
   * @param {String} ruleData.minHumidity - The maximum humidity value for which rules needs to be verified
   */
  static verifyEnvironmentRuleOnTableView = (ruleData) => {
    const { type, equipmentName, minTemperature, maxTemperature, optimalMinTemperature, optimalMaxTemperature, minHumidity, maxHumidity } = ruleData
    let minTemperatureVal = minTemperature + '°C'
    let maxTemperatureVal = maxTemperature + '°C'
    let optiMinTempVal = optimalMinTemperature + '°C'
    let optiMaxTempVal = optimalMaxTemperature + '°C'
    let humMax = minHumidity + '%'
    let humMin = maxHumidity + '%'
    //Data to verify on table view
    const finalValue = { type, equipmentName, minTemperatureVal, maxTemperatureVal, optiMinTempVal, optiMaxTempVal, humMax, humMin }

    //Search Equipment name
    HelperFunction.search(equipmentName)
    HelperFunction.getRowByItemName(equipmentName, row, 'environment').as('data')

    //Verifying data in table
    HelperFunction.verifyValuesExist('@data', finalValue)
  }

  /**
   * This function contains function that needs to verify the side panel
   * @param {Object} equipmentData - The Object that contains parameter to verify environment rule
   * @param {Object} equipmentData.id - An Equipment Id for which rule needs to be verified
   * @param {Object} equipmentData.departmentName - The department name for which rule needs to be verified
   * @param {Object} equipmentData.locationName - The location name for which rule needs to be verified
   * @param {Object} sensorDetails - The Object that contains parameter to verify environment rule
   * @param {String} sensorDetails.sensorId - The Sensor Id for which rule needs to be verified
   * @param {Object} ruleData - The object that contains parameters to Verify an environment rule
   * @param {String} ruleData.type - An environment type for which rules needs to be verified
   * @param {String} ruleData.equipmentName - The equipment name for which rules needs to be verified
   * @param {String} ruleData.minTemperature -The minimum temperature value for which rules needs to be verified
   * @param {String} ruleData.maxTemperature - The maximum temperature value for which rules needs to be verified
   * @param {String} ruleData.optimalMinTemperature - The Optimal Minimum temperature value for which rules needs to be verified
   * @param {String} ruleData.optimalMaxTemperature - The Optimal Maximum temperature value for which rules needs to be verified
   * @param {String} ruleData.minHumidity - The minimum humidity value for which rules needs to be verified
   * @param {String} ruleData.minHumidity - The maximum humidity value for which rules needs to be verified
   */
  static verifyEnvironmentRuleOnSidePanel = (equipmentData, sensorDetails, ruleData) => {
    let minTemperatureVal, maxTemperatureVal, optiMinTempVal, optiMaxTempVal, humMax, humMin, today, dd, mm, yyyy, formattedDate
    const { id, departmentName, locationName } = equipmentData
    const { sensorId } = sensorDetails
    //Data fot verifying the data fromm side panel
    const { type, equipmentName, minTemperature, maxTemperature, optimalMinTemperature, optimalMaxTemperature, minHumidity, maxHumidity } = ruleData
    minTemperatureVal = minTemperature + '°C'
    maxTemperatureVal = maxTemperature + '°C'
    optiMinTempVal = optimalMinTemperature + '°C'
    optiMaxTempVal = optimalMaxTemperature + '°C'
    humMax = maxHumidity + '%'
    humMin = minHumidity + '%'
    //Getting the current date
    today = new Date()
    dd = today.getDate()
    mm = today.getMonth() + 1
    yyyy = today.getFullYear()

    if (dd < 10) {
      dd = '0' + dd
    }

    if (mm < 10) {
      mm = '0' + mm
    }
    //converting the date format
    formattedDate = mm + '/' + dd + '/' + yyyy

    const sidePanelData = {
      'Equipment ID': id,
      'Equipment Type': type,
      'Sensor ID': sensorId,
      'Sensor Battery': '',
      'Assigned Owner': departmentName,
      Location: locationName,
      'Optimal Range': optiMinTempVal + ' to ' + optiMaxTempVal,
      'Monitored Temp. Range': minTemperatureVal + ' to ' + maxTemperatureVal,
      'Humidity Range': humMin + ' to ' + humMax,
      'Last Updated': formattedDate,
      'Created by': name,
    }
    //Searching the rule
    HelperFunction.search(equipmentName)
    HelperFunction.getRowByItemName(equipmentName, row, 'environment').as('data')
    Click.forcefullyOn('@data')

    //Verifying the data on side panel
    Verify.theElement(equipmentNameSidePanel).hasText(equipmentName)
    HelperFunction.verifyValueFromSidePanel(sidePanelData, sidePanel)
  }

  /**
   * This function is used to edit the created environment rule
   * @param {Object} ruleData - The object that contains parameters to edit an environment rule
   * @param {String} ruleData.type - An environment type for which rules needs to be edited
   * @param {String} ruleData.equipmentName - The equipment name for which rules needs to be edited
   * @param {String} ruleData.minTemperature -The minimum temperature value for which rules needs to be edited
   * @param {String} ruleData.maxTemperature - The maximum temperature value for which rules needs to be edited
   * @param {String} ruleData.optimalMinTemperature - The Optimal Minimum temperature value for which rules needs to be edited
   * @param {String} ruleData.optimalMaxTemperature - The Optimal Maximum temperature value for which rules needs to be edited
   * @param {String} ruleData.minHumidity - The minimum humidity value for which rules needs to be edited
   * @param {String} ruleData.minHumidity - The maximum humidity value for which rules needs to be edited
   * @param {String} action - the place from where edit action needs to be done
   */
  static editEnvironmentRule = (ruleData, action) => {
    const { type, equipmentName, minTemperature, maxTemperature, optimalMinTemperature, optimalMaxTemperature, minHumidity, maxHumidity } = ruleData
    //Searching the equipment name
    HelperFunction.search(equipmentName)
    HelperFunction.getRowByItemName(equipmentName, row, 'environment').as('data')

    //Place where edit functionality needs to be done
    if (action === tableView) {
      Click.onButton('@data', editBtn)
    } else if (action === sidePanels) {
      Click.forcefullyOn('@data')
      Click.onButton(sidePanel, editBtn)
    }
    //Verifying the equipment name and type
    Verify.theElementNextToLabel(equipmentType).contains(type)
    Verify.theElementNextToLabel(equipmentNames).contains(equipmentName)

    //Verifying the button
    Verify.theElement(createBtn).isDisabled()
    Verify.theElement(cancelButton).isEnabled()

    //Entering details on the form
    Type.theText(minTemperature).into(monitoredMinTemp)
    Type.theText(maxTemperature).into(monitoredMaxTemp)
    Verify.theElement(createBtn).isEnabled()
    Type.theText(minHumidity).into(humidityMin)
    Type.theText(maxHumidity).into(humidityMax)
    Type.theText(optimalMinTemperature).into(optimalMinTempSelector)
    Type.theText(optimalMaxTemperature).into(optimalMaxTempSelector)

    //Saving the edited details
    Click.forcefullyOn(createBtn)
  }

  /**
   * This Function is used to delete Environment/Inspection rule
   * @param {String} equipmentName  - Name of an Equipment For which rule needs to be deleted
   * @param {String} action - Place where delete action needs to be done
   */
  static deleteRule = (equipmentName, action) => {
    //Searching the rule
    HelperFunction.search(equipmentName)
    HelperFunction.getRowByItemName(equipmentName, row, 'environment').as('data')
    if (action === tableView) {
      //Deleting the data from table view
      Click.onButton('@data', deleteBtn)
    } else if (action === sidePanels) {
      //Deleting the data from side panel
      Click.forcefullyOn('@data')
      Click.onButton(sidePanel, deleteBtn)
    } else if (action === editPage) {
      //Deleting the data from edit page
      Click.onButton('@data', editBtn)
      Verify.theElement(deleteButtonOnEditPage).isEnabled()
      Click.onDeleteButton()
      Click.forcefullyOn(dialogueDeleteBtn) //Using this here again because there is a incorrect api call
    }
    //Deleting the rule
    Verify.theElement(confirmationPopup).hasText(deleteConfirmationPopUpText)
    Verify.theElement(dialogueDeleteBtn).isEnabled()
    Verify.theElement(dialogueCancel_ContinueBtn).isEnabled()
    Click.forcefullyOn(dialogueDeleteBtn)
  }

  /**
   * This function is used to create inspection Rule
   * @param {Object} ruleData  - This object contains parameters for creating inspection rule data
   * @param {String} ruleData.type - An environment type for which rules needs to be created
   * @param {String} ruleData.equipmentName - The equipment name for which rules needs to be created
   * @param {String} ruleData.frequencyValue - The frequency name for which rules needs to be created
   * @param {String} ruleData.monthValue - The Month for which rules needs to be created
   * @param {String} ruleData.weeklyValue - The Week for which rules needs to be created
   * @param {String} ruleData.timeValue - The time for which rules needs to be created
   */
  static createInspectionRule = (ruleData) => {
    const { type, equipmentName, frequencyValue, monthValue, weeklyValue, timeValue } = ruleData

    //Click on add Rule button
    Click.forcefullyOn(addRule)

    //Verifying button
    Verify.theElement(createBtn).isDisabled()
    Verify.theElement(cancelButton).isEnabled()

    //Add all the details on the form
    cy.contains(labelTag, equipmentType).next().click(commandOptions.force)
    Type.theText(type).into(searchEquipmentTypeSelector)
    cy.contains(divTag, type).click(commandOptions.force)
    cy.contains(spanTag, selectEquipmentName).click(commandOptions.force)
    Type.theText(equipmentName).into(searchEquipmentNameSelector)
    cy.contains(divTag, equipmentName).click(commandOptions.force)
    Click.forcefullyOn(frequency)
    Type.theText(frequencyValue).into(searchBarOnDropdown)
    cy.contains(divTag, frequencyValue).click(commandOptions.force)
    if (frequencyValue === 'Monthly') {
      Click.forcefullyOn(day)
      Type.theText(monthValue).into(searchBarOnDropdown)
      cy.contains(checkedItems, monthValue).click(commandOptions.force)
    } else if (frequencyValue === 'Weekly') {
      Click.forcefullyOn(day)
      Type.theText(weeklyValue).into(searchBarOnDropdown)
      cy.contains(checkedItems, weeklyValue).click(commandOptions.force)
    }
    Click.forcefullyOn(startTime)
    Type.theText(timeValue).into(searchBarOnDropdown)
    cy.contains(divTag, timeValue).click(commandOptions.force)

    //Verifying button
    Verify.theElement(createBtn).isEnabled()

    //Creating rule by clicking n confirm button
    Click.forcefullyOn(createBtn)
    Verify.theElement(confirmationPopup).hasText(confirmationPopUpText)
    Verify.theElement(dialogueCancel_ContinueBtn).isEnabled()
    Verify.theElement(returnButton).isEnabled()
    Click.forcefullyOn(returnButton)
  }

  /**
   * This function is used to verify the inspection rule data on the table view
   * @param {Object} ruleData  - This object contains parameters for verifying  inspection rule data
   * @param {String} ruleData.type - An environment type for which rules needs to be verified
   * @param {String} ruleData.equipmentName - The equipment name for which rules needs to be verified
   * @param {String} ruleData.frequencyValue - The frequency name for which rules needs to be verified
   * @param {String} ruleData.weeklyValue - The Week for which rules needs to be verified
   * @param {String} ruleData.secondInspectionDay - The second inspection day for which rules needs to be verified
   * @param {String} ruleData.secondInspectionTime - The second inspection time for which rules needs to be verified
   * @param {String} ruleData.timeValue - The time for which rules needs to be verified
   * @param {String} action - The set of values which needs to be verified
   */
  static verifyInspectionRuleOnTableView = (ruleData) => {
    const {
      type,
      equipmentName,
      frequencyValue,
      weeklyValue,
      timeValue,
      secondInspectionDay,
      secondInspectionTime,
      monthValue,
      secondInspectionMonth,
    } = ruleData
    HelperFunction.search(equipmentName)
    HelperFunction.getRowByItemName(equipmentName, row, 'environment').as('data')
    HelperFunction.verifyValuesExist('@data', ruleData)
  }

  /**
   * This function is used to verify the inspection rule data on the side panel
   * @param {Object} ruleData  - This object contains parameters for verifying  inspection rule data
   * @param {Object} equipmentData -This object contains parameter for verifying inspection rule data
   * @param {String} equipmentData.id - An id fow which rules to be verified
   * @param {String} ruleData.type - An environment type for which rules needs to be verified
   * @param {String} ruleData.equipmentName - The equipment name for which rules needs to be verified
   * @param {String} ruleData.frequencyValue - The frequency name for which rules needs to be verified
   * @param {String} ruleData.monthValue - The Month for which rules needs to be verified
   * @param {String} ruleData.secondInspectionDay - The second inspection day for which rules needs to be verified
   * @param {String} ruleData.secondInspectionTime - The second inspection time for which rules needs to be verified
   * @param {String} ruleData.timeValue - The time for which rules needs to be verified
   * @param {String} action - The set of values which needs to be verified
   */
  static verifyInspectionRuleOnSidePanel = (equipmentData, ruleData, action) => {
    let firstInspection, secondInspection
    const { id } = equipmentData
    const {
      type,
      equipmentName,
      frequencyValue,
      weeklyValue,
      timeValue,
      secondInspectionDay,
      secondInspectionTime,
      monthValue,
      secondInspectionMonth,
    } = ruleData

    if (action == verifyCreatedValue) {
      firstInspection = weeklyValue
      secondInspection = secondInspectionDay
    } else if (action == verifyEditedValue) {
      firstInspection = monthValue
      secondInspection = secondInspectionMonth
    }
    //Data to verify the created rule
    const sidePanelData = {
      'Equipment ID': id,
      'Equipment Type': type,
      Frequency: frequencyValue,
      'First Inspection Day': firstInspection,
      'First Inspection Time': timeValue,
      'Second Inspection Day': secondInspection,
      'Second Inspection Time': secondInspectionTime,
    }

    //Searching the equipment name
    HelperFunction.search(equipmentName)
    HelperFunction.getRowByItemName(equipmentName, row, 'environment').as('data')
    Click.forcefullyOn('@data')

    //Verifying the data on side panel
    Verify.theElement(equipmentNameSidePanel).hasText(equipmentName)
    HelperFunction.verifyValueFromSidePanel(sidePanelData, sidePanel)
  }

  /**
   * This function is used to delete inspection rule
   * @param {String} deviceName - Name of the device for which rules need to be deleted
   */
  static deleteInspectionRule_Api = (deviceName) => {
    HelperFunction.search_API(deviceName, equipment).then(({ authToken, Id }) => {
      const deleteInspectionRule = APIEndpoints.equipmentActionsEndpoint(system_Id, hospital_Id)
      cy.api({
        method: leverageConstants.requestMethod.patch,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: authToken,
        },
        url: apiBaseURL + deleteInspectionRule + `${Id}`,
        body: {
          data: {
            inspectionRule: null,
          },
        },
      }).then((response) => {
        if (expect(response.status).to.equal(200)) {
          cy.log('Rule Deleted')
        } else {
          cy.log('Unable to delete rule')
        }
      })
    })
  }

  /**
   * This function is used to create  inspection rule
   * @param {String} deviceName - Name of the device for which rules need to be created
   */
  static createInspectionRule_Api = (deviceName) => {
    // Get the current date
    let currentDate = new Date()

    // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let currentDay = currentDate.getDay()

    // Calculate milliseconds until next Sunday
    let millisecondsUntilSunday = (7 - currentDay) * 24 * 60 * 60 * 1000

    // Calculate timestamp for next Sunday
    let nextSundayTimestamp = currentDate.getTime() + millisecondsUntilSunday

    // Set the time to 00:00:00 (midnight)
    currentDate.setHours(0)
    currentDate.setMinutes(0)
    currentDate.setSeconds(0)
    currentDate.setMilliseconds(0)

    // Get the timestamp (in milliseconds since January 1, 1970)
    let timestamp = currentDate.getTime()

    HelperFunction.search_API(deviceName, equipment).then(({ authToken, Id }) => {
      const deleteInspectionRule = APIEndpoints.equipmentActionsEndpoint(system_Id, hospital_Id)
      cy.api({
        method: leverageConstants.requestMethod.patch,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: authToken,
        },
        url: apiBaseURL + deleteInspectionRule + `${Id}`,
        body: {
          data: [
            {
              path: 'rule/lastModified',
              value: 1719310627677,
            },
            {
              path: 'inspectionRule/frequency',
              value: 'weekly',
            },
            {
              path: 'secondInspection',
              value: false,
            },
            {
              path: 'inspectionRule/firstInspectionDay',
              value: nextSundayTimestamp,
            },
            {
              path: 'inspectionRule/firstInspectionTime',
              value: timestamp,
            },
          ],
        },
      }).then((response) => {
        if (expect(response.status).to.equal(200)) {
          cy.log('Rules created')
        } else {
          cy.log('Unable to create rule')
        }
      })
    })
  }

  /**
   * This function is used to edit an inspection Rule
   * @param {Object} ruleData  - This object contains parameters for creating inspection rule data
   * @param {String} ruleData.type - An environment type for which rules needs to be created
   * @param {String} ruleData.equipmentName - The equipment name for which rules needs to be created
   * @param {String} ruleData.frequencyValue - The frequency name for which rules needs to be created
   * @param {String} ruleData.monthValue - The Month for which rules needs to be created
   * @param {String} ruleData.weeklyValue - The Week for which rules needs to be created
   * @param {String} ruleData.timeValue - The time for which rules needs to be created
   * @param {String} ruleData.secondInspectionDay - The second inspection day for which rules needs to be created
   * @param {String} ruleData.secondInspectionTime - The second inspection time for which rules needs to be created
   * @param {String} ruleData.secondInspectionMonth - The second inspection month  for which rules needs to be created
   */
  static editInspectionRule = (ruleData, action) => {
    const {
      type,
      equipmentName,
      frequencyValue,
      weeklyValue,
      monthValue,
      timeValue,
      secondInspectionDay,
      secondInspectionTime,
      secondInspectionMonth,
    } = ruleData

    //Searching Equipment Name
    HelperFunction.search(equipmentName)
    HelperFunction.getRowByItemName(equipmentName, row, 'environment').as('data')

    //Place where action needs to be done
    if (action === tableView) {
      Click.onButton('@data', editBtn)
    } else if (action === sidePanels) {
      Click.forcefullyOn('@data')
      Click.onButton(sidePanel, editBtn)
    }

    //Verifying the equipment name and type
    Verify.theElementNextToLabel(equipmentType).contains(type)
    Verify.theElementNextToLabel(equipmentNames).contains(equipmentName)

    //Updating the details
    Click.forcefullyOn(frequency)
    Type.theText(frequencyValue).into(searchBarOnDropdown)
    cy.contains(divTag, frequencyValue).click(commandOptions.force)
    if (frequencyValue === 'Monthly') {
      Click.forcefullyOn(day)
      Type.theText(monthValue).into(searchBarOnDropdown)
      cy.contains(checkedItems, monthValue).click(commandOptions.force)
    } else if (frequencyValue === 'Weekly') {
      Click.forcefullyOn(day)
      Type.theText(weeklyValue).into(searchBarOnDropdown)
      cy.contains(checkedItems, weeklyValue).click(commandOptions.force)
    }
    Click.forcefullyOn(startTime)
    Type.theText(timeValue).into(searchBarOnDropdown)
    cy.contains(checkedItems, timeValue).click(commandOptions.force)
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(secondInspctionToggel)
    Verify.theElement(createBtn).isDisabled()
    cy.contains(subtitle, 'Second Inspection').parent().next().find(frequency).should('have.text', frequencyValue)
    if (frequencyValue === 'Monthly') {
      cy.contains(subtitle, 'Second Inspection').parent().next().find(day).click(commandOptions.force)
      Type.theText(secondInspectionMonth).into(searchBarOnDropdown)
      cy.contains(checkedItems, secondInspectionMonth).click(commandOptions.force)
    } else if (frequencyValue === 'Weekly') {
      cy.contains(subtitle, 'Second Inspection').parent().next().find(day).click(commandOptions.force)
      Type.theText(secondInspectionDay).into(searchBarOnDropdown)
      cy.contains(checkedItems, secondInspectionDay).click(commandOptions.force)
    }
    cy.contains(subtitle, 'Second Inspection').parent().next().next().find(startTime).click(commandOptions.force)
    Type.theText(secondInspectionTime).into(searchBarOnDropdown)
    cy.contains(checkedItems, secondInspectionTime).click(commandOptions.force)

    //Saving the edited details
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
  }
}
