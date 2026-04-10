///<reference types= 'cypress'/>
import prosightAssetsSelectors from '../../utils/selectors/prosightAssets'
import commandOptions from '../../utils/constants/commandOptions'
import globalSels from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import { Verify } from '../../utils/assertions'
import Click from '../../utils/Interactions/click'
import prosightCore from '../../utils/selectors/prosightCore'
import Type from '../../utils/Interactions/type'
import loginData from '../../fixtures/SignIn/user.json'
import smartAlertsManagementConst from '../../utils/constants/smartAlertsManagementConst'
const { alert, tasks } = smartAlertsManagementConst.pageFromWhereActionIsDone
const { assetTable } = smartAlertsManagementConst.table
const { commentForAcknowledge, commentForTask, commentForEditedTask } = smartAlertsManagementConst.comments
const { confirmationPopUpText, clearAlertPopUp } = smartAlertsManagementConst.popUps
let page, searchText
if (page === alert) {
  page = alert
} else if (page === tasks) {
  page = tasks
}
const { confirmationPopup, confirmationBtnInConfirmationDialogue, saveBtn, resultRow, button } = globalSels
const {
  selectActionDropDown,
  labels,
  sidePanelAssetName,
  acknowledgeFromSidePanel,
  unacknowledgedFromTable,
  unacknowledgedFromSidePanel,
  editTask,
  completeTaskFromSidePanel,
  taskCard,
  clearButtonOnPopUp,
  clearAlertFromSidePanel,
  completeTaskFromTableView,
  clearButtonOnTableView,
} = prosightAssetsSelectors.smartAlerts
const { username } = loginData
const { sidePanel, tableView } = smartAlertsManagementConst.actionPlace
const { acknowledge } = smartAlertsManagementConst
const { createTask, create, completeButton, clearButton } = smartAlertsManagementConst.buttonsInnerText
const { comment, sidePanels, alertTypeInSidePanel, createTaskFromSidePanel, commentInSidePanel, taskDescriptionInSidePanel } =
  prosightCore.smartAlertsSel
/** This class consists of different static functions related to smart alerts page
 * @class SmartAlerts
 */
export default class SmartAlerts {
  /**
   * This function is used to perform acknowledge functions on alerts
   * @param {object} alertData - Object that contains a floorName, locationName, buildingName, departmentName, for performing actions
   * @param {string} alertData.floorName  -  Name of the floor where the device exists
   * @param {string} alertData.locationName - Name of the Room where the device exists
   * @param {string} alertData.buildingName - Name of the building where the device exists
   * @param {string}  alertData.departmentName - Name of the department where the device exists
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {object} tagData - Object that contains device id , sensor id and type
   * @param {string} tagData.deviceId It is te id of the device
   * @param {string} tagData.type - Name of tag for which alert is trigged
   * @param {string} tagData.sensorId - Id of the sensor for which alert is trigged
   */
  static acknowledgeAlert = (alertData, alertAction, typeOfAlert, tagData) => {
    const { floorName, locationName, buildingName, departmentName } = alertData
    const { deviceId = null, sensorId = null, type } = tagData
    if (type == 'Sensor') {
      searchText = sensorId
    } else {
      searchText = deviceId
    }
    const values = { floorName, locationName, buildingName, typeOfAlert, searchText, type }
    //Search for device Id
    HelperFunction.search(searchText)
    HelperFunction.getRowByItemName(searchText, resultRow, assetTable).as('data1')

    //Verify Data in table view
    HelperFunction.verifyValuesExist('@data1', values)

    //Perform action from table view
    if (alertAction === tableView) {
      Click.onButton('@data1', selectActionDropDown)
      cy.contains(acknowledge).click(commandOptions.force)
    }
    //Perform action from side panel
    else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      const sidePanelValues = {
        'Device Type': type,
        Building: buildingName,
        Floor: floorName,
        Department: departmentName,
        Location: locationName,
      }
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      Verify.theElement(sidePanelAssetName).hasText(searchText)

      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelValues, sidePanels)
      Click.forcefullyOn(acknowledgeFromSidePanel)
    }

    //Acknowledging alert
    cy.contains(confirmationPopup, confirmationPopUpText).should('have.text', confirmationPopUpText)
    Type.theText(commentForAcknowledge).into(comment)
    Click.forcefullyOn(confirmationBtnInConfirmationDialogue)
  }

  /**
   *
   * This function is used to perform create task functions on alerts
   * @param {object} alertData - Object that contains a floorName, locationName, buildingName, departmentName, for performing actions
   * @param {string} alertData.floorName  -  Name of the floor where the device exists
   * @param {string} alertData.locationName - Name of the Room where the device exists
   * @param {string} alertData.buildingName - Name of the building where the device exists
   * @param {string}  alertData.departmentName - Name of the department where the device exists
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {object} tagData - Object that contains device id , sensor id and type
   * @param {string} tagData.deviceId It is te id of the device
   * @param {string} tagData.type - Name of tag for which alert is trigged
   * @param {string} tagData.sensorId - Id of the sensor for which alert is trigged
   */
  static createTask = (alertData, alertAction, typeOfAlert, tagData) => {
    const { floorName, locationName, buildingName, departmentName } = alertData
    const { deviceId = null, sensorId = null, type } = tagData
    if (type == 'Sensor') {
      searchText = sensorId
    } else {
      searchText = deviceId
    }
    const values = { floorName, locationName, buildingName, typeOfAlert, type, searchText }
    //Searching device Id
    HelperFunction.search(searchText)
    HelperFunction.getRowByItemName(searchText, resultRow, assetTable).as('data1')

    //Verifying data in table view
    HelperFunction.verifyValuesExist('@data1', values)

    //Performing action on table view
    if (alertAction === tableView) {
      Click.onButton('@data1', selectActionDropDown)
      cy.contains(createTask).click(commandOptions.force)
    }
    //Performing action on side panel
    else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      const sidePanelValues = {
        'Device Type': type,
        Building: buildingName,
        Floor: floorName,
        Department: departmentName,
        Location: locationName,
      }
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      Verify.theElement(sidePanelAssetName).hasText(searchText)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelValues, sidePanels)
      Click.forcefullyOn(createTaskFromSidePanel)
    }
    //Creating task
    Type.theText(commentForTask).into(comment)
    cy.contains(button, create).click(commandOptions.force)
  }

  /**
   * This function is used to perform unacknowledged functions on alerts
   * @param {object} alertData - Object that contains a floorName, locationName, buildingName, departmentName, for performing actions
   * @param {string} alertData.floorName  -  Name of the floor where the device exists
   * @param {string} alertData.locationName - Name of the Room where the device exists
   * @param {string} alertData.buildingName - Name of the building where the device exists
   * @param {string}  alertData.departmentName - Name of the department where the device exists
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {object} tagData - Object that contains device id , sensor id and type
   * @param {string} tagData.deviceId It is te id of the device
   * @param {string} tagData.type - Name of tag for which alert is trigged
   * @param {string} tagData.sensorId - Id of the sensor for which alert is trigged
   */
  static unacknowledgedAlert = (alertData, typeOfAlert, alertAction, tagData, page) => {
    const { floorName, locationName, buildingName, departmentName } = alertData
    const { deviceId = null, sensorId = null, type } = tagData
    if (type == 'Sensor') {
      searchText = sensorId
    } else {
      searchText = deviceId
    }
    const values = { buildingName, typeOfAlert, type, searchText, username, page }

    //Searching Device Id
    HelperFunction.search(searchText)
    HelperFunction.getRowByItemName(searchText, resultRow, assetTable).as('data1')

    //Verifying data in table view
    HelperFunction.verifyValuesExist('@data1', values)

    //Performing action from table view
    if (alertAction === tableView) {
      cy.get('@data1').find(unacknowledgedFromTable).should('be.enabled')
      cy.wait(2000)
      Click.onButton('@data1', unacknowledgedFromTable)
    }
    //Performing action from side panel
    else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(unacknowledgedFromSidePanel).isEnabled()
      const sidePanelValues = {
        'Device Type': type,
        Building: buildingName,
        Floor: floorName,
        Location: locationName,
        'Acknowledged By': username,
      }
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      if (page == alert) {
        Verify.theElement(commentInSidePanel).hasText(commentForAcknowledge)
      } else if (page == tasks) {
        Verify.theElement(taskDescriptionInSidePanel).contains(commentForTask)
      }
      Verify.theElement(sidePanelAssetName).hasText(searchText)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelValues, sidePanels)
      cy.wait(2000)
      Click.forcefullyOn(unacknowledgedFromSidePanel)
    }
    //unacknowledging alert
    Verify.theElement(confirmationBtnInConfirmationDialogue).isEnabled()
    Click.forcefullyOn(confirmationBtnInConfirmationDialogue)
  }

  /**
   * This function is used to edit the create task on the alert
   * @param {object} alertData - Object that contains a floorName, locationName, buildingName, departmentName, for performing actions
   * @param {string} alertData.buildingName - Name of the building where the device exists
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {object} tagData - Object that contains device id , sensor id and type
   * @param {string} tagData.deviceId It is te id of the device
   * @param {string} tagData.type - Name of tag for which alert is trigged
   * @param {string} tagData.sensorId - Id of the sensor for which alert is triggeded
   */
  static editCreatedTask = (alertData, typeOfAlert, tagData) => {
    const { buildingName } = alertData
    const { deviceId = null, sensorId = null, type } = tagData
    if (type == 'Sensor') {
      searchText = sensorId
    } else {
      searchText = deviceId
    }
    const values = { buildingName, typeOfAlert, type, searchText, username, commentForTask }
    HelperFunction.search(searchText)
    HelperFunction.getRowByItemName(searchText, resultRow, assetTable).as('data1')

    //Verifying data on table view
    HelperFunction.verifyValuesExist('@data1', values)
    Click.onButton('@data1', editTask)
    cy.wait(2000)
    Verify.theElement(confirmationBtnInConfirmationDialogue).isDisabled()
    Verify.theElement(comment).hasText(commentForTask)
    //Editing created task
    cy.get(comment).clear().type(commentForEditedTask)
    Click.forcefullyOn(saveBtn)
    Click.onButton('@data1', editTask)
    cy.wait(2000)
    Verify.theElement(comment).contains(commentForEditedTask)
    cy.get(comment).clear().type(commentForTask)
    Click.forcefullyOn(saveBtn)
  }

  /**
   * This function is used to complete task for the alerts
   * @param {object} alertData - Object that contains a floorName, locationName, buildingName, departmentName, for performing actions
   * @param {string} alertData.floorName  -  Name of the floor where the device exists
   * @param {string} alertData.locationName - Name of the Room where the device exists
   * @param {string} alertData.buildingName - Name of the building where the device exists
   * @param {string}  alertData.departmentName - Name of the department where the device exists
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {object} tagData - Object that contains device id , sensor id and type
   * @param {string} tagData.deviceId It is te id of the device
   * @param {string} tagData.type - Name of tag for which alert is trigged
   * @param {string} tagData.sensorId - Id of the sensor for which alert is trigged
   */
  static completeTask = (alertData, typeOfAlert, tagData, alertAction) => {
    const { buildingName, floorName, departmentName, locationName } = alertData
    const { deviceId = null, sensorId = null, type } = tagData
    if (type == 'Sensor') {
      searchText = sensorId
    } else {
      searchText = deviceId
    }
    const values = { buildingName, typeOfAlert, type, searchText, username, commentForTask }

    //Searching device Id
    HelperFunction.search(searchText)
    HelperFunction.getRowByItemName(searchText, resultRow, assetTable).as('data1')

    //Verifying data on table view
    HelperFunction.verifyValuesExist('@data1', values)

    //Performing actions on table view
    if (alertAction === tableView) {
      Click.onButton('@data1', completeTaskFromTableView)
    }
    //Performing actions on side panel
    else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      const sidePanelValues = {
        'Device Type': type,
        Building: buildingName,
        Floor: floorName,
        Department: departmentName,
        Location: locationName,
      }
      Verify.theElement(taskDescriptionInSidePanel).contains(commentForTask)
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      Verify.theElement(sidePanelAssetName).hasText(searchText)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelValues, sidePanels)
      HelperFunction.getElementFromSpecificDiv(taskCard, completeTaskFromSidePanel).click(commandOptions.force)
    }
    //Completing task
    Click.forcefullyOn(confirmationBtnInConfirmationDialogue)
  }

  /**
   * This function is used to clear alerts
   * @param {object} alertData - Object that contains a floorName, locationName, buildingName, departmentName, for performing actions
   * @param {string} alertData.floorName  -  Name of the floor where the device exists
   * @param {string} alertData.locationName - Name of the Room where the device exists
   * @param {string} alertData.buildingName - Name of the building where the device exists
   * @param {string}  alertData.departmentName - Name of the department where the device exists
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {object} tagData - Object that contains device id , sensor id and type
   * @param {string} tagData.deviceId It is te id of the device
   * @param {string} tagData.type - Name of tag for which alert is trigged
   * @param {string} tagData.sensorId - Id of the sensor for which alert is trigged
   */
  static clearAlert = (alertData, alertAction, typeOfAlert, tagData) => {
    const { floorName, locationName, buildingName, departmentName } = alertData
    const { deviceId = null, sensorId = null, type } = tagData
    if (type == 'Sensor') {
      searchText = sensorId
    } else {
      searchText = deviceId
    }
    const values = { floorName, locationName, buildingName, typeOfAlert, type, searchText }

    //Searching device Id
    HelperFunction.search(searchText)
    HelperFunction.getRowByItemName(searchText, resultRow, assetTable).as('data1')

    //Verifying data on table view
    HelperFunction.verifyValuesExist('@data1', values)

    //PErforming actions on table view
    if (alertAction === tableView) {
      Click.onButton('@data1', selectActionDropDown).click(commandOptions.force)
      cy.contains(clearButtonOnTableView, clearButton).click(commandOptions.force)
    }
    //Performing actions on side panel
    else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      const sidePanelValues = {
        'Device Type': type,
        Building: buildingName,
        Floor: floorName,
        Department: departmentName,
        Location: locationName,
      }
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      Verify.theElement(sidePanelAssetName).hasText(searchText)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelValues, sidePanels)
      Click.forcefullyOn(clearAlertFromSidePanel)
    }
    //Clear alert
    cy.contains(confirmationPopup, clearAlertPopUp).should('have.text', clearAlertPopUp)
    Click.forcefullyOn(clearButtonOnPopUp)
  }
}
