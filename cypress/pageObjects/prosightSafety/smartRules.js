/// <reference types="cypress" />
import constants from '../../utils/constants/prosightSafety/smartRulesConst'
import globalSels from '../../utils/selectors/globalSels'
import selectors from '../../utils/selectors/prosightSafety'
import option from '../../utils/constants/commandOptions'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import { Verify } from '../../utils/assertions'
import APIEndpoints from '../../../APIEndpoints'
import LoginPage from '../signIn/siginPage'
import userData from '../../fixtures/SignIn/user.json'
import Click from '../../utils/Interactions/click'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
const { room } = leverageConstants.objectTypes
const system_Id = Cypress.env('SystemId')
const hospital_Id = Cypress.env('HospitalId')
const apiBaseURL = Cypress.env('API_BaseUrl')
const {
  ruleNameInput,
  ruleTypeDropdownBtn,
  alertDropDownBtn,
  editRuleButton,
  deleteRuleTableButton
} = selectors.smartRules
const {floorToggelButton,departmentToggleButton,checkbox}=selectors.smartAlerts
let locationId
/**
 * This class contains all the functions for the ISDR Smart Rules page
 */
export default class SmartRules {
  /**
   * Enters staff activity rule details with the specified parameters.
   *
   * @param {Object} params - The parameters for creating the staff activity rule.
   * @param {string} params.ruleName - The ruleName of the activity rule.
   * @param {string} params.ruleType - The type of the rule.
    * @param {string} params.alertType - The alert type for the rule. 
   */
  static enterDetailsForStaffAlertRules(ruleData) {
    const { ruleName, ruleType, alertType ,isDept=null, isFloor=null} = ruleData
    cy.get(ruleNameInput).clear(option.force).type(ruleName, option.force)
    cy.get(ruleTypeDropdownBtn).click(option.force)
    cy.contains(globalSels.divTag, ruleType).click(option.force)
    cy.get(alertDropDownBtn).click(option.force)
    cy.contains(globalSels.spanTag, alertType).click(option.force)
    if( isDept !== null && isFloor !== null){


   }
  }

  /**
   * This function is used to delete the staff tag button programming rule
   */
  static deleteStaffTagProgrammingRule = () => {
    const tagButtonRuleEndpoint = APIEndpoints.tagButtonProgrammingEndpoint(system_Id, hospital_Id)
    LoginPage.loginToApplication().then(({ authToken }) => {
      cy.api({
        url: apiBaseURL + tagButtonRuleEndpoint,
        method: option.requestMethod.delete,
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status).to.equal(200)
        } else {
          cy.log('Failed to delete rule')
        }
      })
    })
  }

  /**
   * This function is used to delete the room entry/exit rule that is created
   * @param {String} locationName - this name  of the room where staff exist
   * @param {String} staffType - Type of a staff for which rules needs to be deleted
   */
  static deleteStaffAlertRule = (locationName, staffType) => {
    const staffRuleEndpoint = APIEndpoints.staffRuleEndpoint(system_Id, hospital_Id)
    const staffTypeRequired = staffType.replace(/\s/g, '') //removing space from staff type name if exist
    LoginPage.loginToApplication().then(({ authToken }) => {
      HelperFunction.search_API(locationName, room).then(({ authToken, Id }) => {
        locationId = Id
        cy.api({
          url: apiBaseURL + staffRuleEndpoint + `${locationId}/p/${staffTypeRequired}`,
          method: option.requestMethod.delete,
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
        }).then((res) => {
          if (res.status === 200) {
            expect(res.status).to.equal(200)
          } else {
            cy.log('Failed to delete rule')
          }
        })
      })
    })
  }

  /**
   * This function is used to create a staff alert rule  staffActivity/ threshold
   * @param {object} ruleDetails  - object that contains rule data for creating data (ruleName, ruleType, staffType, departmentId, departmentName, locationId, locationName, activityType, createdBy)
   * @param {string} ruleDetails.ruleName - Name of the rule
   * @param {string} ruleDetails.ruleType - Type of the rule for which rule needs to be created
   * @param {string} [ruleDetails.staffType] - Type of the staff for which rules needs to be created if applicable
   * @param {string} ruleDetails.departmentName - Name of the department
   * @param {string} ruleDetails.locationName - Name of the room
   * @param {string} [ruleDetails.activity] -Type of the activity for which rules needs to be created if applicable
   * @param {string} [ruleDetails.threshold] -Threshold value for the rule if applicable
   */
  static createStaffEmergencyRules_API = (ruleDetails) => {
    const tagButtonProgrammingEndpoint = APIEndpoints.tagButtonProgrammingEndpoint(system_Id, hospital_Id)
    const { searchRuleEndpoint } = APIEndpoints
    const { name } = userData
    const { ruleName, ruleType, alertType, isDept, isFloor } = ruleDetails

    LoginPage.loginToApplication().then(({ authToken }) => {
      cy.api({
        method: 'GET',
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
        url: apiBaseURL + searchRuleEndpoint(system_Id, hospital_Id),
      }).then((response) => {
        expect(response.body.items).exist
        const itemArray = response.body.items
        const otherTagButtonRule = itemArray.some(
          (item) => (item.data.ruleType === 'tagButton' && item.data.alertType === 'nurseCall') || item.data.alertType === 'generalHelp'
        )
        const hasMatchingRule = itemArray.some((item) => item.data.ruleType === 'tagButton' && item.data.alertType === 'staffEmergency')
        if (otherTagButtonRule) {
          cy.api({
            method: 'Delete',
            failOnStatusCode: false,
            headers: {
              authorization: authToken,
            },
            url: apiBaseURL + tagButtonProgrammingEndpoint,
          })
        } else {
          cy.log('Rule not found')
        }
        if (!hasMatchingRule) {
          cy.api({
            method: option.requestMethod.post,
            failOnStatusCode: false,
            headers: {
              authorization: authToken,
            },
            url: apiBaseURL + tagButtonProgrammingEndpoint,
            body: {
              type: 'rule',
              ruleName: ruleName,
              ruleType: ruleType,
              createdBy: name,
              alertType: alertType,
              isDepartmentAlerts: isDept,
              isFloorAlerts: isFloor,
            },
          }).then((res) => {
            if (res.status === 200) {
              expect(res.status).to.equal(200)
              expect(res.body.data.ruleName).to.eq(ruleName)
              cy.log(`Rule ${ruleName} created successfully`)
            } else {
              cy.log(`Failed to create rule name ${ruleName}`)
            }
          })
        } else {
          cy.log('rule not found 2')
        }
      })
    })
  }

  /**
   * This function edits a staff  rule in the form
   */
  static editStaffRule = () => {
   cy.get(departmentToggleButton).eq(0).find(checkbox).click({ force: true })
   cy.get(floorToggelButton).eq(0).find(checkbox).click({ force: true })
  }

  /**
   * Function that delete the staff rules according to given action type
   * @param {object} ruleDetails - required object consists of necessary rules details to delete
   * @param {string} ruleDetails.ruleName - Name of the rule
   * @param {string} actionType - required action type for deleting it could be table/edit
   */
  static deleteStaffAlertRules = (ruleDetails, actionType) => {
    const { ruleName } = ruleDetails
    const { tableBtn, editMenu } = constants.deleteActions

    HelperFunction.search(ruleName, false)
    HelperFunction.getRowByItemName(ruleName, globalSels.resultRow).as('resultRow')

    if (actionType === tableBtn) {
      Click.onButton('@resultRow', deleteRuleTableButton)
    } else if (actionType === editMenu) {
      Click.onButton('@resultRow', editRuleButton)
      Click.onDeleteButton()
    }

    Verify.theElement(globalSels.confirmationPopup).contains(constants.confirmationMessages.confirmationMessageBeforeDelete)
    Click.forcefullyOn(globalSels.dialogueDeleteBtn)
  }
}
