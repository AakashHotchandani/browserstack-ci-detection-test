import Click from '../../utils/Interactions/click'
import prosightAssetsSels from '../../utils/selectors/prosightAssets'
import Type from '../../utils/Interactions/type'
import commandOptions from '../../utils/constants/commandOptions'
import constant from '../../utils/constants/prosightAssets/smartRules'
import smartRulesConstant from '../../utils/constants/prosightSafety/smartRulesConst'
import { Verify } from '../../utils/assertions'
import globalSels from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import APIEndpoints from '../../../APIEndpoints'
import LoginPage from '../signIn/siginPage'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
const system_Id = Cypress.env('SystemId')
const hospital_Id = Cypress.env('HospitalId')
const apiBaseURL = Cypress.env('API_BaseUrl')
const { room, departments } = leverageConstants.objectTypes
const { createBtn, divTag, spanTag, button, confirmationPopup, dialogueDeleteBtn, labelTag, checkbox } = globalSels
const { warningText } = smartRulesConstant
const { textOnDeletePopUp } = constant
const { assetShrinkageState, assetStatus, assetUtilizationState, sidePanels, tableView, orderingLocation } = smartRulesConstant.orderingRuleCriteria
const { ordering, operations } = smartRulesConstant.buttonsInnerText
const {
  addRule,
  roomTypeField,
  ruleNameField,
  assetTypeSearchField,
  operationalRadioButton,
  maintenanceRadioButton,
  cleaningRadioButton,
  inMaintenanceRadioButton,
  utilizedRadioButton,
  naRadioButton,
  notUtilizedRadioButton,
  outOfCirculationRadioButton,
  availableRadioButton,
  missingRadioButton,
  roomTypeSearchField,
  cancelButton,
  utilizationFactor,
  shrinkageWindow,
  labelOnSidePanel,
  ruleNameOnSidePanel,
  sidePanel,
  editRule,
  deleteRule,
  parThreshold,
  overPar,
  underPar,
  lostRadioButton,
  criticallyUnderPar,
  selectDepartment,
  selectBuilding,
  selectAssetType,
} = prosightAssetsSels.smartRules

/**
 * Class SmartRules consists static functions related to Smart Rules Module from IAP
 * @class SmartRules
 */

export default class SmartRules {
  /**
   * This function is used to create a rule
   * @param {Object} ruleData - Object that contains the assetType,ruleName and roomType to create rule
   * @param {String} ruleData.assetType  - Type of the asset for which rules needs to be created
   * @param {String} ruleData.ruleName - Name of the Rule
   * @param {String} ruleData.roomType - Type of the room for which rules needs to be created
   * @param {String} ruleData.utilizationState - utilization state value
   * @param {String} ruleData.status - asset status value
   * @param {String} ruleData.shrinkageState - state of the shrinkage
   * @param {String} ruleData.shrinkageWindowValue - value of the shrinkage window
   * @param {String} ruleData.utilizationValue - value of utilization factor
   */
  static createOrderingRule = (ruleData) => {
    const { assetType, ruleName, roomType, status, utilizationState, shrinkageState, shrinkageWindowValue = null, utilizationValue = null } = ruleData
    Click.forcefullyOn(addRule)

    //verifying initial state
    Verify.theElement(createBtn).isDisabled()
    Verify.theElement(cancelButton).isEnabled()

    //entering the form fields
    Type.theText(ruleName).into(ruleNameField)
    Click.forcefullyOn(roomTypeField)
    Type.theText(roomType).into(roomTypeSearchField)
    cy.contains(divTag, roomType).click(commandOptions.force)

    //entering asset type value
    cy.contains(labelTag, smartRulesConstant.buttonsInnerText.assetType).next().click(commandOptions.force)
    Type.theText(assetType).into(assetTypeSearchField)
    cy.contains(spanTag, assetType).parent().find(checkbox).check(commandOptions.force)

    //verifying warning text
    cy.contains(divTag, warningText).should(commandOptions.haveText, warningText)

    //selecting on the rules criteria radio buttons
    if (status === 'missingRadioButton') {
      Click.forcefullyOn(missingRadioButton)
      if (utilizationState === 'utilizedRadioButton') {
        Click.forcefullyOn(utilizedRadioButton)
        Type.theText(utilizationValue).into(utilizationFactor)
      } else {
        Click.forcefullyOn(prosightAssetsSels.smartRules[utilizationState])
      }
      if (shrinkageState === 'lostRadioButton') {
        Click.forcefullyOn(lostRadioButton)
        Click.forcefullyOn(shrinkageWindow)
        cy.contains(shrinkageWindowValue).click(commandOptions.force)
      } else {
        Click.forcefullyOn(prosightAssetsSels.smartRules[shrinkageState])
      }
    } else {
      Click.forcefullyOn(prosightAssetsSels.smartRules[status])
      if (utilizationState === 'utilizedRadioButton') {
        Click.forcefullyOn(utilizedRadioButton)
        Type.theText(utilizationValue).into(utilizationFactor)
      } else {
        Click.forcefullyOn(prosightAssetsSels.smartRules[utilizationState])
      }
    }
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
  }

  /**
   * This function is used to verify the rule criteria set for different asset status
   */
  static verifyTheRuleCriteriaForAssetStatus = () => {
    const status = [
      'availableRadioButton',
      'operationalRadioButton',
      'maintenanceRadioButton',
      'cleaningRadioButton',
      'inMaintenanceRadioButton',
      'missingRadioButton',
      'outOfCirculationRadioButton',
      'utilizedRadioButton',
      'notUtilizedRadioButton',
      'assetStatusNaButton',
      'assetUtilizationNaButton',
    ]

    Click.forcefullyOn(addRule)
    cy.contains(labelTag, assetStatus).parent().find(naRadioButton).as('assetStatusNaButton')
    cy.contains(labelTag, assetUtilizationState).parent().find(naRadioButton).as('assetUtilizationNaButton')

    status.forEach((element) => {
      if (element === 'assetStatusNaButton') {
        Click.forcefullyOn('@assetStatusNaButton')
      } else if (element === 'assetUtilizationNaButton') {
        Click.forcefullyOn('@assetUtilizationNaButton')
      } else {
        Click.forcefullyOn(prosightAssetsSels.smartRules[element])
      }
      if (element === 'missingRadioButton') {
        cy.get(lostRadioButton).should('not.have.attr', 'disabled')
        cy.contains(labelTag, assetShrinkageState).parent().find(naRadioButton).should('not.have.attr', 'disabled')
      } else {
        cy.get(lostRadioButton).should('have.attr', 'disabled')
        cy.contains(labelTag, assetShrinkageState).parent().find(naRadioButton).should('have.attr', 'disabled')
      }
    })
    Click.forcefullyOn(cancelButton)
  }

  /**
   * This function is used to verify the ordering/operation rule data on the table view
   * @param {Object} ruleData - Object that contains the assetType,ruleName and roomType to create rule
   * @param {String} ruleData.assetType  - Type of the asset for which rules needs to be created
   * @param {String} ruleData.ruleName - Name of the Rule
   * @param {String} ruleData.roomType - Type of the room for which rules needs to be created
   * @param {String} ruleData.utilizationState - utilization state value
   * @param {String} ruleData.status - asset status value
   * @param {String} ruleData.shrinkageState - state of the shrinkage
   * @param {String} ruleData.utilizationValue - value of utilization factor
   * @param {String} ruleData.department -Department for which rules needs to be created
   * @param {String} ruleData.location -Location for which rules needs to be created
   * @param {String} ruleData.parLevelThreshold - value of parLevelThreshold
   * @param {String} ruleData.underParValue - value of under Par
   * @param {String} ruleData.overParValue - value of over Par
   * @param {string} ruleType it is the required rule type i.e ordering or operation
   */
  static verifyRuleDataOnTableView = (ruleData, ruleType) => {
    let searchText, valuesToVerify, requiredUtilizationState, requiredUtilizationValue, requiredShrinkageWindowValue
    if (ruleType === ordering) {
      const { assetType, ruleName, roomType, status, utilizationState, shrinkageState, utilizationValue } = ruleData
      //setting data values values according to input
      if (typeof utilizationState === 'boolean') {
        requiredUtilizationState = 'Not Utilized'
      } else {
        utilizationState.includes('utilized') ? 'Utilized ' : 'N/A'
      }

      if (utilizationValue === null) {
        requiredUtilizationValue = ''
      } else {
        requiredUtilizationValue = `${utilizationValue}%`
      }
      //assigning search test and rule object for ordering rule
      searchText = ruleName
      valuesToVerify = {
        assetType: assetType,
        ruleName: ruleName,
        roomType: roomType,
        status: status.includes('available') ? 'Available' : status.includes('missing') ? 'Missing' : 'N/A',
        utilizationState: requiredUtilizationState,
        shrinkageState: 'N/A',
        utilizationValue: requiredUtilizationValue,
      }
    } else if (ruleType === operations) {
      //need to add one more entry for par name check
      const { assetType, department, location, parLevelThreshold, underParValue, overParValue } = ruleData
      const finalDataToVerify = { assetType, department, location, parLevelThreshold, underParValue, overParValue }
      searchText = assetType
      valuesToVerify = finalDataToVerify
    }

    //searching and verifying the rule details
    HelperFunction.search(searchText)
    HelperFunction.getRowByItemName(searchText, divTag).as('data')
    HelperFunction.verifyValuesExist('@data', valuesToVerify)
  }

  /**
   * This function is used to verify the ordering rule data on the side panel
   * @param {Object} ruleData - Object that contains the values for verification on side panel
   * @param {String} ruleData.status - asset status value
   * @param {String} ruleData.utilizationState - utilization state value
   * @param {String} ruleData.shrinkageState - state of the shrinkage
   * @param {String} ruleData.shrinkageWindowValue - value of the shrinkage window
   * @param {String} ruleData.assetType  - Type of the asset for which rules needs to be created
   * @param {String} ruleData.roomType - Type of the room for which rules needs to be created
   */
  static verifyOrderingRuleDataOnSidePanel = (ruleData) => {
    const { assetType, ruleName, roomType, status, utilizationState, shrinkageState, utilizationValue } = ruleData
    let requiredStatus, requiredUtilizationState
    if (status.includes('available')) {
      requiredStatus = 'Available'
    } else {
      requiredStatus = status.charAt(0).toUpperCase() + status.slice(1)
    }

    if (typeof utilizationState !== 'boolean') {
      if (utilizationState.includes('utilized')) {
        requiredUtilizationState = 'Utilized '
      }
    } else {
      if (!utilizationState) {
        requiredUtilizationState = 'Not Utilized '
      }
    }

    //need to add fields according to rule data input
    const sidePanelValues = {
      'Asset Status': requiredStatus,
      'Asset Utilization State': requiredUtilizationState,
      'Shrinkage State': 'N/A',
      'Shrinkage Window': 'N/A',
      'Room Type': roomType,
      'Asset Type': assetType,
    }

    //searching and verifying the rule details from side panel
    HelperFunction.search(ruleName, false)
    HelperFunction.getRowByItemName(ruleName, divTag).as('data')
    Click.forcefullyOn('@data')
    Verify.theElement(ruleNameOnSidePanel).hasText(ruleName)
    HelperFunction.verifyValueFromSidePanel(sidePanelValues, sidePanel)
  }

  /**
   * This function is used to create a rule using API call
   * @param {Object} ruleData - Object that contains the assetType,ruleName and roomType to create rule
   * @param {String} ruleData.assetType  - Type of the asset for which rules needs to be created
   * @param {String} ruleData.ruleName - Name of the Rule
   * @param {String} ruleData.roomType - Type of the room for which rules needs to be created
   * @param {String} ruleData.utilizationState - utilization state value
   * @param {String} ruleData.status - asset status value
   * @param {String} ruleData.shrinkageState - state of the shrinkage
   * @param {String} ruleData.shrinkageWindowValue - value of the shrinkage window
   * @param {String} ruleData.utilizationValue - value of utilization factor
   */
  // static createOrderingRule_API = (ruleData) => {
  //   const {
  //     assetType,
  //     ruleName,
  //     roomType,
  //     status,
  //     utilizationState = null,
  //     shrinkageState,
  //     shrinkageWindowValue,
  //     utilizationValue = null,
  //     utilized,
  //     utilizationFactor,
  //   } = ruleData
  //   const orderingRuleEndpoint = APIEndpoints.orderingRuleEndpoint(system_Id, hospital_Id)
  //   LoginPage.loginToApplication().then(({ authToken }) => {
  //     cy.api({
  //       method: leverageConstants.requestMethod.post,
  //       failOnStatusCode: leverageConstants.failOnStatusCode,
  //       headers: {
  //         authorization: authToken,
  //       },
  //       url: apiBaseURL + orderingRuleEndpoint + `${roomType}` + '/p/' + `${assetType}`,
  //       body: {
  //         type: 'rule',
  //         ruleName: ruleName,
  //         roomType: roomType,
  //         assetType: assetType,
  //         status: status,
  //         utilized: utilized ?? null,
  //         shrinkage: shrinkageState ?? 'N/A',
  //         utilizationFactor: utilizationFactor ?? null,
  //         shrinkageWindow: shrinkageWindowValue ?? null,
  //       },
  //     }).then((res) => {
  //       if (res.status === 200) {
  //         expect(res.status).to.equal(200)
  //         cy.log(`${ruleName} created successfully`)
  //       } else {
  //         cy.log('Failed to create rule')
  //       }
  //     })
  //   })
  // }

  static createOrderingRule_API = (ruleData) => {
    const { assetType, ruleName, roomType, status, utilizationState, shrinkageState, shrinkageWindowValue = null, utilizationValue = null } = ruleData
    const orderingRuleEndpoint = APIEndpoints.orderingRuleEndpoint(system_Id, hospital_Id)
    LoginPage.loginToApplication().then(({ authToken }) => {
      cy.api({
        method: leverageConstants.requestMethod.post,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: authToken,
        },
        url: apiBaseURL + orderingRuleEndpoint + `${roomType}` + '/p/' + `${assetType}`,
        body: {
          type: 'rule',
          ruleName: ruleName,
          roomType: roomType,
          assetType: assetType,
          status: status,
          utilized: utilizationState,
          shrinkage: shrinkageState,
          utilizationFactor: utilizationValue,
          shrinkageWindow: shrinkageWindowValue,
        },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status).to.equal(200)
          cy.log(`${ruleName} created successfully`)
        } else {
          cy.log('Failed to create rule')
        }
      })
    })
  }

  /**
   * This function is used to edit the created ordering rule
   * @param {Object} ruleData - Object that contains the assetType,ruleName and roomType to edit rule
   * @param {String} ruleData.assetType  - Type of the asset for which rules needs to be edited
   * @param {String} ruleData.ruleName - Name of the Rule
   * @param {String} ruleData.roomType - Type of the room for which rules needs to be edited
   * @param {String} ruleData.utilizationState - utilization state value
   * @param {String} ruleData.status - asset status value
   * @param {String} ruleData.shrinkageState - state of the shrinkage
   * @param {String} ruleData.shrinkageWindowValue - value of the shrinkage window
   * @param {String} ruleData.utilizationValue - value of utilization factor
   * @param {String} ruleNameToEdit - Name of the rule to edit
   * @param {String} action - Action place for editing the rule
   */
  static editOrderingRule = (ruleData, ruleNameToEdit, action) => {
    const {
      assetType,
      ruleName,
      roomType,
      status,
      utilizationState,
      shrinkageState,
      shrinkageWindowValue = null,
      utilizationValue = null,
      utilized,
    } = ruleData

    HelperFunction.search(ruleNameToEdit, false)
    HelperFunction.getRowByItemName(ruleNameToEdit, divTag).as('data')

    if (action === sidePanels) {
      Click.forcefullyOn('@data')
      cy.get(sidePanel).find(editRule).click(commandOptions.force)
    } else if (action === tableView) {
      Click.onButton('@data', editRule)
    }

    //verifying initial state
    Verify.theElement(createBtn).isDisabled()
    Verify.theElement(cancelButton).isEnabled()

    //editing the rule fields
    Type.theText(ruleName).into(ruleNameField)
    Click.forcefullyOn(roomTypeField)
    Type.theText(roomType).into(roomTypeSearchField)
    cy.contains(divTag, roomType).click(commandOptions.force)

    if (status === 'missing') {
      Click.forcefullyOn(missingRadioButton)
      if (utilizationState === 'utilizedRadioButton') {
        Click.forcefullyOn(utilizedRadioButton)
        Type.theText(utilizationValue).into(utilizationFactor)
      } else {
        Click.forcefullyOn(prosightAssetsSels.smartRules[utilizationState])
      }
      if (shrinkageState === 'lostRadioButton') {
        Click.forcefullyOn(lostRadioButton)
        Click.forcefullyOn(shrinkageWindow)
        cy.contains(shrinkageWindowValue).click(commandOptions.force)
      } else {
        Click.forcefullyOn(prosightAssetsSels.smartRules[shrinkageState])
      }
    } else {
      Click.forcefullyOn(prosightAssetsSels.smartRules[status])
      if (utilizationState === 'utilizedRadioButton') {
        Click.forcefullyOn(utilizedRadioButton)
        Type.theText(utilizationValue).into(utilizationFactor)
      } else {
        Click.forcefullyOn(prosightAssetsSels.smartRules[utilizationState])
      }
    }

    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
  }

  /**
   * This function is used to delete the ordering rule using API call
   * @param {Object} ruleData - Object that contains the assetType and roomType for which rules needs to be deleted
   * @param {String} ruleData.assetType  - Type of the asset for which rules needs to be deleted
   * @param {String} ruleData.roomType - Type of the room for which rules needs to be deleted
   */
  static deleteOrderingRule_API = (ruleData) => {
    const { assetType, roomType } = ruleData
    const orderingRuleEndpoint = APIEndpoints.orderingRuleEndpoint(system_Id, hospital_Id)
    LoginPage.loginToApplication().then(({ authToken }) => {
      cy.api({
        method: leverageConstants.requestMethod.delete,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: authToken,
        },
        url: apiBaseURL + orderingRuleEndpoint + `${roomType}` + '/p/' + `${assetType}`,
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
   * This function is used to Delete ordering Rule
   * @param {String} ruleName - Name of the rule which needs to be deleted
   * @param {String} action  - Action place for deleting the rule
   */
  static deleteOrderingRule = (ruleName, action) => {
    HelperFunction.navigateToModule(button, smartRulesConstant.buttonsInnerText.smartRules)
    HelperFunction.search(ruleName)
    HelperFunction.getRowByItemName(ruleName, divTag).as('data')
    if (action === sidePanels) {
      Click.forcefullyOn('@data')
      cy.get(sidePanel).find(deleteRule).click(commandOptions.force)
    } else if (action === tableView) {
      Click.onButton('@data', deleteRule)
    }
    Verify.theElement(confirmationPopup).hasText(textOnDeletePopUp)
    Click.forcefullyOn(dialogueDeleteBtn)
  }

  /**
   * This function is used to create an operational rule
   * @param {Object} ruleData - This object contains the data to create operation rule
   * @param {String} ruleData.assetType - The asset type for which rule needs to be created
   * @param {String} ruleData.building - The name of the building for which rule needs to be created
   * @param {String} ruleData.department - The name of department for which rule needs to be created
   * @param {String} ruleData.location - The name of location for which rule needs to be created
   * @param {Number} ruleData.parLevelThreshold - The par level threshold value given for the rule
   * @param {String} ruleData.underParValue - The under par value given for the rule
   * @param {String} ruleData.overParValue - The over par value given for the rule
   * @param {String} ruleData.criticallyUnderParValue - The critically Under Par Value given for the rule
   */
  static createOperationRule = (ruleData) => {
    const { assetType, building, department, location, parLevelThreshold, underParValue, overParValue, criticallyUnderParValue } = ruleData
    Click.forcefullyOn(addRule)
    Verify.theElement(createBtn).isDisabled()
    Verify.theElement(cancelButton).isEnabled()
    cy.get(selectBuilding).click(commandOptions.force)
    Type.theText(building).into(roomTypeSearchField)
    cy.contains(divTag, building).click(commandOptions.force)
    cy.get(selectDepartment).click(commandOptions.force)
    Type.theText(department).into(roomTypeSearchField)
    cy.contains(divTag, department).click(commandOptions.force)
    cy.contains(labelTag, orderingLocation).next().click(commandOptions.force)
    Type.theText(location).into(roomTypeSearchField)
    cy.contains(divTag, location).click(commandOptions.force)
    cy.get(selectAssetType).click(commandOptions.force)
    Type.theText(assetType).into(roomTypeSearchField)
    cy.contains(divTag, assetType).click(commandOptions.force)
    cy.contains('Add AssetType').click({ force: true })
    Type.theText(parLevelThreshold).into(parThreshold)
    Type.theText(underParValue).into(underPar)
    Type.theText(overParValue).into(overPar)
    Type.theText(criticallyUnderParValue).into(criticallyUnderPar)
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
  }

  /**
   * This function is used to delete the operation rule using API call
   * @param {Object} ruleData - Object that contains the assetType,location parameter used t delete the operation rule
   * @param {String} ruleData.assetType  - Type of the asset for which rules needs to be deleted
   * @param {String} ruleData.location - Type of the location  for which rules needs to be deleted
   */
  static deleteOperationRule_API = (ruleData) => {
    const { assetType, location, department } = ruleData
    const operationRuleEndpoint = APIEndpoints.operationRuleEndpoint(system_Id, hospital_Id)
    HelperFunction.search_API(location, leverageConstants.objectTypes.room).then(({ authToken, Id }) => {
      cy.api({
        method: leverageConstants.requestMethod.delete,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        headers: {
          authorization: authToken,
        },
        url: apiBaseURL + operationRuleEndpoint + `${Id}` + '/p/' + `${assetType}`,
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status).to.equal(200)
          cy.log('Rule Deleted Sucessfully')
        } else {
          cy.log('Failed to delete rule at room level')
          HelperFunction.search_API(department, leverageConstants.objectTypes.departments).then(({ authToken, Id }) => {
            cy.api({
              method: leverageConstants.requestMethod.delete,
              failOnStatusCode: leverageConstants.failOnStatusCode,
              headers: {
                authorization: authToken,
              },
              url: apiBaseURL + operationRuleEndpoint + `${Id}` + '/p/' + `${assetType}`,
            }).then((res) => {
              if (res.status === 200) {
                expect(res.status).to.equal(200)
                cy.log('Rule Deleted Sucessfully')
              } else {
                cy.log('Failed to delete rule at depo level')
              }
            })
          })
        }
      })
    })
  }

  /**
   * This function is used to create an operational rule
   * @param {Object} ruleData - This object contains the data to create operation rule
   * @param {String} ruleData.assetType - The asset type for which rule needs to be created
   * @param {String} ruleData.building - The name of the building for which rule needs to be created
   * @param {String} ruleData.department - The name of department for which rule needs to be created
   * @param {String} ruleData.location - The name of location for which rule needs to be created
   * @param {Number} ruleData.parLevelThreshold - The par level threshold value given for the rule
   * @param {String} ruleData.underParValue - The under par value given for the rule
   * @param {String} ruleData.overParValue - The over par value given for the rule
   */
  static createOperationRule_API = (ruleData, departmentId, floorId, buildingId, locationId) => {
    const {
      assetType,
      building,
      department,
      location,
      parLevelThreshold,
      underParValue,
      overParValue,
      criticallyUnderParValue,
      roomType,
      floorName,
      proParDelayTime,
    } = ruleData
    const operationRuleEndpoint = APIEndpoints.operationRuleEndpoint(system_Id, hospital_Id)
    cy.task('getAuthToken').then((authToken) => {
      cy.api({
        method: leverageConstants.requestMethod.post,
        failOnStatusCode: leverageConstants.failOnStatusCode,
        url: apiBaseURL + operationRuleEndpoint + `${departmentId}` + '/p/' + `${assetType}`,
        headers: {
          authorization: authToken,
        },
        body: {
          type: 'rule',
          assetType: assetType,
          buildingId: buildingId,
          departmentId: departmentId,
          departmentName: department,
          roomId: locationId,
          roomName: location,
          par: parLevelThreshold,
          underPar: underParValue,
          overPar: overParValue,
          criticallyUnderPar: criticallyUnderParValue,
          floorName: floorName,
          floorIds: [floorId],
          roomType: roomType,
          isFavorite: true,
          proParDelayTime: proParDelayTime,
        },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status).to.equal(200)
          expect(res.body.data.assetType).to.equal(assetType)
        } else {
          cy.log('Failed to create rule')
        }
      })
    })
  }

  /**
   * This function is used to edit the created operation rule
   * @param {Object} ruleData - This object contains the data to create operation rule
   * @param {String} ruleData.assetType - The asset type for which rule needs to be created
   * @param {String} ruleData.building - The name of the building for which rule needs to be created
   * @param {String} ruleData.department - The name of department for which rule needs to be created
   * @param {String} ruleData.location - The name of location for which rule needs to be created
   * @param {Number} ruleData.parLevelThreshold - The par level threshold value given for the rule
   * @param {String} ruleData.underParValue - The under par value given for the rule
   * @param {String} ruleData.overParValue - The over par value given for the rule
   * @param {String} assetTypeToSearch - Asset Type to search on the page
   */
  static editOperationRule = (ruleData, assetTypeToSearch, action) => {
    //need to modify this params
    const { assetType, building, department, location, parLevelThreshold, underParValue, overParValue, criticallyUnderParValue } = ruleData
    HelperFunction.search(assetTypeToSearch)
    HelperFunction.getRowByItemName(assetTypeToSearch, divTag).as('data')
    Click.onButton('@data', editRule)
    cy.get(selectDepartment).click(commandOptions.force)
    Type.theText(department).into(roomTypeSearchField)
    cy.contains(divTag, department).click(commandOptions.force)
    cy.contains(labelTag, orderingLocation).next().click(commandOptions.force)
    Type.theText(location).into(roomTypeSearchField)
    cy.contains(divTag, location).click(commandOptions.force)
    Type.theText(parLevelThreshold).into(parThreshold)
    Type.theText(underParValue).into(underPar)
    Type.theText(overParValue).into(overPar)
    Type.theText(criticallyUnderParValue).into(criticallyUnderPar)
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
  }

  /**
   * This function is used to Delete operation Rule
   * @param {String} assetType - Type of the asset for which rule needs to be deleted
   */
  static deleteOperationRule = (assetType) => {
    HelperFunction.search(assetType)
    HelperFunction.getRowByItemName(assetType, divTag).as('data')
    Click.onButton('@data', deleteRule)
    Click.forcefullyOn(deleteRule)
    Verify.theElement(confirmationPopup).hasText(textOnDeletePopUp)
    Click.forcefullyOn(dialogueDeleteBtn)
  }
}
