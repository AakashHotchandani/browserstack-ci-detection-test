/// <reference types="cypress" />
import prosightAssetsSelectors from '../../utils/selectors/prosightAssets'
import commandOptions from '../../utils/constants/commandOptions'
import globalSels from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import { Verify } from '../../utils/assertions'
import userData from '../../fixtures/SignIn/user.json'
import Click from '../../utils/Interactions/click'
import smartAlertConst from '../../utils/constants/smartAlertsManagementConst'
import prosightHandHygiene from '../../utils/selectors/prosightHandHygiene'
const { resultRow } = globalSels
const { create, editTask, completeTask, completeButton, save, createTask } = smartAlertConst.buttonsInnerText
const { tableView, sidePanel } = smartAlertConst.actionPlace
const { username } = userData
const { button, spanTag } = globalSels
const { commentForTask, commentForEditedTask } = smartAlertConst.comments
const { createTaskButtonOnSidePanel } = prosightHandHygiene.smartAlerts
const {
  selectActionDropDown,
  commentForCreatingTask,
  alertTypeInSidePanel,
  sidePanelAssetName,
  unacknowledgedButtonOnPopup,
  taskDescription,
  taskCard,
  completeTaskFromSidePanel,
  completeTaskFromTableView,
} = prosightAssetsSelectors.smartAlerts

/** This class consists of different static functions related to smart alerts page
 * @class SmartAlerts
 */
export default class SmartAlerts {
  /**
   *
   * This function is used to perform create task functions on alerts
   * @param {object} staffInfo - Object that contains staffName, staffType, staffId, floorName, departmentName, locationName, buildingName, previousRoomName, for performing actions
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} deviceId It is the id of the device
   */
  static createTask = (staffInfo, alertAction, typeOfAlert, deviceId) => {
    const { staffName, staffType, staffId, floorName, departmentName, locationName, buildingName, previousRoomName } = staffInfo
    const values = { staffName, staffId, floorName, locationName, typeOfAlert }
    const sidePanelData = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      'Assigned Department': departmentName,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
      'Tag ID': deviceId,
    }

    //Searching Staff name
    HelperFunction.search(staffName)
    HelperFunction.getRowByItemName(staffName, resultRow, 'asset-alerts').as('data1')

    //Verifying data on table view
    HelperFunction.verifyValuesExist('@data1', values)

    //Performing action on table view
    if (alertAction === tableView) {
      Click.onButton('@data1', selectActionDropDown)
      cy.contains(createTask).click(commandOptions.force)
    }
    //Performing action on table view
    else if (alertAction === sidePanel) {
      Click.forcefullyOn('@data1')
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      Verify.theElement(sidePanelAssetName).hasText(staffName)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      Click.forcefullyOn(createTaskButtonOnSidePanel)
    }
    //Creating task
    cy.get(commentForCreatingTask).click().type(commentForTask)
    cy.contains(spanTag, create).click(commandOptions.force)
  }

  /**
   * This function is used to edit the create task on the alert
   * @param {Object} staffInfo - Object that contains staffName, staffId for performing actions
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} username - Name of the user that made actions on the alert
   */
  static editCreatedTask = (staffInfo, typeOfAlert) => {
    const { staffName, staffId } = staffInfo
    let finalValuesToVerify = { staffName, staffId, typeOfAlert, username, commentForTask }

    //Searching for staff name
    HelperFunction.search(staffName)
    HelperFunction.getRowByItemName(staffName, resultRow, 'asset-alerts').as('data1')

    //Verifying data on table view
    HelperFunction.verifyValuesExist('@data1', finalValuesToVerify)
    cy.get('@data1').click(commandOptions.force)
    cy.wait(2000)

    //Editing the created task
    Click.forcefullyOn(prosightAssetsSelectors.smartAlerts.editTask)
    Verify.theElement(unacknowledgedButtonOnPopup).isDisabled()
    Verify.theElement(commentForCreatingTask).hasText(commentForTask)
    cy.get(commentForCreatingTask).click().clear().type(commentForEditedTask)
    cy.contains(button, save).click(commandOptions.force)
  }

  /**
   * This function is used to complete task for the alerts
   * @param {Object} staffInfo - Object that contains staffName, staffId, staffType, departmentName, buildingName, floorName, locationName for performing actions
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} deviceId It is the id of the device
   * @param {string} alertAction - Place where alert action needs to be made
   */
  static completeTask = (staffInfo, typeOfAlert, alertAction, deviceId) => {
    const { staffName, staffId, staffType, departmentName, buildingName, floorName, locationName } = staffInfo
    const values = { staffName, staffId, typeOfAlert, username, commentForEditedTask }
    const sidePanelData = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      'Assigned Department': departmentName,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
      'Tag ID': deviceId,
    }

    //Searching the staff name
    HelperFunction.search(staffName)
    HelperFunction.getRowByItemName(staffName, resultRow, 'asset-alerts').as('data1')

    //Verifying data in table view
    HelperFunction.verifyValuesExist('@data1', values)

    //Performing actions on table view
    if (alertAction === tableView) {
      Click.onButton('@data1', completeTaskFromTableView)
      cy.get(unacknowledgedButtonOnPopup).click(commandOptions.force)
    }
    //Performing actions on side panel
    else if (alertAction === sidePanel) {
      Click.forcefullyOn('@data1')
      Verify.theElement(sidePanelAssetName).hasText(staffName)
      Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      Verify.theElement(taskDescription).contains(commentForEditedTask)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globalSels.sidePanel)
      HelperFunction.getElementFromSpecificDiv(taskCard, completeTaskFromSidePanel).click(commandOptions.force)
      Click.forcefullyOn(unacknowledgedButtonOnPopup)
    }
  }
}
