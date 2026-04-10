/// <reference types="cypress" />
import constants from '../../../../utils/constants/prosightSafety/smartRulesConst'
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import safetyPageSel from '../../../../utils/selectors/prosightSafety'
import { Verify } from '../../../../utils/assertions'
import SmartRules from '../../../../pageObjects/prosightSafety/smartRules'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import globalSels from '../../../../utils/selectors/globalSels'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import userData from '../../../../fixtures/SignIn/user.json'
import rulesData from '../../../../fixtures/prosightSafety/smartRules.json'
import Click from '../../../../utils/Interactions/click'
import FloorPlanManagement from '../../../../pageObjects/prosightCore/floorPlanManagementFns'
const { departmentName, buildingName, roomDetails, floorDetails, hospitalName, locationDetails } = rulesData.testData
const { ruleDataSet } = rulesData
const { staff } = leverageConstants.objectTypes
const { addRuleBtn } = safetyPageSel.smartRules
const { username, password, name } = userData
const { smartLocation, smartRules, escalations } = constants.urls
const { buttonTag, createBtn, resultRow } = globalSels
const { messageAfterRuleCreated, messageAfterRuleUpdated, messageAfterSavingEscalationsSetup, messageAfterRuleDeleted } = constants.toastMessages
const { tagButton } = constants.staffRuleTypes
const { editRuleButton, ruleNameInput, ruleTypeDropdownBtn } = safetyPageSel.smartRules
const { clearAllBtn, saveBtn } = safetyPageSel.escalations
const { tableBtn, editMenu } = constants.deleteActions
let currentTestData, ruleName, ruleType, valuesToVerify

describe('Execute the test cases of ISDR - Smart rules - Alert rules page', () => {
  before('Creating test Data', () => {
    HelperFunction.globalIntercept()
    //Deleteing existing rules if any
    SmartRules.deleteStaffTagProgrammingRule()
  })

  beforeEach('It should login to the Safety application and navigates to smart rules module', () => {
    HelperFunction.globalIntercept()
    cy.session([username, password], () => {
      LoginPage.toVisit('/safety')
      LoginPage.doUserLogin(username, password)
      Verify.theElement(globalSels.profileSection.userProfileBtn).hasText(name)
      Verify.theUrl().includes(smartLocation)
      HelperFunction.navigateToModule(buttonTag, constants.buttonsInnerText.smartRules)
      Verify.theUrl().includes(smartRules)
    })

    LoginPage.toVisit('/safety')
    HelperFunction.navigateToModule(buttonTag, constants.buttonsInnerText.smartRules)
    Verify.theUrl().includes(smartRules)
  })

  afterEach('Deleting the created test data', () => {
    SmartRules.deleteStaffTagProgrammingRule()
  })

  it('7371, [SMARTHOSP-TC-6082] - Configure Staff Activity/ threshold/ tag Rule and verify', () => {
    ruleName = ruleDataSet.ruleName
    ruleType = "Tag Button"
    valuesToVerify = { ruleName, ruleType, username }
    Click.forcefullyOn(addRuleBtn)
    Verify.theElement(createBtn).isDisabled()

    SmartRules.enterDetailsForStaffAlertRules(ruleDataSet)
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
    Verify.theToast.showsToastMessage(messageAfterRuleCreated)

    //verifying created rule in table
    HelperFunction.search(ruleDataSet.ruleName, false)
    HelperFunction.getRowByItemName(ruleDataSet.ruleName, resultRow).as('resultRow')
    HelperFunction.verifyValuesExist('@resultRow', valuesToVerify)

  })

  it('7372, [SMARTHOSP-TC-5000] Smart Rules - Editing an Existing Rule', () => {
    HelperFunction.globalIntercept()
    //creating test data
    const { rule1 } = rulesData

    SmartRules.createStaffEmergencyRules_API(rule1)
    ruleName = rule1.ruleName
    ruleType = "Tag Button"
    valuesToVerify = { ruleName, ruleType, username }
    HelperFunction.search(ruleName, false)
    HelperFunction.getRowByItemName(ruleName, resultRow).as('resultRow')
    HelperFunction.verifyValuesExist('@resultRow', valuesToVerify)

    //clicking on edit button
    Click.onButton('@resultRow', editRuleButton)

    //verifying name  and type input should be disabled
    Verify.theElement(ruleNameInput).isDisabled()
    Verify.theElement(ruleTypeDropdownBtn).isDisabled()
    Verify.theElement(createBtn).isDisabled()

    //editing the other fields
    SmartRules.editStaffRule()
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
    Verify.theToast.showsToastMessage(messageAfterRuleUpdated)
  })

  it('7373, [SMARTHOSP-TC-4999] - Smart Rules - Deleting an Existing Rule', () => {
    HelperFunction.globalIntercept()
    //creating test data
    const { rule1 } = rulesData
    SmartRules.createStaffEmergencyRules_API(rule1)

    //executing test steps  --deleting from table del btn
    SmartRules.deleteStaffAlertRules(rule1, tableBtn)
    Verify.theToast.showsToastMessage(messageAfterRuleDeleted)

    SmartRules.createStaffEmergencyRules_API(rule1)
    //executing test steps  --deleting from edit menu del btn
    SmartRules.deleteStaffAlertRules(rule1, editMenu)
    Verify.theToast.showsToastMessage(messageAfterRuleDeleted)
  })
})
