/// <reference types="cypress" />
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import prosightAssetsSelectors from '../../utils/selectors/prosightAssets'
import commandOptions from '../../utils/constants/commandOptions'
import globalSels from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import { Verify } from '../../utils/assertions'
import userData from '../../fixtures/SignIn/user.json'
import SmartAlertsUsingAPI from '../prosightCore/triggeringAlerts'
import APIEndpoints from '../../../APIEndpoints'
import Click from '../../utils/Interactions/click'
import smartAlertConst from '../../utils/constants/smartAlertsManagementConst'
import alertData from '../../fixtures/prosightAssets/assetAlertData.json'
import LoginPage from '../signIn/siginPage'
const apiBaseURL = Cypress.env('API_BaseUrl')
const hospital_Id = Cypress.env('HospitalId')
const project_Id = Cypress.env('ProjectId')
const system_Id = Cypress.env('SystemId')
const assetBlueprintId = Cypress.env('AssetBlueprintId')
const { incidentSearchEndpoint, baseEndpoint } = APIEndpoints
const { shrinkage, maintenanceDue, rentalDue } = leverageConstants.alertTypes.assetAlertTypes.assetAlerts
const { tagOffline, tagLowBattery } = leverageConstants.alertTypes.assetAlertTypes.tagAlerts
const { criticallyUnderPAR, underPar, stockedOut } = leverageConstants.alertTypes.assetAlertTypes.parAlerts
const { originalCountForCriticalUnderParAlert, originalCountForStockedOutAlert, originalCountForUnderParAlert } = leverageConstants.parValues
const { divTag, button, buttonTag, alertTypeBtn, sortOptionDialog, resultRow, scrollBar } = globalSels
const { create, editTask, completeTask, completeButton, save, apply, acknowledge, createTask, clearButton } = smartAlertConst.buttonsInnerText
const { paginationRange } = smartAlertConst
const { alertTypeHeader, building, floor, location, assetTypes, assetIds, tagID, acknowledgedBy } = smartAlertConst.tableColumnHeaders
const { sidePanel, tableView } = smartAlertConst.actionPlace
const { commentForTask, commentForEditedTask } = smartAlertConst.comments
const { searchBar } = prosightAssetsSelectors.assetsManagement
const {
  selectActionDropDown,
  searchBarOnFilter,
  labels,
  alertTypeInSidePanel,
  sidePanelAssetName,
  acknowledgeFromSidePanel,
  commentForCreatingTask,
  createTaskFromSidePanel,
  unacknowledgedButtonOnPopup,
  unacknowledgedFromSidePanel,
  unacknowledgedFromTable,
  clearAlertFromSidePanel,
  clearButtonOnFilter,
  clearButtonOnPopUp,
  clearButtonOnTableView,
  completeTaskFromTableView,
  tagLowBatteryFilter,
  tagOfflineFilter,
  shrinkageFilter,
  rentalDueFilter,
  criticallyUnderPARFilter,
  maintenanceDueFilter,
  underParFilter,
  stockedOutFilter,
  assetExitBuilding,
  filterLabels,
} = prosightAssetsSelectors.smartAlerts
const { bottomRight, scrollBottom, scrollRight, duration, force } = commandOptions
const { labelOnSidePanel } = prosightAssetsSelectors.smartRules
const { mobile, desktop } = globalSels.viewport
const { hospitalName, buildingName, roomDetails, locationDetails, floorDetails, departmentName, locationName, previousRoomName } = alertData

/**
 * This regex ensures that it will match the complete word without any additional characters or spaces.
 */
const completeRegex = new RegExp(`^${completeButton}$`)

/** This class consists of different static functions related to smart alerts page
 * @class Asset_API
 */
export default class Asset_API {
  /**
   * This function is used to create asset data for triggering alerts
   * @param {object} assetDetails object that contains the asset data for asset creation (assetName, assetType, assetId, serialNumber)
   * @param {string} assetDetails.assetName required asset name
   * @param {string} assetDetails.assetType required asset type
   * @param {string} assetDetails.assetId required asset Id
   * @param {string} assetDetails.serialNumber required asset serial number
   */

  static createAsset = (assetDetails) => {
    const assetActionEndpoint = APIEndpoints.assetActionEndpoint(system_Id, hospital_Id)
    const { assetName, assetType, assetId, serialNumber, modelNum, departmentName } = assetDetails

    cy.task('getAuthToken').then((authToken) => {
      HelperFunction.search_API(departmentName, leverageConstants.objectTypes.departments).then(({ authToken, Id }) => {
        let depId = Id
        cy.api({
          method: leverageConstants.requestMethod.post,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          url: apiBaseURL + assetActionEndpoint,
          headers: {
            authorization: authToken,
          },
          body: {
            networkAliases: {
              assets: {
                name: assetName,
                deviceId: assetId,
              },
            },
            networkId: 'assets',
            name: assetName,
            data: [
              {
                path: 'assetType',
                value: assetType,
              },
              {
                path: 'isRental',
                value: false,
              },
              {
                path: 'name',
                value: assetName,
              },
              {
                path: 'assetId',
                value: assetId,
              },
              {
                path: 'serialNumber',
                value: serialNumber,
              },
              {
                path: 'assignedDepartment/id',
                value: depId,
              },
              {
                path: 'assignedDepartment/name',
                value: departmentName,
              },
              {
                path: 'status/operational',
                value: true,
              },
              {
                path: 'status/available',
                value: false,
              },
              {
                path: 'status/cleaningRequired',
                value: false,
              },
              {
                path: 'status/maintenanceRequired',
                value: false,
              },
              {
                path: 'status/inMaintenance',
                value: false,
              },
              {
                path: 'status/outOfCirculation',
                value: false,
              },
              {
                path: 'status/lost',
                value: false,
              },
            ],
          },
        }).then((res) => {
          expect(res.status).eql(200)
          expect(res.body.data.assetType, 'Verifying the asset type name').eql(assetType)
          expect(res.body.data.name, 'Verifying asset name').eql(assetName)
          cy.log(`Asset created ${assetName} successfully `)
        })
      })
    })
  }

  /**
   * Triggers asset alerts based on the provided asset details and alert type.
   *
   * @param {Object} assetDetails - The details of the asset.
   * @param {string} assetDetails.assetName - The name of the asset.
   * @param {string} assetDetails.assetType - The type of the asset.
   * @param {string} assetDetails.assetId - The ID of the asset.
   * @param {string} alertType - The type of alert to be triggered.
   * @param {boolean} [autoClear=false] - Flag indicating whether to auto-clear the alert.
   */
  static triggerAssetAlerts = (assetDetails, alertType, assetdeviceId, assethardwareExternalId, autoClear = false) => {
    const { assetName, assetType, assetId, buildingId, buildingName, departmentID, departmentName, locationID, locationName, floorID, floorName } =
      assetDetails

    const baseEndPoint = APIEndpoints.baseEndpoint(system_Id, hospital_Id)
    const timerEndPoint = APIEndpoints.timerEndpoint(project_Id)
    const assetSearchEndpoint = APIEndpoints.assetSearchEndpoint
    let deviceId, timerId, hardwareExternalId

    //login to leverage setting up required message and triggering alert
    return SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {
      // cy.api({
      //   method: commandOptions.requestMethod.post,
      //   failOnStatusCode: leverageConstants.failOnStatusCode,
      //   url: apiBaseURL + baseEndPoint + assetSearchEndpoint,
      //   headers: {
      //     authorization: architectAuthToken,
      //   },
      //   body: {
      //     limit: leverageConstants.staffSearchConstants.limit,
      //     offset: leverageConstants.staffSearchConstants.offset,
      //     filter: {
      //       type: leverageConstants.staffSearchConstants.type,
      //       operator: leverageConstants.staffSearchConstants.operator,
      //       conditions: [
      //         {
      //           type: leverageConstants.staffSearchConstants.conditionType,
      //           field: leverageConstants.staffSearchConstants.field,
      //           value: assetName,
      //           empty: leverageConstants.staffSearchConstants.empty,
      //           fieldType: leverageConstants.staffSearchConstants.fieldType,
      //         },
      //       ],
      //     },
      //     sort: [
      //       {
      //         field: leverageConstants.staffSearchConstants.sortField,
      //         order: leverageConstants.staffSearchConstants.order,
      //       },
      //     ],
      //     nextToken: leverageConstants.staffSearchConstants.nextToken,
      //   },
      // }).then((deviceData) => {
      //   expect(deviceData.status).eql(200)
      //   expect(deviceData.body).to.have.property('items')
      //   expect(deviceData.body?.items).not.to.be.empty
      //   deviceId = deviceData.body.items[0].id

      //   hardwareExternalId = deviceData.body.items[0].data?.tag?.data?.uniqueDeviceId
      //   cy.wrap(deviceId).as('deviceId')
      //   cy.wrap(hardwareExternalId).as('deviceHardwareExternalId')
      // })
      let msg
      if (alertType === tagOffline) {
        msg = {
          blueprintId: assetBlueprintId,
          deviceId: assetdeviceId,
          systemId: system_Id,
          projectId: project_Id,
          type: leverageConstants.alertTypeIds.assetsTagOffline,
          data: [],
        }
      } else if (alertType === shrinkage) {
        msg = {
          blueprintId: assetBlueprintId,
          deviceId: assetdeviceId,
          systemId: system_Id,
          projectId: project_Id,
          type: leverageConstants.alertTypeIds.assetShrinkage,
          data: [],
        }
      } else if (alertType === maintenanceDue) {
        msg = {
          blueprintId: assetBlueprintId,
          deviceId: assetdeviceId,
          systemId: system_Id,
          projectId: project_Id,
          templateId: leverageConstants.templateId.maintenanceDue,
          application: leverageConstants.application.asset,
          alertType: leverageConstants.alertTypeIds.maintenanceDue,
          alertPriority: 2,
          deviceExternalId: assetId,
          deviceName: assetName,
          deviceType: assetType,
          deviceHardwareExternalId: assethardwareExternalId,
          objectType: leverageConstants.objectTypes.asset,
          time: new Date().getTime(),
          type: leverageConstants.messageType,
          data: [],
          deviceLocation: {
            building: {
              id: buildingId,
              name: buildingName,
            },
            department: {
              id: departmentID,
              name: departmentName,
            },
            floor: {
              id: floorID,
              name: floorName,
            },
            room: {
              id: locationID,
              name: locationName,
            },
          },
        }
      } else if (alertType === rentalDue) {
        msg = {
          blueprintId: assetBlueprintId,
          deviceId: assetdeviceId,
          systemId: system_Id,
          projectId: project_Id,
          templateId: leverageConstants.templateId.rentalDue,
          application: leverageConstants.application.asset,
          alertType: leverageConstants.alertTypeIds.rentalDue,
          alertPriority: 6,
          deviceExternalId: assetId,
          deviceName: assetName,
          deviceType: assetType,
          deviceHardwareExternalId: assethardwareExternalId,
          objectType: leverageConstants.objectTypes.asset,
          time: new Date().getTime(),
          type: leverageConstants.messageType,
          data: [],
          deviceLocation: {
            building: {
              id: buildingId,
              name: buildingName,
            },
            department: {
              id: departmentID,
              name: departmentName,
            },
            floor: {
              id: floorID,
              name: floorName,
            },
            room: {
              id: locationID,
              name: locationName,
            },
          },
        }
      } else if (alertType === criticallyUnderPAR || alertType === stockedOut || alertType === underPar) {
        let requiredCount
        //setting the required count according to PAR alert type
        if (autoClear) {
          requiredCount = 4
        } else {
          if (alertType === criticallyUnderPAR) {
            requiredCount = originalCountForCriticalUnderParAlert
          } else if (alertType === stockedOut) {
            requiredCount = originalCountForStockedOutAlert
          } else if (alertType === underPar) {
            requiredCount = originalCountForUnderParAlert
          }
        }
        msg = {
          blueprintId: assetBlueprintId,
          data: [
            {
              path: 'data/originalCount',
              value: requiredCount,
            },
            {
              path: 'data/originalPar',
              value: 10,
            },
            {
              path: 'data/originalUnderPar',
              value: 6,
            },
            {
              path: 'data/originalOverPar',
              value: 15,
            },
            {
              path: 'data/originalCriticallyUnderPar',
              value: 4,
            },
            {
              path: 'data/source/id',
              value: deviceId,
            },
            {
              path: 'data/source/name',
              value: assetName,
            },
            {
              path: 'data/source/type',
              value: 'asset',
            },
            {
              path: 'data/source/externalId',
              value: assetId,
            },
            {
              path: 'data/acknowledged/status',
              value: false,
            },
            {
              path: 'data/location/room/id',
              value: locationID,
            },
            {
              path: 'data/location/room/name',
              value: locationName,
            },
            {
              path: 'data/location/floor/id',
              value: floorID,
            },
            {
              path: 'data/location/floor/name',
              value: floorName,
            },
            {
              path: 'data/location/building/id',
              value: buildingId,
            },
            {
              path: 'data/location/building/name',
              value: buildingName,
            },
            {
              path: 'data/location/department/name',
              value: departmentName,
            },
            {
              path: 'data/location/department/id',
              value: departmentID,
            },
          ],
          deviceId: assetdeviceId,
          systemId: system_Id,
          projectId: project_Id,
          type: leverageConstants.alertTypeIds.parAlert,
        }
      }
      return cy
        .api({
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
              topic: leverageConstants.topic,
              message: msg,
            },
          },
        })
        .then((timerData) => {
          expect(timerData.status).eql(200)
          expect(timerData.body).to.have.property('id')
          timerId = timerData.body?.id
          cy.wrap(timerId).as('createdTimerId')
          return cy.get('@createdTimerId').then((timerId) => {
            cy.api({
              method: commandOptions.requestMethod.put,
              url: apiBaseURL + timerEndPoint + `${timerId}/start`,
              failOnStatusCode: leverageConstants.failOnStatusCode,
              headers: {
                authorization: architectAuthToken,
              },
            }).then((res) => {
              expect(res.status).to.eql(200)
              cy.log(`${alertType} alert triggered successfully`)
            })
          })
        })
    })
  }

  /**
   * This function is used to clear all existing alerts from the alerts page.
   * @param {string} assetName - Name of the asset
   */
  static clearAllExistingAlert = (assetName) => {
    cy.get(searchBar).clear().type(`${assetName},commandOptions.enter`)
    cy.reload()
    cy.get(globalSels.pagination.pagination).then((pageRange) => {
      let range = pageRange.text()
      if (range === paginationRange) {
        console.log('no alerts found')
      } else {
        cy.get(prosightAssetsSelectors.smartAlerts.bulkSelect).click(commandOptions.force)
        HelperFunction.getElementFromSpecificDiv(
          prosightAssetsSelectors.smartAlerts.tableTitle,
          prosightAssetsSelectors.smartAlerts.selectAllCheckbox
        ).click(commandOptions.force)
        cy.get(prosightAssetsSelectors.smartAlerts.clearButton).click(commandOptions.force)
        cy.get(clearButtonOnPopUp).click(commandOptions.force)
      }
    })
  }

  /**
   * This function is used to apply the alert type filter
   * @param {string} alertType - Type of the alert that you need to do actions on
   */
  static selectAlertTypeFromFilter = (alertType, viewport = desktop) => {
    let searchText

    //assigning changed text in case of shrinkage alert
    if (alertType === 'Shrinkage') {
      searchText = 'Asset Exited Building'
    } else searchText = alertType

    if (viewport == desktop) {
      //verifying no filters are applied if applied clearing all
      cy.get(globalSels.clearAllButton).then(($button) => {
        const isDisabled = $button.is(':disabled')

        if (isDisabled) {
          expect($button).is.disabled
        } else {
          cy.wrap($button).click()
        }
      })
      cy.reload()
      cy.get(filterLabels).contains(alertTypeHeader).next().click(commandOptions.force)
      Verify.elementContainingText(button, apply).parentElementIsDisabled()
      cy.get(searchBarOnFilter).type(searchText)
    } else if (viewport === mobile) {
      Click.forcefullyOn(alertTypeBtn)
      cy.get(sortOptionDialog).find(searchBar).type(alertType)
    }

    //selecting checkboxes according to alert types
    if (alertType === tagOffline) {
      cy.get(tagOfflineFilter).check(force)
    } else if (alertType === tagLowBattery) {
      cy.get(tagLowBatteryFilter).check(force)
    } else if (alertType === maintenanceDue) {
      cy.get(maintenanceDueFilter).check(force)
    } else if (alertType === shrinkage) {
      cy.get(assetExitBuilding).check(force)
    } else if (alertType === rentalDue) {
      cy.get(rentalDueFilter).check(force)
    } else if (alertType === criticallyUnderPAR) {
      cy.get(criticallyUnderPARFilter).check(force)
    } else if (alertType === underPar) {
      cy.get(underParFilter).check(force)
    } else if (alertType === stockedOut) {
      cy.get(stockedOutFilter).check(force)
    }

    cy.contains(button, apply).click(commandOptions.force)
  }

  /**
   * This function is used to perform acknowledge functions on alerts
   * @param {object} valuesToVerifyInTableView - Object that contains assetName, assetId, floorName, departmentName, locationName, for performing actions
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} deviceId It is te id of the device
   */
  static acknowledgeAlert = (valuesToVerifyInTableView, alertAction, typeOfAlert, deviceId) => {
    const { assetName, assetType, assetId, floorName, departmentName, locationName, buildingName } = valuesToVerifyInTableView
    let finalValuesToVerifyInTableView = { assetName, assetId, floorName, departmentName, locationName }
    const values = { ...finalValuesToVerifyInTableView, typeOfAlert }
    const valuesToVerifyParAlerts = { assetName, typeOfAlert }
    cy.get(searchBar).clear().type(`${assetName}${commandOptions.enter}`)
    HelperFunction.getRowByItemName(assetName, resultRow, 'asset-alerts').as('data1')
    if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
      HelperFunction.verifyValuesExist('@data1', valuesToVerifyParAlerts)
    } else {
      HelperFunction.verifyValuesExist('@data1', values)
    }
    if (alertAction === tableView) {
      cy.get(scrollBar).scrollTo(scrollRight, duration)
      Click.onButton('@data1', selectActionDropDown)
      cy.contains(acknowledge).click(commandOptions.force)
      cy.get(labels).contains(acknowledge).click(commandOptions.force)
    } else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      } else {
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
        Verify.verifySidePanels(globalSels.sidePanel, assetTypes).verifyDataInSidePanel(assetType)
        Verify.verifySidePanels(globalSels.sidePanel, assetIds).verifyDataInSidePanel(assetId)
        Verify.verifySidePanels(labelOnSidePanel, building).verifyDataInSidePanel(buildingName)
        Verify.verifySidePanels(globalSels.sidePanel, floor).verifyDataInSidePanel(floorName)
        Verify.verifySidePanels(globalSels.sidePanel, location).verifyDataInSidePanel(locationName)
        Verify.verifySidePanels(globalSels.sidePanel, tagID).verifyDataInSidePanel(deviceId)
      }
      cy.get(acknowledgeFromSidePanel).click(commandOptions.force)
      cy.get(labels).contains(acknowledge).click(commandOptions.force)
    }
  }

  /**
   *
   * This function is used to perform create task functions on alerts
   * @param {object} valuesToVerifyInTableView - Object that contains assetName, assetId, floorName, departmentName, locationName, for performing actions
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} deviceId It is te id of the device
   */
  static createTask = (valuesToVerifyInTableView, alertAction, typeOfAlert, deviceId) => {
    const { assetName, assetId, floorName, departmentName, locationName, assetType, buildingName } = valuesToVerifyInTableView
    let finalValuesToVerifySidePanel = { assetName, assetType, buildingName, floorName, locationName }
    let finalValuesToVerifyInTableView = { assetName, assetId, floorName, departmentName, locationName }
    const valuesToVerifyParAlerts = { assetName, typeOfAlert }
    const values = { ...finalValuesToVerifyInTableView, typeOfAlert }
    cy.get(searchBar).clear().type(`${assetName}${commandOptions.enter}`)
    HelperFunction.getRowByItemName(assetName, resultRow, 'asset-alerts').as('data1')
    if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
      HelperFunction.verifyValuesExist('@data1', valuesToVerifyParAlerts)
    } else {
      HelperFunction.verifyValuesExist('@data1', values)
    }
    if (alertAction === tableView) {
      cy.get(scrollBar).scrollTo(scrollRight, duration)
      Click.onButton('@data1', selectActionDropDown)
      cy.contains(createTask).click(commandOptions.force)
      cy.get(commentForCreatingTask).click().type(commentForTask)
      cy.get(labels).contains(create).click(commandOptions.force)
    } else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      } else {
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
        Verify.verifySidePanels(globalSels.sidePanel, assetTypes).verifyDataInSidePanel(assetType)
        Verify.verifySidePanels(globalSels.sidePanel, assetIds).verifyDataInSidePanel(assetId)
        Verify.verifySidePanels(labelOnSidePanel, building).verifyDataInSidePanel(buildingName)
        Verify.verifySidePanels(globalSels.sidePanel, floor).verifyDataInSidePanel(floorName)
        Verify.verifySidePanels(globalSels.sidePanel, location).verifyDataInSidePanel(locationName)
        Verify.verifySidePanels(globalSels.sidePanel, tagID).verifyDataInSidePanel(deviceId)
      }
      cy.get(createTaskFromSidePanel).click(commandOptions.force)
      cy.get(commentForCreatingTask).click().type(commentForTask)
      cy.get(labels).contains(create).click(commandOptions.force)
    }
  }

  /**
   * This function is used to perform unacknowledged functions on alerts
   * @param {Object} assetInfo - Object that contains assetName, assetId, floorName, departmentName, locationName, for performing actions
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} username - Name of the user that made actions on the alert
   */
  static unacknowledgedAlert = (assetInfo, typeOfAlert, alertAction, username) => {
    const { assetName, assetId, assetType, buildingName, floorName, locationName } = assetInfo
    const values = { assetName, assetId, typeOfAlert, username }
    const valuesToVerifyParAlerts = { assetName, typeOfAlert, username }
    cy.log(assetName)
    cy.get(searchBar).clear().type(`${assetName}${commandOptions.enter}`)
    HelperFunction.getRowByItemName(assetName, resultRow, 'asset-alerts').as('data1')
    if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
      HelperFunction.verifyValuesExist('@data1', valuesToVerifyParAlerts)
    } else {
      HelperFunction.verifyValuesExist('@data1', values)
    }
    if (alertAction === tableView) {
      Verify.theElement(unacknowledgedFromTable).isEnabled()
      cy.wait(2000)
      Click.onButton('@data1', unacknowledgedFromTable)
      Verify.theElement(unacknowledgedButtonOnPopup).isEnabled()
      cy.get(unacknowledgedButtonOnPopup).click(commandOptions.force)
    } else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
        Verify.verifySidePanels(globalSels.sidePanel, assetTypes).verifyDataInSidePanel(assetType)
        Verify.verifySidePanels(labelOnSidePanel, building).verifyDataInSidePanel(buildingName)
        Verify.verifySidePanels(globalSels.sidePanel, floor).verifyDataInSidePanel(floorName)
        Verify.verifySidePanels(globalSels.sidePanel, location).verifyDataInSidePanel(locationName)
        Verify.verifySidePanels(globalSels.sidePanel, acknowledgedBy).verifyDataInSidePanel(userData.username)
      } else {
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(unacknowledgedFromSidePanel).isEnabled()
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
        Verify.verifySidePanels(globalSels.sidePanel, assetTypes).verifyDataInSidePanel(assetType)
        Verify.verifySidePanels(globalSels.sidePanel, assetIds).verifyDataInSidePanel(assetId)
        Verify.verifySidePanels(labelOnSidePanel, building).verifyDataInSidePanel(buildingName)
        Verify.verifySidePanels(globalSels.sidePanel, floor).verifyDataInSidePanel(floorName)
        Verify.verifySidePanels(globalSels.sidePanel, location).verifyDataInSidePanel(locationName)
        Verify.verifySidePanels(globalSels.sidePanel, acknowledgedBy).verifyDataInSidePanel(userData.username)
      }
      Verify.theElement(unacknowledgedFromSidePanel).isEnabled()
      cy.wait(2000)
      cy.get(unacknowledgedFromSidePanel).click(commandOptions.force).click(commandOptions.force)
      Verify.theElement(unacknowledgedButtonOnPopup).isEnabled()
      cy.get(unacknowledgedButtonOnPopup).click(commandOptions.force)
    }
  }

  /**
   * This function is used to edit the create task on the alert
   * @param {Object} assetInfo - Object that contains assetName, assetId, floorName, departmentName, locationName, for performing actions
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} username - Name of the user that made actions on the alert
   */
  static editCreatedTask = (assetInfo, typeOfAlert, username) => {
    const { assetName, assetId } = assetInfo
    let verifyTaskDescription = commentForTask
    let finalValuesToVerify = { assetName, assetId, typeOfAlert, username, verifyTaskDescription }
    let valuesToVerifyForParAlerts = { assetName, typeOfAlert, username, verifyTaskDescription }
    cy.get(searchBar).clear().type(`${assetName}${commandOptions.enter}`)
    HelperFunction.getRowByItemName(assetName, resultRow, 'asset-alerts').as('data1')
    if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
      HelperFunction.verifyValuesExist('@data1', valuesToVerifyForParAlerts)
    } else {
      HelperFunction.verifyValuesExist('@data1', finalValuesToVerify)
    }
    cy.wait(2000)
    Click.onButton('@data1', prosightAssetsSelectors.smartAlerts.editTask)
    Verify.theElement(unacknowledgedButtonOnPopup).isDisabled()
    Verify.theElement(commentForCreatingTask).hasText(commentForTask)
    cy.get(commentForCreatingTask).click().clear().type(commentForEditedTask)
    cy.get(labels).contains(save).click(commandOptions.force)
  }

  /**
   * This function is used to complete task for the alerts
   * @param {Object} assetInfo - Object that contains assetName, assetId, floorName, departmentName, locationName, for performing actions
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} username - Name of the user that made actions on the alert
   * @param {string} alertAction - Place where alert action needs to be made
   */
  static completeTask = (assetInfo, typeOfAlert, username, alertAction) => {
    const { assetName, assetId, assetType, buildingName, floorName, locationName } = assetInfo
    let verifyEditedTaskDescription = commentForEditedTask
    let finalValuesToVerify = { assetName, assetId, typeOfAlert, username, verifyEditedTaskDescription }
    let valuesToVerifyForParAlerts = { assetName, typeOfAlert, username, verifyEditedTaskDescription }
    cy.get(searchBar).clear().type(`${assetName}${commandOptions.enter}`)
    HelperFunction.getRowByItemName(assetName, resultRow, 'asset-alerts').as('data1')
    if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
      HelperFunction.verifyValuesExist('@data1', valuesToVerifyForParAlerts)
    } else {
      HelperFunction.verifyValuesExist('@data1', finalValuesToVerify)
    }
    if (alertAction === tableView) {
      //cy.wait(2000)
      Click.onButton('@data1', completeTaskFromTableView)
      cy.get(unacknowledgedButtonOnPopup).click(commandOptions.force)
    } else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      } else {
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        //cy.wait(2000)
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
        Verify.theElement(prosightAssetsSelectors.smartAlerts.taskDescription).contains(commentForEditedTask)
        Verify.verifySidePanels(globalSels.sidePanel, assetTypes).verifyDataInSidePanel(assetType)
        Verify.verifySidePanels(globalSels.sidePanel, assetIds).verifyDataInSidePanel(assetId)
        Verify.verifySidePanels(labelOnSidePanel, building).verifyDataInSidePanel(buildingName)
        Verify.verifySidePanels(globalSels.sidePanel, floor).verifyDataInSidePanel(floorName)
        Verify.verifySidePanels(globalSels.sidePanel, location).verifyDataInSidePanel(locationName)
      }
      HelperFunction.getElementFromSpecificDiv(
        prosightAssetsSelectors.smartAlerts.taskCard,
        prosightAssetsSelectors.smartAlerts.completeTaskFromSidePanel
      ).click(commandOptions.force)
      cy.get(unacknowledgedButtonOnPopup).click(commandOptions.force)
    }
  }

  /**
   * This function is used to clear alerts
   * @param {object} valuesToVerifyInTableView - Object that contains assetName, assetId, floorName, departmentName, locationName, for performing actions
   * @param {string} alertAction - Place where alert action needs to be made
   * @param {string} typeOfAlert - Type of the alert that you need to do actions on
   * @param {string} deviceId It is te id of the device
   */
  static clearAlert = (valuesToVerifyInTableView, alertAction, typeOfAlert, deviceId) => {
    const { assetName, assetId, floorName, departmentName, locationName, assetType, buildingName } = valuesToVerifyInTableView
    let finalValuesToVerifyInTableView = { assetName, assetId, floorName, departmentName, locationName }
    const values = { ...finalValuesToVerifyInTableView, typeOfAlert }
    const valuesToVerifyParAlerts = { assetName, typeOfAlert }
    cy.get(searchBar).clear().type(`${assetName}${commandOptions.enter}`)
    HelperFunction.getRowByItemName(assetName, resultRow, 'asset-alerts').as('data1')
    if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
      HelperFunction.verifyValuesExist('@data1', valuesToVerifyParAlerts)
    } else {
      HelperFunction.verifyValuesExist('@data1', values)
    }
    if (alertAction === tableView) {
      cy.get(scrollBar).scrollTo(scrollRight, duration)
      Click.onButton('@data1', selectActionDropDown)
      cy.get(clearButtonOnTableView).contains(clearButton).click(commandOptions.force)
      cy.get(clearButtonOnPopUp).click(commandOptions.force)
    } else if (alertAction === sidePanel) {
      cy.get('@data1').click(commandOptions.force)
      if (typeOfAlert === criticallyUnderPAR || typeOfAlert === underPar || typeOfAlert === stockedOut) {
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
      } else {
        Verify.theElement(sidePanelAssetName).hasText(assetName)
        Verify.theElement(alertTypeInSidePanel).hasText(typeOfAlert)
        Verify.verifySidePanels(globalSels.sidePanel, assetTypes).verifyDataInSidePanel(assetType)
        Verify.verifySidePanels(globalSels.sidePanel, assetIds).verifyDataInSidePanel(assetId)
        Verify.verifySidePanels(labelOnSidePanel, building).verifyDataInSidePanel(buildingName)
        Verify.verifySidePanels(globalSels.sidePanel, floor).verifyDataInSidePanel(floorName)
        Verify.verifySidePanels(globalSels.sidePanel, location).verifyDataInSidePanel(locationName)
        Verify.verifySidePanels(globalSels.sidePanel, tagID).verifyDataInSidePanel(deviceId)
      }
      cy.get(clearAlertFromSidePanel).click(commandOptions.force)
      cy.get(clearButtonOnPopUp).click(commandOptions.force)
    }
  }

  static toGetDeviceDetails = (assetDetails) => {
    const baseEndPoint = APIEndpoints.baseEndpoint(system_Id, hospital_Id)
    const assetSearchEndpoint = APIEndpoints.assetSearchEndpoint
    const { assetName } = assetDetails

    return cy
      .then(() => {
        // Login and return the Cypress chain
        return SmartAlertsUsingAPI.loginToArchitect()
      })
      .then((architectAuthToken) => {
        if (!architectAuthToken) {
          throw new Error('Architect Auth Token is missing')
        }

        return cy.api({
          method: commandOptions.requestMethod.post,
          failOnStatusCode: false, // Allow response inspection
          url: apiBaseURL + baseEndPoint + assetSearchEndpoint,
          headers: {
            authorization: architectAuthToken,
          },
          body: {
            limit: leverageConstants.staffSearchConstants.limit,
            offset: leverageConstants.staffSearchConstants.offset,
            filter: {
              type: leverageConstants.staffSearchConstants.type,
              operator: leverageConstants.staffSearchConstants.operator,
              conditions: [
                {
                  type: leverageConstants.staffSearchConstants.conditionType,
                  field: leverageConstants.staffSearchConstants.field,
                  value: assetName,
                  empty: leverageConstants.staffSearchConstants.empty,
                  fieldType: leverageConstants.staffSearchConstants.fieldType,
                },
              ],
            },
            sort: [
              {
                field: leverageConstants.staffSearchConstants.sortField,
                order: leverageConstants.staffSearchConstants.order,
              },
            ],
            nextToken: leverageConstants.staffSearchConstants.nextToken,
          },
        })
      })
      .then((deviceData) => {
        const deviceId = deviceData.body.items[0].id
        const hardwareExternalId = deviceData.body.items[0].data?.tag?.data?.uniqueDeviceId

        return cy.wrap({ deviceId, hardwareExternalId })
      })
  }
  static searchAlertInEventsPage = (assetName, alertType) => {
    let resultOfAlert = false
    return cy.task('getAuthToken').then((authToken) => {
      return cy
        .api({
          url: apiBaseURL + baseEndpoint(system_Id, hospital_Id) + incidentSearchEndpoint,
          failOnStatusCode: false,
          method: leverageConstants.requestMethod.post,
          headers: {
            authorization: authToken,
          },
          body: {
            limit: 10,
            offset: 0,
            filter: {
              type: 'logical',
              operator: 'and',
              conditions: [
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/source/type',
                  value: ['asset'],
                },
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/acknowledged/status',
                  value: [true],
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
        })
        .then((res) => {
          expect(res.status).to.equal(200)
          expect(res.body.items).to.exist
          expect(res.body.items).to.be.an('array')

          let resultOfAlert = false

          res.body.items.forEach((item) => {
            if (item.data.alertType === alertType && item.data.source.name === assetName && item.data.acknowledged.status === false) {
              resultOfAlert = true
              const timestamp = item.lastModified
              const date = new Date(timestamp)
              cy.log(`Asset ${item.data.source.name} exists in Events Page on date ${date}`)
            }
          })

          if (!resultOfAlert) {
            cy.log(`${assetName} is not there in Events Page`)
          }
        })
    })
  }
  static searchAlertInAlertsPage = (assetName, alertType) => {
    let resultOfAlert = false
    return cy.task('getAuthToken').then((authToken) => {
      return cy
        .api({
          url: apiBaseURL + baseEndpoint(system_Id, hospital_Id) + incidentSearchEndpoint,
          failOnStatusCode: false,
          method: leverageConstants.requestMethod.post,
          headers: {
            authorization: authToken,
          },
          body: {
            limit: 10,
            offset: 0,
            filter: {
              type: 'logical',
              operator: 'and',
              conditions: [
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/source/type',
                  value: ['asset'],
                },
                {
                  empty: false,
                  type: 'equals',
                  field: 'data/acknowledged/status',
                  value: [false],
                },
                {
                  type: 'exists',
                  field: 'data/description',
                  not: true,
                },
              ],
            },
            sort: [
              {
                field: 'created',
                order: 'desc',
              },
            ],
            nextToken: null,
          },
        })
        .then((res) => {
          expect(res.status).to.equal(200)
          expect(res.body.items).to.exist
          expect(res.body.items).to.be.an('array')

          let resultOfAlert = false

          res.body.items.forEach((item) => {
            if (item.data.alertType === alertType && item.data.source.name === assetName && item.data.acknowledged.status === false) {
              resultOfAlert = true
              const timestamp = item.lastModified
              const date = new Date(timestamp)
              cy.log(`Asset ${item.data.source.name} exists in Alerts Page on date ${date}`)
            }
          })

          if (!resultOfAlert) {
            cy.log(`${assetName} is not there in Alerts Page`)
          }
        })
    })
  }
}
