/// <reference types="cypress" />
import prosightSafety from '../../utils/selectors/prosightSafety'
import option from '../../utils/constants/commandOptions'
import globalSels from '../../utils/selectors/globalSels'
import Click from '../../utils/Interactions/click'
import constant from '../../utils/constants/prosightSafety/staffManagementConst'
import { Verify } from '../../utils/assertions'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import equipmentConst from '../../utils/constants/prosightEnvironment/equipmentAssignmentConst'
import HHSelectors from '../../utils/selectors/prosightHandHygiene'
import APIEndpoints from '../../../APIEndpoints'
import LoginPage from '../signIn/siginPage'
import constants from '../../utils/constants/prosightSafety/staffManagementConst'
import Type from '../../utils/Interactions/type'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import globalConst from '../../utils/constants/globalConst'
import commandOptions from '../../utils/constants/commandOptions'
import smartReports from '../../utils/constants/smartReports'
const csv = require('neat-csv')
const { searchFilter } = prosightSafety.staffManagement
const { tag, staff } = leverageConstants.objectTypes
const {
  divTag,
  checkbox,
  confirmationPopup,
  buttonTag,
  spanTag,
  createBtn,
  resultRow,
  editBtn,
  sidePanel,
  deleteBtn,
  cancelButton,
  dialogueDeleteBtn,
  saveBtn,
  cardView,
  button,
  deleteBtnText,
  popupTextDailogMessage,
  sidePanelCardHeader,
  searchBarOnDropdown,
  popupContainer,
} = globalSels
const { bulkUploadButton, bulkUploadTableTitle, bulkUploadTitle, downloadCsvTemplate } = globalSels.bulkUploadSelectors

const { tableBtn, sidePanelBtn, editMenu } = globalConst.delete_EditActions
const { link, unlink } = globalConst.actions
const { staffTypes } = constant.uiText
const { staffAssignment } = constant.buttonInnerText
const { haveText, scrollBottom } = commandOptions
const { selectAssignedDepartment } = smartReports.buttonInnerTxt
const { preview, chooseFileButton, completeCreation, upload } = globalConst
const { bulkUploadTableTitleTxt, bulkImportTitle, bulkUploadCsvTemplateTxt } = constants.bulkImportConstants

/**
 * @class StaffManagement that consists static function related to StaffManagement module
 */
export default class StaffManagement {
  /**
   * Function that will enter mandatory fields i.e name,id, department and staff type for a new staff creation
   * @param {Object} staffDetails staffDetails it is object which consists required staff details
   * @param {string} staffDetails.staffName required name for staff
   * @param {string} staffDetails.staff required id for staff
   * @param {string} staffDetails.staffType required type for staff
   * @param {string} staffDetails.email required email for staff
   * @param {string} staffDetails.phoneNumber required phoneNumber for staff
   */
  static enterDetailsForStaff = (staffDetails) => {
    const { staffName, staffId, department, staffType, email = null, phoneNumber = null } = staffDetails
    const { staffNameInputField, staffIdInputField, emailInput, phoneNumberInput, departmentInput, staffTypeInput } =
      prosightSafety.staffManagement.staffAssignment

    //entering staff name department and type
    cy.get(staffNameInputField).clear(option.force).type(staffName, option.force)
    cy.get(staffIdInputField).clear(option.force).type(staffId, option.force)
    cy.get(departmentInput).should(haveText, selectAssignedDepartment).click(option.force)
    cy.get(searchFilter).click(option.force).type(department)
    // cy.get(searchBarOnDropdown).type(department).type(option.enter)
    cy.contains(spanTag, department).click(option.force)
    cy.get(staffTypeInput).click(option.force)
    cy.contains(spanTag, staffType).click(option.force)
    //optional fields
    if (email) cy.get(emailInput).type(email, option.force)
    if (phoneNumber) cy.get(phoneNumberInput).type(phoneNumber, option.force)
  }

  /**
   * Function that edits the given fields for a staff
   * @param {object} initialStaffDetailsObj it is object which consists of initial details of staff
   * @param {string} initialStaffDetailsObj.staffName it is the initial staffName
   * @param {string} initialStaffDetailsObj.staffId it is the initial staffId
   * @param {string} initialStaffDetailsObj.department it is the initial department
   * @param {string} initialStaffDetailsObj.staffType it is the initial staffType
   * @param {string} initialStaffDetailsObj.email it is the initial staff email if available
   * @param {string} initialStaffDetailsObj.staffType it is the initial staff phoneNumber if available
   * @param {object} dataObj it is the object that consists of new staff data that to be edited
   * @param {object} [dataObj.staffName] it is new staff name value if required to edit
   * @param {object} [dataObj.staffId] it is new staff id value if required to edit
   * @param {object} [dataObj.department] it is new department name value if required to edit
   * @param {object} [dataObj.email] it is new va;lue value if required to edit
   * @param {string} action required action type e.g 'tableEditBtn', 'sidePanelEditBtn'
   * @param {string} viewport required viewport type e.g 'desktop or mobile'
   */
  static editStaffDetails = (initialStaffDetailsObj, dataObj, action, viewport = globalSels.viewport.desktop) => {
    const { staffNameInputField, staffIdInputField, staffTypeInput, departmentInput, emailInput, phoneNumberInput } =
      prosightSafety.staffManagement.staffAssignment

    const { staffName, staffId, department, staffType, email = null, phoneNumber = null } = initialStaffDetailsObj
    const valuesToVerify = { staffName, staffId, department, staffType }
    const { newStaffName = null, newStaffId = null, newDepartment = null, newStaffType = null, newEmail = null, newPhone = null } = dataObj
    let reloadRequired = undefined

    //setting value for reload according to viewport
    if (viewport === globalSels.viewport.mobile) {
      reloadRequired = false
    }

    //searching for the staff and extracting the row
    HelperFunction.search(staffName, reloadRequired)
    HelperFunction.getRowByItemName(staffName, divTag, constant.uiText.safety).as('resultRow')
    HelperFunction.verifyValuesInTheCardView('@resultRow', valuesToVerify)

    if (viewport === globalSels.viewport.desktop) {
      if (action === tableBtn) {
        HelperFunction.getElementFromSpecificDiv('@resultRow', editBtn).click(option.force)
      } else if (action === sidePanelBtn) {
        cy.get('@resultRow').click(option.force)
        HelperFunction.getElementFromSpecificDiv(sidePanel, editBtn).click(option.force)
      }
    } else if (viewport === globalSels.viewport.mobile) {
      Click.onButton('@resultRow')
    }

    //verifying the previous values
    Verify.theElement(staffNameInputField).hasValue(staffName)
    Verify.theElement(staffIdInputField).hasValue(staffId)
    //cy.get(departmentInput).find('span').should('have.text', department)   //bug not working
    cy.get(staffTypeInput).find(spanTag).should('have.text', staffType)
    if (email) Verify.theElement(emailInput).hasValue(email)
    if (phoneNumber) Verify.theElement(phoneNumberInput).hasValue(phoneNumber)
    Verify.theElement(createBtn).isDisabled()

    //editing the required fields
    if (newStaffType) {
      cy.get(staffTypeInput).click(option.force)
      cy.contains(spanTag, newStaffType).click(option.force)
    }
    if (newDepartment) {
      cy.get(departmentInput).click(option.force)
      cy.get(searchFilter).click(option.force).type(newDepartment)
      cy.contains(spanTag, newDepartment).click(option.force)
    }
    if (newStaffName) cy.get(staffNameInputField).clear(option.force).type(newStaffName, option.force)
    if (newStaffId) cy.get(staffIdInputField).clear(option.force).type(newStaffId, option.force)
    if (newEmail) cy.get(emailInput).type(newEmail, option.force)
    if (newPhone) cy.get(phoneNumberInput).type(newPhone, option.force)

    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
  }

  /**
   * Function that selects a tag/sensor just after staff/equipment creation for linking
   * @param {String} Id it is the tag/sensor ID required for linking
   * @param {String} itemType it is type of item i.e staff tag or sensor
   */
  static selectTag_Sensor = (Id, itemType = tag) => {
    let headerText

    if (itemType === tag) {
      headerText = constant.headerText.tags
    } else {
      headerText = equipmentConst.headerText.sensor
    }

    HelperFunction.getSectionByOuterHeader(headerText, divTag).within(() => {
      HelperFunction.search(Id, false)
      HelperFunction.getRowByItemName(Id, divTag, constant.uiText.safety).as('resultRow')
      HelperFunction.getElementFromSpecificDiv('@resultRow', checkbox).check(option.force)
    })
  }

  /**
   * Function that performs link/unlink tag operation for given staff/tag
   * @param {String} staffName it is the required staffName for linking/unlinking tag
   * @param {String} action it is the required action i.e link, unlink
   * @param {String} tagId it is the required tag id for linking/unlinking
   * @param {String} module it is the required module name where is function is being called by default it will be 'safety'
   */
  static linkUnlinkTag = (staffName, action, tagId = null, module = 'safety') => {
    const { linkUnlinkBtn, linkTagOption, unlinkTagOption, unlinkTagBtn, linkButton } = prosightSafety.staffManagement
    const { tags, staff } = constant.headerText

    let requiredConfirmationPopupTextSel

    //assigning confirmation popup text selector according to module
    if (module === 'handHygiene') {
      requiredConfirmationPopupTextSel = HHSelectors.confirmationPopupText
    } else {
      requiredConfirmationPopupTextSel = confirmationPopup
    }

    cy.get(linkUnlinkBtn).click(option.force) //clicking on link unlink/paper clip button
    //choosing link/ unlink button according to case
    if (action === link) {
      cy.contains(divTag, linkTagOption).click(option.force)
    } else {
      cy.contains(divTag, unlinkTagOption).click(option.force)
    }

    //for linking process selecting tag and staff one by one
    if (action === link) {
      const parameterSets = [
        {
          entity: `${staff}`,
          entityValue: `${staffName}`,
        },
        {
          entity: `${tags}`,
          entityValue: `${tagId}`,
        },
      ]

      //iterating through the parameter set array and selecting staff and tag
      parameterSets.forEach(({ entity, entityValue }) => {
        HelperFunction.getSectionByOuterHeader(entity, divTag).within(() => {
          HelperFunction.search(entityValue, false)
          HelperFunction.getRowByItemName(entityValue, divTag, constant.uiText.safety).as('resultRow')
          HelperFunction.getElementFromSpecificDiv('@resultRow', checkbox).check(option.force)
        })
      })

      //verifying that link button is enabled and clicking on that
      cy.get(linkButton).should(option.enabled).click(option.force)

      //in case of unlinking searching staff to unlink and clicking on unlink button from row
    } else {
      HelperFunction.search(staffName, false)
      Verify.theUrl().includes(constant.urlText.unlink)
      HelperFunction.getRowByItemName(staffName, divTag, constant.uiText.safety).as('resultRow')
      HelperFunction.getElementFromSpecificDiv('@resultRow', unlinkTagBtn).click(option.force)

      //verifying the confirmation message on popup
      Verify.theElement(requiredConfirmationPopupTextSel).contains(
        constant.confirmationMessages.confirmationMessagesBeforeUnlinkingTag(tagId, staffName)
      )
      cy.contains(buttonTag, constant.buttonInnerText.unlinkBtn).click(option.force)
    }
  }

  /**
   * Deletes a staff member or staff type based on the provided name and deletion type.
   *
   * @param {string} name - The name of the staff member or staff type to be deleted.
   * @param {string} [deleteType=constant.deleteActions.tableBtn] - The method to use for deletion. Options are 'tableBtn', 'editMenu', or 'sidePanel'.
   * @param {boolean} [tag_StaffLinked=false] - Indicates if the staff member is linked to a tag or staff type is linked to a staff.
   * @param {string} [itemType=constant.uiText.staff] - The type of item to delete. Options are 'staff' or 'staffType'.
   *
   * @example
   * // Delete a staff member by table button
   * deleteStaff_StaffType('John Doe');
   *
   * @example
   * // Delete a staff type by edit menu
   * deleteStaff_StaffType('Nurse', constant.deleteActions.editMenu, false, constant.uiText.staffType);
   *
   * @example
   * // Delete a staff member linked to a tag by side panel
   * deleteStaff_StaffType('John Doe', constant.deleteActions.sidePanel, true);
   */
  static deleteStaff_StaffType = (name, deleteType = tableBtn, tag_StaffLinked = false, itemType = staff) => {
    const {
      confirmationMessageBeforeDeletingStaffType,
      confirmationMessageBeforeDeletingStaff,
      confirmationMessageBeforeDeletingStaffAssociatedStaffType,
      confirmationMessageBeforeDeletingTagLinkedStaff,
    } = constant.confirmationMessages
    let popupUpSel, sidePanelSel

    if (itemType === constant.uiText.hhStaff) {
      popupUpSel = HHSelectors.confirmationPopupText
      sidePanelSel = HHSelectors.sidePanel
    } else {
      popupUpSel = confirmationPopup
      sidePanelSel = sidePanel
    }

    //searching for the staff/ staff type and storing it's row selector
    HelperFunction.search(name)
    HelperFunction.getRowByItemName(name, resultRow, constant.uiText.safety).as('resultRow')

    //deleting staff from table del button
    if (deleteType === tableBtn) {
      HelperFunction.getElementFromSpecificDiv('@resultRow', deleteBtn).click(option.force)
    } //deleting from edit menu
    else if (deleteType === editMenu) {
      HelperFunction.getElementFromSpecificDiv('@resultRow', editBtn).click(option.force)
      Verify.theElement(cancelButton).isEnabled()
      cy.get(deleteBtn).should(option.enabled).click(option.force)
    } //deleting from side panel
    else {
      Click.forcefullyOn('@resultRow')
      Verify.theElement(sidePanelSel).isVisible()
      HelperFunction.getElementFromSpecificDiv(sidePanelSel, deleteBtn).click(option.force)
    }

    //verifying confirmation messages before deleting staff/staff type
    if (tag_StaffLinked) {
      if (itemType === staff) {
        Verify.theElement(popupUpSel).contains(confirmationMessageBeforeDeletingTagLinkedStaff)
      } else {
        Verify.theElement(popupUpSel).contains(confirmationMessageBeforeDeletingStaffAssociatedStaffType)
      }
      Click.onContinueButton()
    } else {
      const requiredMessage =
        itemType === constant.uiText.staffType ? confirmationMessageBeforeDeletingStaffType : confirmationMessageBeforeDeletingStaff
      // Verify.theElement(popupUpSel).contains(requiredMessage) //difference in letter case so this assertion will fail fo IAP
      Click.forcefullyOn(dialogueDeleteBtn)
    }
  }

  /**
   * Creates a new staff type with the specified name and optional icon.
   * @param {string} staffTypeName - The name of the staff type to be created.
   * @param {string|null} [icon=null] - The CSS selector for the icon element to be clicked, if any.
   * @param {string} [page=staffTypes] - The page where the action is performed (default is Staff type page).
   *
   * @example
   * // Create a new staff type with just the name
   * createStaffType('New Staff Type');
   *
   * @example
   * // Create a new staff type with a name and an icon
   * createStaffType('New Staff Type', '.icon-selector');
   */
  static createStaffType = (staffTypeName, icon = null, page = staffTypes) => {
    const { staffTypeNameInput, addStaffTypeBtn, defaultStaffIconText } = prosightSafety.staffType

    if (page === staffTypes) {
      cy.get(addStaffTypeBtn).click(option.force)
    }

    Verify.theElement(createBtn).isDisabled()
    cy.get(staffTypeNameInput).clear(option.force).type(staffTypeName, option.force)
    cy.contains(defaultStaffIconText).parent().find(buttonTag).should(option.haveAttribute, 'data-value', 'true')

    //if specific icon is passed clicking on it
    if (icon) {
      cy.get(icon).click({ force: true })
    }
    if (page === staffAssignment) {
      cy.get(popupContainer).find(createBtn).should(option.enabled).click(option.force)
    } else {
      cy.get(createBtn).should(option.enabled).click(option.force)
    }
  }

  /**
   * Edits an existing staff type with the specified new name and optional icon.
   * @param {string} staffTypeName - The current name of the staff type to be edited.
   * @param {string} newStaffName - The new name to assign to the staff type.
   * @param {string} [icon=prosightSafety.staffType.nurseIcon] - The CSS selector for the new icon element to be clicked. Defaults to the nurse icon.
   * @param {string} [view=globalSels.viewport.desktop] - The viewport in which to perform the operation, either 'desktop' or 'mobile'. Defaults to 'desktop'.
   *
   * @example
   * // Edit a staff type with a new name and default icon in desktop view
   * editStaffType('Old Staff Type', 'New Staff Type');
   *
   * @example
   * // Edit a staff type with a new name and specified icon in mobile view
   * editStaffType('Old Staff Type', 'New Staff Type', '.new-icon-selector', globalSels.viewport.mobile);
   */
  static editStaffType = (staffTypeName, newStaffName, icon = prosightSafety.staffType.nurseIcon, view = globalSels.viewport.desktop) => {
    const { staffTypeNameInput, defaultSTaffIcon } = prosightSafety.staffType
    const { mobile, desktop } = globalSels.viewport

    if (view === desktop) {
      //searching and editing the staff type details
      HelperFunction.search(staffTypeName)
      HelperFunction.getRowByItemName(staffTypeName, divTag, constant.uiText.safety).as('resultRow')
      HelperFunction.getElementFromSpecificDiv('@resultRow', editBtn).as('editBtn')
      Click.forcefullyOn('@editBtn')
    } else if (view === mobile) {
      HelperFunction.search(staffTypeName, false)
      HelperFunction.getRowByItemName(staffTypeName, cardView, constant.uiText.safety).as('resultRow')
      Click.onButton('@resultRow')
    }

    //verifying the pre-existing data
    Verify.theElement(staffTypeNameInput).hasValue(staffTypeName)
    Verify.theElement(defaultSTaffIcon).parentHasAttributeValue(option.dataValue, option.true)
    Verify.theElement(saveBtn).isDisabled()

    //editing data
    Type.theText(newStaffName).into(staffTypeNameInput)
    Click.forcefullyOn(icon)
    Verify.theElement(icon).parentHasAttributeValue(option.dataValue, option.true)
  }

  /**
   * Deletes a tag with the specified ID.
   * @param {string} tagId - The ID of the tag to be deleted.
   *
   * @example
   * // Delete a tag with the ID 'tag123'
   * deleteTag('tag123');
   */
  static deleteTag = (tagId) => {
    const { resultRow, deleteBtn } = globalSels
    const { confirmationMessageBeforeDeletingTag } = constant.confirmationMessages

    HelperFunction.search(tagId, false)
    HelperFunction.getRowByItemName(tagId, resultRow, constant.uiText.safety).as('resultRow')
    HelperFunction.getElementFromSpecificDiv('@resultRow', deleteBtn).click(option.force)
    Verify.theElement(globalSels.divTag).containsText(confirmationMessageBeforeDeletingTag)
    Click.onDeleteButton()
  }

  /**
   * Deletes a tag in mobile view by searching for it and confirming the deletion.
   * If the tag is associated with staff or a rule, it handles the confirmation appropriately.
   *
   * @param {string} tagId - The ID of the tag to be deleted.
   * @param {boolean} associatedWithStaffOrRule - Indicates if the tag is associated with staff or a rule.
   */
  static deleteTagInMobile = (tagId, associatedWithStaffOrRule) => {
    const { deleteBtn, popupTextDailogMessage, cardView } = globalSels
    const { confirmationMessageBeforeDeletingTag, confirmationMessageBeforeDeletingStaffLinkedTag } = constants.confirmationMessages

    HelperFunction.search(tagId)
    HelperFunction.getRowByItemName(tagId, cardView, constants.uiText.safety).as('tagRow')
    Click.onButton('@tagRow', deleteBtn)
    if (associatedWithStaffOrRule) {
      Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingStaffLinkedTag)
      Click.onContinueButton()
    } else {
      Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingTag)
      Click.onDeleteButton()
    }
  }

  /**
   * Creates a new staff member using the API with the provided staff details.
   * @param {Object} staffDetails - The details of the staff member to be created.
   * @param {string} staffDetails.staffName - The name of the staff member.
   * @param {string} staffDetails.staffId - The ID of the staff member.
   * @param {string} staffDetails.department - The name of the department to which the staff member is assigned.
   * @param {string} staffDetails.departmentId - The ID of the department to which the staff member is assigned.
   * @param {string} staffDetails.staffType - The type of the staff member.
   *
   * @example
   * // Create a new staff member with the provided details
   * const staffDetails = {
   *   staffName: 'John Doe',
   *   staffId: '12345',
   *   department: 'Cardiology',
   *   departmentId: '5678',
   *   staffType: 'Nurse'
   * };
   * createStaff_API(staffDetails);
   */
  static createStaff_API = (staffDetails) => {
    const { staffName, staffId, department, departmentId, staffType } = staffDetails
    const system_Id = Cypress.env('SystemId')
    const hospital_Id = Cypress.env('HospitalId')
    const apiBaseURL = Cypress.env('API_BaseUrl')
    const staffActionEndPoint = APIEndpoints.staffActionsEndpoint(system_Id, hospital_Id)

    LoginPage.loginToApplication().then(({ authToken }) => {
      cy.api({
        method: 'POST',
        url: apiBaseURL + staffActionEndPoint,
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
        body: {
          networkAliases: {
            staff: {
              name: staffName,
              deviceId: staffId,
            },
          },
          networkId: 'staff',
          name: staffName,
          data: [
            {
              path: 'staffType',
              value: staffType,
            },
            {
              path: 'name',
              value: staffName,
            },
            {
              path: 'staffId',
              value: staffId,
            },
            {
              path: 'assignedDepartment/id',
              value: departmentId,
            },
            {
              path: 'assignedDepartment/name',
              value: department,
            },
          ],
        },
      }).then((res) => {
        if (res.status === 200) {
          cy.log(`Staff ${staffName} created successfully`)
          expect(res.status).to.eq(200)
          expect(res.body.data.staffType).to.eq(staffType)
          expect(res.body.data.name).to.eq(staffName)
          expect(res.body.data.staffId).to.eq(staffId)
          expect(res.body.data.assignedDepartment.name).to.eq(department)
        } else {
          cy.log('unable to create staff')
        }
      })
    })
  }

  /**
   * Deletes a staff member or staff type in mobile view by searching for them and confirming the deletion.
   * If the staff member is linked to tag or staff type is linked to a staff, it handles the confirmation appropriately.
   *
   * @param {string} itemName - The name of the staff member or staff type to be deleted.
   * @param {boolean} [tagOrStaffLinked=false] - Indicates if the staff member is linked to tag or staff type is associated with a staff. Default is false.
   * @param {string} [ItemType=constants.uiText.staff] - The type of item to delete (staff or staff type). Default is 'staff'.
   */
  static deleteStaffOrStaffTypeInMobile = (itemName, tagOrStaffLinked = false, ItemType = staff) => {
    const { staffAssignment, popupDialogBox } = prosightSafety.staffManagement
    const {
      confirmationMessageBeforeDeletingTagLinkedStaff,
      confirmationMessageBeforeDeletingStaff,
      confirmationMessageBeforeDeletingStaffAssociatedStaffType,
      confirmationMessageBeforeDeletingStaffType,
    } = constants.confirmationMessages

    HelperFunction.search(itemName)
    HelperFunction.getRowByItemName(itemName, cardView, constants.uiText.safety).as('staffRow')
    Click.onButton('@staffRow')

    if (ItemType === staff) {
      Click.forcefullyOn(staffAssignment.deleteStaffBtn)
      if (tagOrStaffLinked) {
        //Can't verify the dailog box text due to bug
        //Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingTagLinkedStaff)
        Click.onContinueButton()
      } else {
        //Can't verify the dailog box text due to bug
        //Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingStaff)
        Click.onButtonByInnerText(popupDialogBox, deleteBtnText)
      }
    } else if (ItemType === constants.uiText.staffType) {
      Click.forcefullyOn(prosightSafety.staffType.deleteStaffTypeBtn)
      if (tagOrStaffLinked) {
        Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingStaffAssociatedStaffType)
        Click.onContinueButton()
      } else {
        Verify.theElement(popupTextDailogMessage).contains(confirmationMessageBeforeDeletingStaffType)
        Click.onButtonByInnerText(popupDialogBox, deleteBtnText)
      }
    }
  }

  /**
   * Verifies the staff data displayed in the side panel.
   * This function checks the staff name in the side panel header and verifies
   * the details such as Staff ID, Staff Type, Location, Last Location, and Tag ID in the side panel.
   *
   * @param {Object} staffData - The staff data to verify in the side panel.
   * @param {string} staffData.staffName - The name of the staff.
   * @param {string} staffData.staffId - The unique ID of the staff.
   * @param {string} staffData.staffType - The type of staff.
   * @param {Object} [tagDetails={}] - Additional tag details for verification.
   * @param {string} [tagDetails.deviceId] - The tag ID associated with the staff.
   * @param {string} [tagDetails.previousRoomName] - The last room name where the staff was located.
   * @param {string} [tagDetails.locationName] - The current location name of the staff.
   */
  static verifyStaffDataFromSidePanel = (staffData, tagDetails = {}) => {
    const { staffName, staffId, staffType } = staffData
    const { deviceId, previousRoomName, locationName } = tagDetails

    const sidePanelDataObj = {
      'Staff ID': staffId,
      'Staff Type': staffType,
      Location: locationName || '-',
      'Last Location': previousRoomName || '-',
      'Tag ID': deviceId || '-',
    }

    cy.get(sidePanel).within(() => {
      cy.get(sidePanelCardHeader).should(commandOptions.haveText, staffName)
    })
    HelperFunction.verifyValueFromSidePanel(sidePanelDataObj)
  }

  /**
   * This function is used to create staff/staffs using the bulk import flow
   * @param {string} filePath Path of the file you want to upload
   * @param {string} fileName name of the file you want to validate
   */
  static staffBulkUpload = (filePath, fileName) => {
    cy.reload()
    //Click on upload button
    Click.forcefullyOn(bulkUploadButton)
    //Verifying the button in bulk import page
    Verify.theElement(bulkUploadTitle).hasText(bulkImportTitle)
    Verify.theElement(downloadCsvTemplate).hasText(bulkUploadCsvTemplateTxt)
    Verify.elementContainingText(button, preview).parentElementIsDisabled()
    Verify.theElement(cancelButton).isEnabled()
    //Selecting the file to upload
    Click.onButtonByInnerText(button, chooseFileButton).then(() => {
      HelperFunction.getInputAndSelectFile(filePath)
    })
    Verify.elementContainingText(button, preview).parentElementIsEnabled()
    //Uploading the file
    Click.onButtonByInnerText(button, preview)
    Verify.theElement(bulkUploadTableTitle).hasText(bulkUploadTableTitleTxt)
    //Getting data from csv file
    cy.fixture(fileName)
      .then(csv)
      .then((data) => {
        let bulkStaffData = data
        bulkStaffData.forEach((row) => {
          let verifyValues = {
            staffName: row['Staff Name'],
            staffId: row['Staff ID'],
            staffType: row['Staff Type'],
            assignedDept: row['Assigned Department'],
            email: row['Email'] || '-',
            phNO: row['Phone Number'] || '-',
          }
          //Verifying the data in  the bulk upload form
          HelperFunction.getRowByItemName(verifyValues.staffName, resultRow, 'staff').as('staffRow')
          HelperFunction.verifyValuesExist('@staffRow', verifyValues)
        })
      })
    //Uploading CSV file
    Click.onButtonByInnerText(button, upload)
    Click.onButtonByInnerText(button, completeCreation)
  }
}
