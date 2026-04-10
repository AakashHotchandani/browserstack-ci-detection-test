import prosightSafetySel from '../../utils/selectors/prosightSafety'
import globals from '../../utils/selectors/globalSels'
import { Verify } from '../../utils/assertions'
import Type from '../../utils/Interactions/type'
import constants from '../../utils/constants/prosightSafety/smartLocation'
import Click from '../../utils/Interactions/click'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import commandOptions from '../../utils/constants/commandOptions'
import safetySmartAlerts from '../../utils/constants/smartAlertsManagementConst'
import loginData from '../../fixtures/SignIn/user.json'
import Safety from './safetySmartAlerts'
import alertData from '../../fixtures/prosightSafety/safetyAlertData.json'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import globalSels from '../../utils/selectors/globalSels'
const { cardView, detailsIcon, headerCard } = globalSels
const { staff, tag } = leverageConstants.objectTypes
const { staffEmergency } = alertData.staffAlertTypes.emergencyAlert
const { username } = loginData
const {confirmationBtnInConfirmationDialogue,resultRow} = globals
const {standDown,responding,notResponding} = safetySmartAlerts.buttonsInnerText
const {carousel,sidePanel,tableView,mobile} = safetySmartAlerts.actionPlace
const { ackInMobile,standDownButton ,sidePanelStaffName,responsingButton,escalateButtonFromSidePanel,selectActionDropDown,unAcknowledgeButton,unacknowledgedFromSidePanel,alertTypeInSidePanel,closeSidePanelButton} = prosightSafetySel.smartAlerts
const {incidentContainer,acknowledgeButtonInAlert,escalateButton,enterComment}=prosightSafetySel.smartLocation

/**
 * @class SmartLocation that consists static function related to Smart Location module in ISDR
 */
export default class SmartLocation {
  
  /**
   * This function is used to respond to the staff emergency alert
   * @param {string} comment Comment to add when acknowledging the alert
   * @param {string} staffInfo.staffName Name of the staff how appears in the alert
   * @param {string} staffInfo.staffId Id of the staff how appears in the alert
   * @param {string} staffInfo.staffType Type of the staff how appears in the alert
   * @param {string} staffInfo.floorName Floor name where the staff is located
   * @param {string} staffInfo.departmentName Department name where the staff is assigned
   * @param {string} staffInfo.deviceId Device id assigned to the staff
   * @param {string} staffInfo.locationName Location name where the staff is located
   * @param {string} staffInfo.buildingName Building name where the staff is located
   * @param {string} alertResponse Type of response given to the alert
   */
  static respondingStaffEmergencyAlert = (staffInfo,alertAction,typeOfAlert, alertResponse=null) =>{
    if(alertResponse === null){
      alertResponse = '-'
    }else{
      alertResponse = alertResponse
    }
    const { staffName, staffType, staffId, floorName, departmentName, deviceId, locationName, buildingName} = staffInfo
    const values = { staffName, staffId, floorName, locationName, typeOfAlert ,alertResponse}
    const verificationData = { staffName, staffType, staffId, floorName, departmentName, locationName}
    const sidePanelData = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
      'Assigned Department': departmentName,
      'Tag ID': deviceId,
      'Responding User': alertResponse
    }
     //Performing action on table view
    if (alertAction === tableView) {
      //Search Staff name
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName,resultRow, 'staff-alerts').as('data1')
      Click.onButton('@data1', selectActionDropDown)
      cy.contains(responding).click(commandOptions.force)
      HelperFunction.verifyValuesExist('@data1', values)
    }
    else if(alertAction === sidePanel){
      //Search Staff name
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName,resultRow, 'staff-alerts').as('data1')
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(sidePanelStaffName).hasText(staffName)
      Click.forcefullyOn(responsingButton)
      //Verifying data on side panel
      HelperFunction.verifyValuesExist('@data1', values)
      cy.get('@data1').click(commandOptions.force)
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globals.sidePanel)
    }
     else if(alertAction === carousel){
      Verify.theElement(incidentContainer).contains(staffName)
      Verify.theElement(incidentContainer).contains(staffId)
      Click.forcefullyOn(acknowledgeButtonInAlert)
    }
    else if(alertAction === mobile){
      HelperFunction.search(staffName, false)
      Safety.selectAlertTypeFromFilter(staffEmergency, 'mobile')
      HelperFunction.getRowByItemName(staffName, cardView, staff).as('alertRow')
       HelperFunction.verifyValuesInTheCardView('@alertRow', verificationData)
      Click.onButton('@alertRow', detailsIcon)
      Click.forcefullyOn(ackInMobile)
  }
  }

    /**
   * This function is used to stand down the staff emergency alert
   * @param {string} comment Comment to add when acknowledging the alert
   * @param {string} staffInfo.staffName Name of the staff how appears in the alert
   * @param {string} staffInfo.staffId Id of the staff how appears in the alert
   * @param {string} staffInfo.staffType Type of the staff how appears in the alert
   * @param {string} staffInfo.floorName Floor name where the staff is located
   * @param {string} staffInfo.departmentName Department name where the staff is assigned
   * @param {string} staffInfo.deviceId Device id assigned to the staff
   * @param {string} staffInfo.locationName Location name where the staff is located
   * @param {string} staffInfo.buildingName Building name where the staff is located
   * @param {string} alertResponse Type of response given to the alert
   */
  static standDownAlert = (comment , staffInfo,alertAction,typeOfAlert, alertResponse=null) =>{
    const { staffName, staffType, staffId, floorName, departmentName, deviceId, locationName, buildingName} = staffInfo
    const values = { staffName, staffId, floorName, locationName, typeOfAlert ,alertResponse}
    const verificationData = { staffName, staffType, staffId, floorName, departmentName, locationName }
  
    const sidePanelData = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
      'Assigned Department': departmentName,
      'Tag ID': deviceId,
    }
   //Performing action on table view
    if (alertAction === tableView) {
       HelperFunction.search(staffName, true)
    HelperFunction.getRowByItemName(staffName,resultRow, 'staff-alerts').as('data1')
    HelperFunction.verifyValuesExist('@data1', values)
      Click.onButton('@data1', selectActionDropDown)
      cy.contains(standDown).click(commandOptions.force)
    }
    else if(alertAction === sidePanel){
       HelperFunction.search(staffName, true)
    HelperFunction.getRowByItemName(staffName,resultRow, 'staff-alerts').as('data1')
    HelperFunction.verifyValuesExist('@data1', values)
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(sidePanelStaffName).hasText(staffName)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globals.sidePanel)
      Click.forcefullyOn(standDownButton)
    }
    else if(alertAction === mobile){
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName, cardView, staff).as('alertRow')
       HelperFunction.verifyValuesInTheCardView('@alertRow', verificationData)
      Click.onButton('@alertRow', detailsIcon)
      Click.forcefullyOn(standDownButton)
    }
    Verify.theElement(enterComment).isVisible()
    Type.theText(comment).into(enterComment)
    Click.forcefullyOn(confirmationBtnInConfirmationDialogue)
  }


    /**
   * This function is used to not respond to the staff emergency alert
   * @param {string} comment Comment to add when acknowledging the alert
   * @param {string} staffInfo.staffName Name of the staff how appears in the alert
   * @param {string} staffInfo.staffId Id of the staff how appears in the alert
   * @param {string} staffInfo.staffType Type of the staff how appears in the alert
   * @param {string} staffInfo.floorName Floor name where the staff is located
   * @param {string} staffInfo.departmentName Department name where the staff is assigned
   * @param {string} staffInfo.deviceId Device id assigned to the staff
   * @param {string} staffInfo.locationName Location name where the staff is located
   * @param {string} staffInfo.buildingName Building name where the staff is located
   * @param {string} alertResponse Type of response given to the alert
   */
  static notRespondingStaffEmergencyAlert = (staffInfo,alertAction,typeOfAlert, alertResponse=null) =>{
    if(alertResponse === null){
      alertResponse = '-'
    }else{
      alertResponse = alertResponse
    }
   
    const { staffName, staffType, staffId, floorName, departmentName, deviceId, locationName, buildingName} = staffInfo
    const verificationData = { staffName, staffType, staffId, floorName, departmentName, deviceId, locationName,alertResponse }
    const values = { staffName, staffId, floorName, locationName, typeOfAlert ,alertResponse}
    const sidePanelData = {
      'Staff Type': staffType,
      'Staff ID': staffId,
      Building: buildingName,
      Floor: floorName,
      Location: locationName,
      'Assigned Department': departmentName,
      'Tag ID': deviceId,
    }
     //Performing action on table view
    if (alertAction === tableView) {
       //Search Staff name
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName,resultRow, 'staff-alerts').as('data1')
      HelperFunction.verifyValuesExist('@data1', values)
      Click.onButton('@data1', selectActionDropDown)
      cy.contains(notResponding).click(commandOptions.force)
    }
    else if(alertAction === sidePanel){
       //Search Staff name
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName,resultRow, 'staff-alerts').as('data1')
      HelperFunction.verifyValuesExist('@data1', values)
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(sidePanelStaffName).hasText(staffName)
      //Verifying data on side panel
      HelperFunction.verifyValueFromSidePanel(sidePanelData, globals.sidePanel)
      Click.forcefullyOn(escalateButtonFromSidePanel)
    }
     else if(alertAction === carousel){
      Verify.theElement(incidentContainer).contains(staffName)
      Verify.theElement(incidentContainer).contains(staffId)
      Click.forcefullyOn(escalateButton)
    }
    else if(alertAction === mobile){
      HelperFunction.search(staffName, false)
      Safety.selectAlertTypeFromFilter(staffEmergency, 'mobile')
      HelperFunction.getRowByItemName(staffName, cardView, staff).as('alertRow')
      Click.onButton('@alertRow', detailsIcon)
      HelperFunction.verifyValuesInTheCardView('@alertRow', verificationData)
      Click.forcefullyOn(escalateButtonFromSidePanel)
    }
  }

  
  /** 
   * This function is used to verify the responding and not responding buttons are not visible
   * @param {string} staffInfo.staffName Name of the staff how appears in the alert
   * @param {string} alertAction Type of view where the verification needs to be done
   */
  static verifyRespondingAndNotRespondingButtons = (staffName,alertAction)=>{
      if (alertAction === tableView) {
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName,resultRow, 'staff-alerts').as('data1')
      Click.onButton('@data1', selectActionDropDown)
      Verify.theElement(selectActionDropDown).doesNotContain(notResponding)
      Verify.theElement(selectActionDropDown).doesNotContain(responding)  
    }
    else if(alertAction === sidePanel){
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName,resultRow, 'staff-alerts').as('data1')
      cy.get('@data1').click(commandOptions.force)
      Verify.theElement(sidePanelStaffName).hasText(staffName)
      cy.get(escalateButtonFromSidePanel).should('not.exist')
      cy.get(responsingButton).should('not.exist')
      Click.forcefullyOn(closeSidePanelButton)
    }
     else if(alertAction === carousel){
      Verify.theElement(incidentContainer).contains(staffName)
      cy.get(escalateButton).should('not.exist')
      cy.get(acknowledgeButtonInAlert).should('not.exist')

    }
    else if(alertAction === mobile){
      HelperFunction.search(staffName, false)
      Safety.selectAlertTypeFromFilter(staffEmergency, 'mobile')
      HelperFunction.getRowByItemName(staffName, cardView, staff).as('alertRow')
      Click.onButton('@alertRow', detailsIcon)
      cy.get(escalateButtonFromSidePanel).should('not.exist')
      cy.get(standDownButton).should('not.exist')
    }
  }


    /**
     * 
     * @param {object} staffInfo The object that contains the staff details
     * @param {string} staffInfo.staffName Name of the staff how appears in the alert
     * @param {string} staffInfo.staffId Id of the staff how appears in the alert
     * @param {string} staffInfo.staffType Type of the staff how appears in the alert
     * @param {string} staffInfo.floorName Floor name where the staff is located
     * @param {string} staffInfo.departmentName Department name where the staff is assigned
     * @param {string} staffInfo.deviceId Device id assigned to the staff
     * @param {string} staffInfo.locationName Location name where the staff is located
     * @param {string} staffInfo.buildingName Building name where the staff is located
     * @param {string} alertAction The place where action are made
     * @param {string} typeOfAlert Type of alert
     */
  static verifyStaffEmergencyAlertIsResolved = (staffInfo,alertAction,typeOfAlert)=>{
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
        HelperFunction.getRowByItemName(staffName, globals.resultRow, 'staff-alerts').as('data1')
        HelperFunction.verifyValuesExist('@data1', values)
        //Performing action on table view
        if (alertAction === tableView) {
          Verify.theElement(unAcknowledgeButton).isDisabled()
        }
        //Performing action on side panel
        else if (alertAction === sidePanel) {
          cy.get('@data1').click(commandOptions.force)
          Verify.theElement(sidePanelStaffName).hasText(staffName)
          Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
          //Verifying data on side panel
          HelperFunction.verifyValueFromSidePanel(sidePanelData, globals.sidePanel)
          Click.forcefullyOn(closeSidePanelButton)
         
        }
}
}
