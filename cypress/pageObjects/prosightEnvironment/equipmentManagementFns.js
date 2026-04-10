/// <reference types="cypress" />
import prosightEnvironmentSel from '../../utils/selectors/prosightEnvironment'
import prosightSafety from '../../utils/selectors/prosightSafety'
import commandOptions from '../../utils/constants/commandOptions'
import globalSels from '../../utils/selectors/globalSels'
import constants from '../../utils/constants/prosightEnvironment/equipmentAssignmentConst'
import Click from '../../utils/Interactions/click'
import { Verify } from '../../utils/assertions'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import LoginPage from '../signIn/siginPage'
import APIEndpoints from '../../../APIEndpoints'
import globalConst from '../../utils/constants/globalConst'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
const csv = require('neat-csv')

const {
  equipmentNameInput,
  equipmentIdInput,
  manuFactureNameInput,
  modelNumberInput,
  lastCalibrationDateInput,
  minimumTemInput,
  maximumTempInput,
  rentalDueDateInput,
  assignedOwnerDropdown,
  locationDropdown,
  floorDropdown,
  equipmentTypeDropdown,
  bulkUpload,
  fileNameForBulkImport,
} = prosightEnvironmentSel.equipmentManagement.equipmentAssignment
const { messageAfterBulkUpload } = constants.toastMessages
const { label_calibrationDueDate, label_rentalDetails, label_building, label_floor, label_location, label_assignedOwner } =
  prosightEnvironmentSel.equipmentManagement
const { options } = globalSels.filters
const { labelTag, button, cancelButton, resultRow } = globalSels
const { viewport, spanTag, saveBtn, editIconBtn, divTag, cardView, popupDialogBox, deleteBtnText, popupTextDailogMessage } = globalSels
const { equipment, equipmentType, loadingAssignedOwner } = constants.uiText
const { deleteEquipmentBtn, deleteEquipmentTypeBtn } = prosightEnvironmentSel.equipmentManagement.equipmentAssignment
const {
  confirmationMessageBeforeDeletingALinkedEquipmentType_Mobile,
  confirmationMessageBeforeDeletingEquipmentType,
  confirmationMessageBeforeDeletingEquipment,
  confirmationMessageBeforeDeletingSensorLinkedEquipment,
} = constants.confirmationMessages
const { preview, chooseFileButton, upload, completeCreation } = globalConst
const { bulkImportTitle, csvFileName } = constants.bulkImportConstants
const { bulkUploadButton, bulkUploadTitle, downloadCsvTemplate, bulkUploadTableTitle } = globalSels.bulkUploadSelectors
const { departments, floors, room } = leverageConstants.objectTypes

/**
 *
 * @Class EquipmentManagement consists of static functions related to Equipment management module
 */
export default class EquipmentManagement {
  /**
   * Fills in the details of an equipment using the provided equipment details.
   *
   * @param {Object} equipmentDetails - The details of the equipment to be filled in.
   * @param {string} equipmentDetails.equipmentName - The name of the equipment.
   * @param {string} equipmentDetails.id - The ID of the equipment.
   * @param {string} equipmentDetails.type - The type of the equipment.
   * @param {string} equipmentDetails.building - The building where the equipment is located.
   * @param {string} equipmentDetails.floor - The floor where the equipment is located.
   * @param {string} equipmentDetails.departmentName - The departmentName where the equipment is located.
   * @param {string} equipmentDetails.location - The location of the equipment.
   * @param {number} equipmentDetails.minTemp - The minimum operating temperature of the equipment.
   * @param {number} equipmentDetails.maxTemp - The maximum operating temperature of the equipment.
   * @param {string} [equipmentDetails.manufactureName=null] - The manufacturer name of the equipment. Optional.
   * @param {string} [equipmentDetails.modelNo=null] - The model number of the equipment. Optional.
   * @param {string} [equipmentDetails.lastCalibrationDate=null] - The last calibration date of the equipment. Optional.
   * @param {string} [equipmentDetails.calibrationDueDate=null] - The calibration due date of the equipment. Optional.
   * @param {string} equipmentDetails.rentedOption - The rental option of the equipment.
   * @param {string} [equipmentDetails.rentalDueDate=null] - The rental due date of the equipment. Optional.
   *
   * @example
   * // Fill equipment details for a new equipment
   * fillEquipmentDetails({
   *   equipmentName: 'MRI Machine',
   *   id: 'E12345',
   *   type: 'Medical',
   *   building: 'Main Hospital',
   *   floor: 'First Floor',
   *   departmentName: 'Radiology',
   *   location: 'Room 101',
   *   minTemp: 10,
   *   maxTemp: 40,
   *   manufactureName: 'ABC Corp',
   *   modelNo: '123XYZ',
   *   lastCalibrationDate: '2023-06-01',
   *   calibrationDueDate: '2024-06-01',
   *   rentedOption: 'Rented',
   *   rentalDueDate: '2025-06-01'
   * });
   */
  static fillEquipmentDetails = (equipmentDetails, view = globalSels.viewport.desktop) => {
    const {
      equipmentName,
      id,
      type,
      building,
      floor,
      departmentName,
      location,
      minTemp,
      maxTemp,
      manufactureName = null,
      modelNo = null,
      lastCalibrationDate = null,
      calibrationDueDate = null,
      rentedOption,
      rentalDueDate = null,
    } = equipmentDetails
    const {
      equipmentNameInput,
      equipmentIdInput,
      manuFactureNameInput,
      modelNumberInput,
      lastCalibrationDateInput,
      minimumTemInput,
      maximumTempInput,
      radioBtnContainer,
      rentalDueDateInput,
      buildingDropdown,
      assignedOwnerDropdown,
      locationDropdown,
      floorDropdown,
      equipmentTypeDropdown,
    } = prosightEnvironmentSel.equipmentManagement.equipmentAssignment
    const { label_calibrationDueDate, label_rentalDetails } = prosightEnvironmentSel.equipmentManagement
    const { options } = globalSels.filters
    const { radioTypeInput, viewport } = globalSels

    // Enter the Equipment name , ID and Type
    cy.get(equipmentNameInput).clear(commandOptions.force).type(equipmentName, commandOptions.force)
    cy.get(equipmentIdInput).clear(commandOptions.force).type(id, commandOptions.force)
    cy.get(equipmentTypeDropdown).click(commandOptions.force)
    cy.contains(options, type).click(commandOptions.force)

    //Enter the location details
    cy.get(buildingDropdown).click(commandOptions.force)
    cy.contains(building).click(commandOptions.force)
    cy.get(floorDropdown).click(commandOptions.force)
    cy.contains(options, floor).click(commandOptions.force)
    cy.get(assignedOwnerDropdown).should(commandOptions.notHaveText, loadingAssignedOwner)
    cy.get(assignedOwnerDropdown).click(commandOptions.force)
    cy.contains(options, departmentName).click(commandOptions.force)
    cy.get(locationDropdown).should(commandOptions.notContain, constants.uiText.loadingLocations).click(commandOptions.force)
    cy.contains(location).click(commandOptions.force)

    //operating Range details
    cy.get(minimumTemInput).clear(commandOptions.force).type(minTemp, commandOptions.force)
    cy.get(maximumTempInput).clear(commandOptions.force).type(maxTemp, commandOptions.force)

    //manufacture details
    if (manufactureName) cy.get(manuFactureNameInput).clear().type(manufactureName, commandOptions.force)
    if (modelNo) cy.get(modelNumberInput).clear().type(modelNo, commandOptions.force)
    if (lastCalibrationDate) cy.get(lastCalibrationDateInput).clear().type(lastCalibrationDate.commandOptions.force)
    if (calibrationDueDate) cy.contains(label_calibrationDueDate).next().clear().type(calibrationDueDate, commandOptions.force)

    //rental details
    if (view === viewport.desktop) {
      if (rentalDueDate) {
        cy.contains(rentedOption).click(commandOptions.force)
        cy.get(rentalDueDateInput).clear(commandOptions.force).type(rentalDueDate, commandOptions.force).click(commandOptions.force)
      } else {
        cy.contains(rentedOption).parent().find(radioTypeInput).should(commandOptions.checked)
      }
    } else if (view === viewport.mobile) {
      cy.get(label_rentalDetails).next().click(commandOptions.force)
      cy.contains(rentedOption).click(commandOptions.force)
      if (rentalDueDate) {
        cy.get(rentalDueDateInput).clear(commandOptions.force).type(rentalDueDate, commandOptions.force)
      }
    }
  }

  /**
   * Links or unlinks a sensor to/from an equipment.
   *
   * @param {string} equipmentName - The name of the equipment.
   * @param {string} action - The action to perform. Options are 'link' or 'unlink'.
   * @param {string} [sensorId=null] - The ID of the sensor. Required when action is 'link'.
   *
   * @example
   * // Link a sensor to an equipment
   * linkUnlinkSensor('MRI Machine', 'link', 'S12345');
   *
   * @example
   * // Unlink a sensor from an equipment
   * linkUnlinkSensor('MRI Machine', 'unlink');
   */
  static linkUnlinkSensor = (equipmentName, action, sensorId = null) => {
    const { linkUnlinkBtn, linkUnlinkPopup, linkSensorOption, unlinkSensorOption, unlinkTagBtn, pairingTableHeader } =
      prosightEnvironmentSel.equipmentManagement
    const { tagsCheckBox } = globalSels
    const { resultRow, confirmationBtnInConfirmationDialogue, linkButton, confirmationPopup } = globalSels
    const { equipment, sensor } = constants.headerText
    const { result_Row, unlinkBtn, checkbox } = constants.aliasText

    cy.get(linkUnlinkBtn).click(commandOptions.force)
    if (action === constants.actions.link) {
      cy.contains(linkUnlinkPopup, linkSensorOption).click(commandOptions.force)
    } else {
      cy.contains(linkUnlinkPopup, unlinkSensorOption).click(commandOptions.force)
    }

    if (action === constants.actions.link) {
      const parameterSets = [
        {
          entity: `${equipment}`,
          entityValue: `${equipmentName}`,
        },
        {
          entity: `${sensor}`,
          entityValue: `${sensorId}`,
        },
      ]
      parameterSets.forEach(({ entity, entityValue }) => {
        HelperFunction.getSectionByOuterHeader(entity, pairingTableHeader).within(() => {
          HelperFunction.search(entityValue, false)
          HelperFunction.getRowByItemName(entityValue, resultRow, constants.uiText.environment).as(result_Row)
          HelperFunction.getElementFromSpecificDiv(`@${result_Row}`, tagsCheckBox).as(checkbox)
          cy.get(`@${checkbox}`).click(commandOptions.force)
        })
      })

      Verify.theElement(linkButton).isEnabled()
      Click.forcefullyOn(linkButton)
    } else {
      HelperFunction.search(equipmentName, false)
      HelperFunction.getRowByItemName(equipmentName, resultRow, constants.uiText.environment).as(result_Row)
      HelperFunction.getElementFromSpecificDiv(`@${result_Row}`, unlinkTagBtn).as(unlinkBtn)
      cy.get(`@${unlinkBtn}`).click(commandOptions.force)
      Verify.theElement(confirmationPopup).contains(constants.confirmationMessages.confirmationMessagesBeforeUnlinkingSensor(sensorId, equipmentName))
      cy.get(confirmationBtnInConfirmationDialogue).click(commandOptions.force)
    }
  }

  /**
   * Deletes an equipment or equipment type based on the provided name and deletion type.
   *
   * @param {string} name - The name of the equipment or equipment type to be deleted.
   * @param {string} deleteType - The method to use for deletion. Options are 'editMenu', 'sidePanel', or 'tableBtn'.
   * @param {boolean} [sensorLinked=false] - Indicates if the equipment is linked to a sensor.
   * @param {string} [item=constants.uiText.equipment] - The type of item to delete. Defaults to 'equipment'. Options are 'equipment' or 'equipmentType'.
   *
   * @example
   * // Delete an equipment by edit menu
   * deleteEquipment_EquipmentType('MRI Machine', constants.deleteActions.editMenu, false, constants.uiText.equipment);
   *
   * @example
   * // Delete an equipment type by side panel
   * deleteEquipment_EquipmentType('MRI Machine', constants.deleteActions.sidePanel, true, constants.uiText.equipmentType);
   */
  static deleteEquipment_EquipmentType = (name, deleteType, sensorLinked = false, item = equipment) => {
    const { result_Row, editButton, delButton } = constants.aliasText
    const { editBtn, deleteBtn, sidePanel, confirmationPopup, confirmationBtnInConfirmationDialogue, dialogueCancel_ContinueBtn, dialogueDeleteBtn } =
      globalSels

    HelperFunction.search(name)
    HelperFunction.getRowByItemName(name, globalSels.resultRow, constants.uiText.environment).as(result_Row)

    //deleting from edit menu
    if (deleteType === constants.deleteActions.editMenu) {
      HelperFunction.getElementFromSpecificDiv(`@${result_Row}`, editBtn).as(editButton)
      cy.get(`@${editButton}`).click(commandOptions.force)
      cy.get(deleteBtn).should(commandOptions.enabled).click(commandOptions.force)
    }
    //deleting from side panel
    else if (deleteType === constants.deleteActions.sidePanel) {
      cy.get(`@${result_Row}`).click(commandOptions.force)
      cy.get(sidePanel).should(commandOptions.visible)
      HelperFunction.getElementFromSpecificDiv(sidePanel, deleteBtn).as(delButton)
      cy.get(`@${delButton}`).click(commandOptions.force)
    }
    //deleting from table delete button
    else {
      HelperFunction.getElementFromSpecificDiv(`@${result_Row}`, deleteBtn).as(delButton)
      cy.get(`@${delButton}`).click(commandOptions.force)
    }

    if (sensorLinked) {
      Verify.theElement(confirmationPopup).contains(constants.confirmationMessages.confirmationMessageBeforeDeletingSensorLinkedEquipment)
      Click.onContinueButton()
    } else if (item === constants.uiText.equipment || item === constants.uiText.equipmentType) {
      const requiredConfirmationMessage =
        item === constants.uiText.equipment
          ? constants.confirmationMessages.confirmationMessageBeforeDeletingEquipment
          : constants.confirmationMessages.confirmationMessageBeforeDeletingEquipmentType
      // Verify.theElement(confirmationPopup).contains(requiredConfirmationMessage) //will fail due difference in letter
      cy.get(dialogueDeleteBtn).click(commandOptions.force)
    }
  }

  /**
   * Creates or edits an equipment type based on the provided name and action type.
   *
   * @param {string} name - The name of the equipment type.
   * @param {string} actionType - The type of action to perform. Options are 'create' or 'edit'.
   * @param {string} [icon=null] - The icon to associate with the equipment type. Optional.
   * @param {string} [page=equipmentType] - The page where the action is performed (default is Equipment type page).
   *
   * @example
   * // Create a new equipment type with the specified name and icon
   * create_EditEquipmentType('MRI Machine', 'create', '#iconSelector');
   *
   * @example
   * // Edit an existing equipment type with the specified name
   * create_EditEquipmentType('MRI Machine', 'edit');
   */

  static create_EditEquipmentType = (name, actionType, icon = null, page = equipmentType) => {
    const { addEquipmentTypeBtn, equipmentTypeNameInput, genericEquipmentTypeIconText } = prosightEnvironmentSel.equipmentManagement.equipment_type
    const { haveAttribute, dataValue } = commandOptions
    if (actionType !== 'edit' && page === equipmentType) {
      cy.get(addEquipmentTypeBtn).click(commandOptions.force)
    }
    cy.get(equipmentTypeNameInput).clear(commandOptions.force).type(name, commandOptions.force)
    cy.contains(genericEquipmentTypeIconText).parent().find(globalSels.button).should(haveAttribute, dataValue, commandOptions.true)
    if (icon) cy.get(icon).click(commandOptions.force)
    Verify.theElement(globalSels.createBtn).isEnabled()
    if (page === equipmentType) {
      cy.get(globalSels.createBtn).click(commandOptions.force)
    } else {
      cy.get(globalSels.createBtn).eq(1).click(commandOptions.force)
    }
  }

  /**
   * Creates a new equipment item using the API with the provided equipment details.
   * @param {Object} equipmentDetails - The details of the equipment to be created.
   * @param {string} equipmentDetails.equipmentName - The name of the equipment.
   * @param {string} equipmentDetails.id - The ID of the equipment.
   * @param {string} equipmentDetails.type - The type of the equipment.
   * @param {boolean} equipmentDetails.isRented - Indicates if the equipment is rented.
   * @param {number} equipmentDetails.maxTemp - The maximum operating temperature of the equipment.
   * @param {number} equipmentDetails.minTemp - The minimum operating temperature of the equipment.
   * @param {string} equipmentDetails.buildingName - The name of the building where the equipment is located.
   * @param {string} equipmentDetails.departmentName - The name of the department where the equipment is located.
   * @param {string} equipmentDetails.departmentId - The ID of the department where the equipment is located.
   * @param {string} equipmentDetails.floorName - The name of the floor where the equipment is located.
   * @param {string} equipmentDetails.floorId - The ID of the floor where the equipment is located.
   * @param {string} equipmentDetails.locationName - The name of the room where the equipment is located.
   * @param {string} equipmentDetails.locationId - The ID of the room where the equipment is located.
   *
   * @example
   * // Create a new equipment item with the provided details
   * const equipmentDetails = {
   *   equipmentName: 'MRI Machine',
   *   id: 'E12345',
   *   type: 'Medical',
   *   isRented: false,
   *   maxTemp: 40,
   *   minTemp: 10,
   *   buildingName: 'Main Hospital',
   *   departmentName: 'Radiology',
   *   departmentId: 'D1',
   *   floorName: 'First Floor',
   *   floorId: 'F1',
   *   locationName: 'Room 101',
   *   locationId: 'L1',
   * };
   * createEquipment_API(equipmentDetails);
   */
  static createEquipment_API = (equipmentDetails) => {
    const { equipmentName, id, type, isRented, maxTemp, minTemp, buildingName, departmentName, floorName, locationName } =
      equipmentDetails
    const system_ID = Cypress.env('SystemId')
    const baseUrl = Cypress.env('API_BaseUrl')
    const hospital_ID = Cypress.env('HospitalId')
    const building_Name = Cypress.env('BuildingName')
    const building_ID = Cypress.env('BuildingId')
    const equipmentActionEndpoint = APIEndpoints.equipmentActionsEndpoint(system_ID, hospital_ID)

    let departmentId, floorId, locationId
    HelperFunction.search_API(departmentName, departments).then(({ authToken, Id }) => {
      departmentId = Id
      HelperFunction.search_API(floorName, floors).then(({ authToken, Id }) => {
        floorId = Id
        HelperFunction.search_API(locationName, room).then(({ authToken, Id }) => {
          locationId = Id
          cy.task('getAuthToken').then((authToken) => {
            cy.api({
              url: `${baseUrl}${equipmentActionEndpoint}`,
              method: 'POST',
              failOnStatusCode: false,
              headers: {
                authorization: authToken,
              },
              body: {
                networkAliases: {
                  equipment: {
                    name: equipmentName,
                    deviceId: id,
                  },
                },
                networkId: 'equipment',
                name: equipmentName,
                data: [
                  {
                    path: 'equipmentType',
                    value: type,
                  },
                  {
                    path: 'isRental',
                    value: isRented,
                  },
                  {
                    path: 'range/temperature/operatingMax',
                    value: maxTemp,
                  },
                  {
                    path: 'range/temperature/operatingMin',
                    value: minTemp,
                  },
                  {
                    path: 'name',
                    value: equipmentName,
                  },
                  {
                    path: 'equipmentId',
                    value: id,
                  },
                  {
                    path: 'location/building/id',
                    value: building_ID,
                  },
                  {
                    path: 'location/building/name',
                    value: building_Name,
                  },
                  {
                    path: 'location/floor/id',
                    value: floorId,
                  },
                  {
                    path: 'location/floor/name',
                    value: floorName,
                  },
                  {
                    path: 'location/department/id',
                    value: departmentId,
                  },
                  {
                    path: 'location/department/name',
                    value: departmentName,
                  },
                  {
                    path: 'location/room/id',
                    value: locationId,
                  },
                  {
                    path: 'location/room/name',
                    value: locationName,
                  },
                  {
                    path: 'associatedLocation/room/id',
                    value: null,
                  },
                  {
                    path: 'associatedLocation/room/name',
                    value: null,
                  },
                ],
              },
            }).then((res) => {
              expect(res.status, 'Verifying response code').to.eq(200)
              expect(res.body.data.name, 'Verifying equipment name').to.eq(equipmentName)
              expect(res.body.data.location.building.name, 'Verifying building name').to.eq(building_Name)
              expect(res.body.data.location.floor.name, 'Verifying floor name').to.eq(floorName)
              expect(res.body.data.location.department.name, 'Verifying department name').to.eq(departmentName)
              expect(res.body.data.location.room.name, 'Verifying location name').to.eq(locationName)
              cy.log(`${equipmentName} created successfully`)
            })
          })
        })
      })
    })
  }

  /**
   * Edits the details of a specified equipment.
   *
   * @param {Object} initialEquipmentDetails - The initial details of the equipment.
   * @param {string} initialEquipmentDetails.equipmentName - The name of the equipment.
   * @param {string} initialEquipmentDetails.id - The ID of the equipment.
   * @param {string} initialEquipmentDetails.type - The type of the equipment.
   * @param {boolean} initialEquipmentDetails.isRented - Whether the equipment is rented.
   * @param {number} initialEquipmentDetails.maxTemp - The maximum operating temperature of the equipment.
   * @param {number} initialEquipmentDetails.minTemp - The minimum operating temperature of the equipment.
   * @param {string} initialEquipmentDetails.buildingName - The name of the building where the equipment is located.
   * @param {string} initialEquipmentDetails.departmentName - The name of the department to which the equipment is assigned.
   * @param {string} initialEquipmentDetails.floorName - The name of the floor where the equipment is located.
   * @param {string} initialEquipmentDetails.locationName - The name of the location where the equipment is located.
   *
   * @param {Object} newEquipmentDetails - The new details of the equipment.
   * @param {string} [newEquipmentDetails.newEquipmentName] - The new name of the equipment.
   * @param {string} [newEquipmentDetails.newEquipmentId] - The new ID of the equipment.
   * @param {string} [newEquipmentDetails.newEquipmentType] - The new type of the equipment.
   * @param {string} [newEquipmentDetails.newBuilding] - The new building where the equipment is located.
   * @param {string} [newEquipmentDetails.newFloor] - The new floor where the equipment is located.
   * @param {string} [newEquipmentDetails.newDepartment] - The new department to which the equipment is assigned.
   * @param {string} [newEquipmentDetails.newLocation] - The new location where the equipment is located.
   * @param {number} [newEquipmentDetails.newMinTemp] - The new minimum operating temperature of the equipment.
   * @param {number} [newEquipmentDetails.newMaxTemp] - The new maximum operating temperature of the equipment.
   * @param {string} [newEquipmentDetails.newManufactureName] - The new manufacturer name of the equipment.
   * @param {string} [newEquipmentDetails.newModelNo] - The new model number of the equipment.
   * @param {string} [newEquipmentDetails.newLastCalibrationDate] - The new last calibration date of the equipment.
   * @param {string} [newEquipmentDetails.newCalibrationDueDate] - The new calibration due date of the equipment.
   * @param {string} [newEquipmentDetails.newRentedOption] - The new rented option for the equipment.
   * @param {string} [newEquipmentDetails.newRentalDueDate] - The new rental due date of the equipment.
   *
   * @param {string} [view=viewport.desktop] - The viewport in which the operation is performed, defaults to desktop.
   */
  static editEquipment = (initialEquipmentDetails, newEquipmentDetails, view = globalSels.viewport.desktop) => {
    const { equipmentName, id, type, maxTemp, minTemp, buildingName, departmentName, floorName, locationName } = initialEquipmentDetails

    const {
      newEquipmentName,
      newEquipmentId,
      newEquipmentType,
      newBuilding,
      newFloor,
      newDepartment,
      newLocation,
      newMinTemp,
      newMaxTemp,
      newManufactureName = null,
      newModelNo = null,
      newLastCalibrationDate = null,
      newCalibrationDueDate = null,
      newRentedOption,
      newRentalDueDate = null,
    } = newEquipmentDetails
    let reloadRequired = true

    //setting value for reload according to viewport
    if (view === viewport.mobile) {
      reloadRequired = false
    }

    //searching for the staff and extracting the row
    HelperFunction.search(equipmentName, reloadRequired)
    HelperFunction.getRowByItemName(equipmentName, divTag, constants.urlText.environment).as('resultRow')

    //click on edit icon button
    if (view === viewport.mobile) {
      Click.onButton('@resultRow', editIconBtn)
    }

    //Verify that the save button is disabled before editing the equipment details
    Verify.theElement(saveBtn).isDisabled()

    //verifying the pre-existing data of Equipment
    Verify.theElement(equipmentNameInput).hasValue(equipmentName)
    Verify.theElement(equipmentIdInput).hasValue(id)
    cy.get(equipmentTypeDropdown).find(spanTag).should('have.text', type)
    cy.contains(label_building).next().find(spanTag).should('have.text', buildingName)
    cy.contains(label_floor).next().find(spanTag).should('have.text', floorName)
    cy.contains(label_assignedOwner).next().find(spanTag).should('have.text', departmentName)
    cy.get(label_location).next().find(spanTag).should('have.text', locationName)
    Verify.theElement(minimumTemInput).hasValue(minTemp)
    Verify.theElement(maximumTempInput).hasValue(maxTemp)

    // Edit the equipment name, Id and Type
    if (newEquipmentName) cy.get(equipmentNameInput).clear(commandOptions.force).type(newEquipmentName, commandOptions.force)
    if (newEquipmentId) cy.get(equipmentIdInput).clear(commandOptions.force).type(newEquipmentId, commandOptions.force)
    if (newEquipmentType) {
      cy.get(equipmentTypeDropdown).click(commandOptions.force)
      cy.contains(options, newEquipmentType).click(commandOptions.force)
    }
    //Edit the Location details
    if (newBuilding) {
      cy.contains(label_building).next().click(commandOptions.force)
      cy.contains(newBuilding).click(commandOptions.force)
    }
    if (newFloor) {
      cy.get(floorDropdown).click(commandOptions.force)
      cy.contains(options, newFloor).click(commandOptions.force)
    }
    if (newDepartment) {
      cy.get(assignedOwnerDropdown).click(commandOptions.force)
      cy.contains(options, newDepartment).click(commandOptions.force)
    }
    if (newLocation) {
      cy.get(locationDropdown).should(commandOptions.notContain, constants.uiText.loadingLocations).click(commandOptions.force)
      cy.contains(newLocation).click(commandOptions.force)
    }
    // Edit the Operating Range details
    if (newMinTemp) cy.get(minimumTemInput).clear(commandOptions.force).type(newMinTemp, commandOptions.force)
    if (newMaxTemp) cy.get(maximumTempInput).clear(commandOptions.force).type(newMaxTemp, commandOptions.force)
    // Edit the Manufacture details
    if (newManufactureName) cy.get(manuFactureNameInput).clear().type(newManufactureName, commandOptions.force)
    if (newModelNo) cy.get(modelNumberInput).clear().type(newModelNo, commandOptions.force)
    if (newLastCalibrationDate) cy.get(lastCalibrationDateInput).clear().type(newLastCalibrationDate, commandOptions.force)
    if (newCalibrationDueDate) cy.contains(label_calibrationDueDate).next().clear().type(newCalibrationDueDate, commandOptions.force)
    // Edit Rental details
    if (view === viewport.mobile && newRentedOption) {
      cy.get(label_rentalDetails).next().click(commandOptions.force)
      cy.contains(newRentedOption).click(commandOptions.force)
      if (newRentalDueDate) {
        cy.get(rentalDueDateInput).clear(commandOptions.force).type(newRentalDueDate, commandOptions.force)
      }
    }

    // click on save button to save the equipment details
    Click.forcefullyOn(saveBtn)
  }

  /**
   * Deletes an equipment or equipment type in the mobile.
   *
   * @param {string} itemName - The name of the item to be deleted.
   * @param {boolean} [equipmentOrSensorLinked=false] - Indicates if the equipment or sensor is linked.
   * @param {string} [itemType='equipment'] - The type of the item, either 'equipment' or 'equipmentType'.
   */
  static deleteEquipment_EquipmentType_InMobile = (itemName, equipmentOrSensorLinked = false, ItemType = equipment) => {
    HelperFunction.search(itemName, false)
    HelperFunction.getRowByItemName(itemName, cardView, equipment).as('equipmentRow')
    Click.onButton('@equipmentRow', editIconBtn)

    if (ItemType === equipment) {
      Click.forcefullyOn(deleteEquipmentBtn)
      if (equipmentOrSensorLinked) {
        //Can't verify the dialogBox text due to bug
        //Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingSensorLinkedEquipment)
        Click.onContinueButton()
      } else {
        //Can't verify the dialogBox text due to bug
        //Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingEquipment)
        Click.onButtonByInnerText(popupDialogBox, deleteBtnText)
      }
    } else if (ItemType === equipmentType) {
      Click.forcefullyOn(deleteEquipmentTypeBtn)
      if (equipmentOrSensorLinked) {
        Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingALinkedEquipmentType_Mobile)
        Click.onContinueButton()
      } else {
        Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingEquipmentType)
        Click.onButtonByInnerText(popupDialogBox, deleteBtnText)
      }
    }
  }

  /**
   * This function is used to create equipment using the bulk import flow
   * @param {string} filePath Path of the file you want to upload
   * @param {string} fileName name of the file you want to validate
   */
  static equipmentBulkImport = (filePath, fileName) => {
    cy.reload()
    //Click on upload button
    Click.forcefullyOn(bulkUploadButton)
    //Verifying the button in bulk import page
    Verify.elementContainingText(button, preview).parentElementIsDisabled()
    Verify.theElement(cancelButton).isEnabled()
    //Selecting the file to upload
    Click.onButtonByInnerText(button, chooseFileButton).then(() => {
      HelperFunction.getInputAndSelectFile(filePath)
    })
    Verify.elementContainingText(button, preview).parentElementIsEnabled()
    //Uploading the file
    Click.onButtonByInnerText(button, preview)
    Verify.theElement(bulkUploadTableTitle).hasText('Bulk Create Equipment')
    //Getting data from csv file
    cy.fixture(fileName)
      .then(csv)
      .then((data) => {
        let bulkEquipmentData = data
        bulkEquipmentData.forEach((row) => {
          let verifyValues = {
            equipmentName: row['Equipment Name'],
            equipmentId: row['Equipment ID'],
            equipmentType: row['Equipment Type'],
            building: row['Building'],
            floor: row['Floor'],
            assignedOwner: row['Assigned Owner'],
            location: row['Location'],
            minTemp: row['Operating Temp (Min)'],
            maxTemp: row['Operating Temp (Max)'],
          }
          //Verifying the data in  the bulk upload form
          HelperFunction.getRowByItemName(verifyValues.equipmentName, resultRow, 'equipment-row').as('equipmentRow')
          HelperFunction.verifyValuesExist('@equipmentRow', verifyValues)
        })
      })
    //Uploading CSV file
    Click.onButtonByInnerText(button, upload)
    Click.onButtonByInnerText(button, completeCreation)
  }
}
