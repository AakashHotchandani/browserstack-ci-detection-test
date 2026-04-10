import selectors from '../../utils/selectors/prosightAssets'
import constants from '../../utils/constants/prosightAssets/assetsManagement'
import Type from '../../utils/Interactions/type'
import Click from '../../utils/Interactions/click'
import { Verify } from '../../utils/assertions'
import commandOptions from '../../utils/constants/commandOptions'
import globals from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import prosightCore from '../../utils/selectors/prosightCore'
import globalConst from '../../utils/constants/globalConst'
import smartReports from '../prosightEnvironment/smartReportFns'
import globalSels from '../../utils/selectors/globalSels'
const csv = require('neat-csv')
const { bulkImportTitle } = constants.bulkImportConstants
const { preview, chooseFileButton, upload, completeCreation } = globalConst
const { bulkUploadButton, bulkUploadTitle, downloadCsvTemplate, bulkUploadTableTitle } = globalSels.bulkUploadSelectors
const {
  rentalDateLabel,
  createAssetButton,
  nameInput,
  idInput,
  modelNumInput,
  serialNumInput,
  manufacturerInput,
  maintenanceDateDropdown,
  nextMaintenanceDateLabel,
  nextMaintenanceDateInput,
  departmentButton,
  typeButton,
  createButton,
  rentalDateInput,
  ownedLabel,
  rentedLabel,
  rentalDetailLabel,
  linkButton,
  linkOptionsContainer,
  pairingTableHeader,
  pairingButton,
  rentalOptionsDropdown,
  calenderBtn,
  maintenanceDateLabel,
  rentalDueDateLabel,
  rentalDueClickOnRoight,
  rentalDateClickOnRight,
  assetDeleteDialog,
  assetRow,
  addAssetTypeButton,
  assetTypeIconButton: assetTypeIcon,
  assetTypeInput,
  createAssetType,
  unlinkTagButton,
  deleteAssetBtn,
} = selectors.assetsManagement
const { create, edit } = globalConst.actions
const { linkTag, unLinkTags, selectAssignedOwner } = constants.buttonsInnerText
const {
  spanTag,
  checkbox,
  cancelButton,
  inputTag,
  listTag,
  dropdownListbox,
  deleteBtn,
  sidePanel,
  editBtn,
  editIconBtn,
  popupContainer,
  button,
  resultRow,
  searchDepo,
} = globals
const { assets, tags } = constants.headers
const { tableBtn, sidePanelBtn, editMenu } = globalConst.delete_EditActions
const { deleteAsset, cannotDeleteAsset, deleteTag } = constants.paneText
const currentDate = new Date()
const options = { year: 'numeric', month: 'long', day: 'numeric' }
const { mobile, desktop } = constants.viewport
const { haveText, force, checked, haveLength, haveValue, scrollBottom } = commandOptions
const { rented, iap, minPagForSmallTables, assetType, assetAssignment } = constants.dataOptions

// Calculate the date 4 days from today
const rentalDate = new Date(currentDate)
rentalDate.setDate(rentalDate.getDate() + 14)
const formattedRentalDuelDate = rentalDate.toLocaleDateString('en-us', options)

/**
 * Class AssetManagement consists static functions related to Asset Management Module
 * @class AssetManagement
 */

export default class AssetManagement {
  /**
   * Creates or edits an asset based on the provided action type and asset data.
   *
   * @param {Object} assetData - The data of the asset.
   * @param {string} assetData.assetName - The name of the asset.
   * @param {string} assetData.assetId - The ID of the asset.
   * @param {string} assetData.serialNumber - The serial number of the asset.
   * @param {string} assetData.department - The department associated with the asset.
   * @param {string} assetData.assetType - The type of the asset.
   * @param {string} [assetData.manufacturer=null] - The manufacturer of the asset (optional).
   * @param {string} [assetData.modelNum=null] - The model number of the asset (optional).
   * @param {string} [assetData.maintenanceDay=null] - The maintenance day of the asset (optional).
   * @param {string} assetData.rentedOption - The rental option of the asset.
   * @param {string} [assetData.rentalDueDate=null] - The rental due date of the asset (optional).
   * @param {string} actionType - The type of action to perform ("create" or "edit").
   * @param {string} [viewport=constants.viewport.desktop] - The viewport to use (default is "desktop").
   */
  static createOrEditAsset = (assetData, actionType, viewport = desktop) => {
    const {
      assetName,
      assetId,
      serialNumber,
      departmentName,
      assetType,
      manufacturer = null,
      modelNum = null,
      maintenanceDay = null,
      rentedOption,
      rentalDueDate = null,
    } = assetData
    const todayUTC = new Date()
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
    const formattedDate = todayUTC.toLocaleDateString('en-US', options)
    if (actionType === create) {
      Click.forcefullyOn(createAssetButton)
    }

    //verifying buttons initial state
    Verify.theElement(createButton).isDisabled()
    Verify.theElement(cancelButton).isEnabled()
    if (actionType === edit) {
      const buttonToVerify = viewport === desktop ? deleteBtn : deleteAssetBtn
      Verify.theElement(buttonToVerify).isEnabled()
    }

    // assets details section
    Type.theText(assetName).into(nameInput)
    Type.theText(assetId).into(idInput)
    Type.theText(serialNumber).into(serialNumInput)
    if (actionType === create) {
      cy.get(departmentButton).should(haveText, selectAssignedOwner)
      Click.forcefullyOn(departmentButton)
      cy.get(searchDepo).type(departmentName)
      cy.get('body').then(($body) => {
        if ($body.find(spanTag).length > 0 && $body.find(spanTag).is(':visible') && $body.find(spanTag).text().includes(departmentName)) {
          Click.onContainText(spanTag, departmentName)
        } else {
          // Your else condition here
          // For example:
          cy.log(`Element ${spanTag} with text "${departmentName}" is not visible or not present.`)
        }
      })
    } else {
      Click.forcefullyOn(departmentButton)
      cy.get(searchDepo).type(departmentName)
      cy.get('body').then(($body) => {
        if ($body.find(spanTag).length > 0 && $body.find(spanTag).is(':visible') && $body.find(spanTag).text().includes(departmentName)) {
          Click.onContainText(spanTag, departmentName)
        } else {
          // Your else condition here
          // For example:
          cy.log(`Element ${spanTag} with text "${departmentName}" is not visible or not present.`)
        }
      })
    }
    // details with buttons
    // cy.get(departmentButton).should(haveText, selectAssignedOwner)
    // cy.wait(10000)
    // Click.forcefullyOn(departmentButton)
    // if (actionType === create) cy.get(departmentButton).should(haveText, selectAssignedOwner).click(force)
    Click.onContainText(spanTag, departmentName)
    Click.forcefullyOn(typeButton)
    Click.onContainText(spanTag, assetType)
    Verify.theElement(createButton).isEnabled()

    // manufacturer details - optional fields
    if (manufacturer) Type.theText(manufacturer).into(manufacturerInput)
    if (modelNum) Type.theText(modelNum).into(modelNumInput)
    // preventive maintenece Interval details - optional fields
    if (maintenanceDay) {
      HelperFunction.getElementByLabelParent(maintenanceDateLabel, maintenanceDateDropdown).click(force)
      Click.onContainText(spanTag, maintenanceDay)
      const nextMaitenanceDate = HelperFunction.calculateNextMaintenanceDate(maintenanceDay)
      Verify.theElement(nextMaintenanceDateInput).hasText(nextMaitenanceDate)
    }

    if (viewport === desktop) {
      cy.get(ownedLabel).prev().find(inputTag).as('ownedInput')
      Verify.theElement('@ownedInput').isChecked()

      //if asset is rented clicking on rented option
      if (rentedOption === rented) {
        cy.get(rentedLabel).prev().find(inputTag).click(force).should(checked)
      }
    } else {
      Click.forcefullyOn(rentalOptionsDropdown)
      cy.get(dropdownListbox).find(listTag).should(haveLength, 2)
      Click.onContainText(listTag, rentedOption)
    }
    //selecting rental due date from calendar
    if (rentalDueDate) {
      //setting rental date 1 year from current date
      HelperFunction.getElementByLabelParent(rentalDueDateLabel, calenderBtn).click(force)
      Click.forcefullyOn(rentalDueClickOnRoight)
      HelperFunction.getElementByLabelParent(rentalDueDateLabel, `td[title="${formattedRentalDuelDate}"]`).first().click({ force: true })
      HelperFunction.getElementByLabelParent(rentalDateLabel, calenderBtn).click(force)
      HelperFunction.getElementByLabelParent(rentalDateLabel, `td[title="${formattedDate}"]`).first().click({ force: true })
      const expectedDate = smartReports.formatDateAsMMDDYYYY(rentalDate)
      // cy.get(rentalDateInput).should(haveValue, expectedDate)
      Verify.theElement(rentalDateInput).hasValue(expectedDate)
      cy.log(formattedRentalDuelDate)
    }

    Click.forcefullyOn(createButton)
  }

  /**
   * Function that verifies asset details from side panel
   * @param {Object} assetData - The data of the asset.
   * @param {string} assetData.assetName - The name of the asset.
   * @param {string} assetData.assetId - The ID of the asset.
   * @param {string} assetData.serialNumber - The serial number of the asset.
   * @param {string} assetData.department - The department associated with the asset.
   * @param {string} assetData.assetType - The type of the asset.
   * @param {string} [assetData.manufacturer=null] - The manufacturer of the asset (optional).
   * @param {string} [assetData.modelNum=null] - The model number of the asset (optional).
   * @param {string} [assetData.maintenanceDay=null] - The maintenance day of the asset (optional).
   * @param {string} assetData.rentedOption - The rental option of the asset.
   * @param {string} [assetData.rentalDueDate=null] - The rental due date of the asset (optional).
   * @param {object} tagDetails the data of tag
   */
  static verifyAssetDataFromSidePanel = (assetData, tagDetails = {}) => {
    const {
      assetName,
      assetId,
      serialNumber,
      department,
      assetType,
      manufacturer = null,
      modelNum = null,
      maintenanceDay = null,
      rentedOption,
      rentalDueDate = null,
    } = assetData
    let requiredMaintenanceDay, requiredRentalDueDay
    const { deviceId, locationName } = tagDetails

    //if maintenance adn rental date is available assigning its value
    if (maintenanceDay) {
      requiredMaintenanceDay = HelperFunction.calculateNextMaintenanceDate(maintenanceDay)
    }

    if (rentalDueDate) {
      requiredRentalDueDay = smartReports.formatDateAsMMDDYYYY(rentalDate)
    }
    const sidePanelDataObj = {
      Status: 'Operational',
      'Last Location': locationName || '-',
      'Tag ID': deviceId || '-',
      'Serial No.': serialNumber,
      'Manufacturer Name': manufacturer || '-',
      'Model No.': modelNum || '-',
      // 'Preventive Maintenance': requiredMaintenanceDay || '-',
      'Rental Return Date': requiredRentalDueDay || '-',
    }

    cy.get(sidePanel).within(() => {
      Verify.theElement(`div[title="${assetName}"]`).hasText(assetName)
    })
    HelperFunction.verifyValueFromSidePanel(sidePanelDataObj)
  }

  /**
   * Function that deletes an asset given its id.
   * @param {string} id Id or name of the asset you want to delete.
   * @param {string} deleteActionType Type of deletion. It can be from sidePanel, fromEdit and default.
   * @param {boolean} semiDelete Boolean. If true, it will click on delete and check the cannot delete message. Then it will return.
   */
  static deleteAsset = (id, deleteActionType = tableBtn, semiDelete = false) => {
    //searching for the asset to delete
    HelperFunction.search(id)
    HelperFunction.getRowByItemName(id, assetRow, iap).as('assetRow')

    // check pagination results and scroll down if necessary
    // const pagNum = HelperFunction.getNumPagination()
    // cy.log(pagNum)
    // if (pagNum >= 10) {
    //   cy.get(globals.scrollBar).scrollTo(commandOptions.bottomRight)
    // }

    // delete from sidePanel
    if (deleteActionType === sidePanelBtn) {
      cy.get('@assetRow').click(force)
      Click.onButton(sidePanel, deleteBtn)
    }
    // delete from Edit view
    else if (deleteActionType === editMenu) {
      Click.onButton('@assetRow', editBtn)
      Verify.theElement(deleteBtn).isEnabled()
      Verify.theElement(cancelButton).isEnabled()
      Click.onDeleteButton()
    }
    // delete scrolling to the button
    else {
      Click.onButton('@assetRow', deleteBtn)
      if (semiDelete) {
        Verify.theElement(assetDeleteDialog).contains(cannotDeleteAsset)
        Click.onContinueButton()
        // Click.forcefullyOn(globals.confirmationBtnInConfirmationDialogue)
        return
      }
    }

    // Verify.theElement(assetDeleteDialog).contains(deleteAsset)
    Click.onButtonByInnerText(assetDeleteDialog, constants.buttonsInnerText.delete)
  }

  /**
   * Deletes an asset in mobile view by searching for it and confirming the deletion.
   * @param {string} assetName - The name of the asset to be deleted.
   */
  static deleteAssetInMobileView = (assetName) => {
    HelperFunction.search(assetName, false)
    HelperFunction.getRowByItemName(assetName, globals.cardView, iap).as('assetRow')
    Click.onButton('@assetRow', editIconBtn)
    Click.forcefullyOn(selectors.assetsManagement.deleteAssetBtn)
    // we can't verify the dailog box text due to bug
    // Verify.theElement(globals.popupTextDailogMessage).contains(constants.paneText.deleteAsset)
    Click.onButtonByInnerText(assetDeleteDialog, constants.buttonsInnerText.delete)
  }

  /**
   * Function that links an asset with a tag.
   * @param {string} tagId Id of the tag you want to link.
   * @param {string} assetId Id or Name of the asset you want to link.
   * @param {boolean} defaultLinking Boolean that tells if wanting a default linking or not. Default meaning clicking on the link options button.
   */
  static linkAssetWithTag = (tagId, assetId, defaultLinking = true) => {
    if (defaultLinking) {
      //clicking on paper pin button
      Click.forcefullyOn(linkButton)
      cy.contains(spanTag, linkTag).click(force)
      // Find the asset -  only for default
      HelperFunction.getSectionByOuterHeader(assets, pairingTableHeader).within(() => {
        HelperFunction.search(assetId, false)
        // check pagination results and scroll down if necessary
        // const pageNum = HelperFunction.getNumPagination(prosightCore.floorPlanManagement.roomTypePageSel.paginationRange)
        // if (pageNum >= constants.dataOptions.minPagForSmallTables) {
        //   cy.get(globals.scrollBar).scrollTo(commandOptions.scrollBottom)
        // }
        HelperFunction.getRowByItemName(assetId, assetRow, iap).as('assetRow')
        Click.onButton('@assetRow', checkbox)
      })
    }
    // Find the tag
    HelperFunction.getSectionByOuterHeader(tags, pairingTableHeader).within(() => {
      HelperFunction.search(tagId, false)
      // check pagination results and scroll down if necessary
      const pageNum = HelperFunction.getNumPagination(prosightCore.floorPlanManagement.roomTypePageSel.paginationRange)
      if (pageNum >= minPagForSmallTables) {
        cy.get(globals.scrollBar).scrollTo(scrollBottom)
      }
      HelperFunction.getRowByItemName(tagId, assetRow, iap).as('tagRow')
      Click.onButton('@tagRow', checkbox)
    })
    // Click on pairing button
    Verify.theElement(pairingButton).isEnabled()
    Click.forcefullyOn(pairingButton)
  }

  /**
   * Function that unlinks an asset of a tag.
   * @param {string} assetId Id or name of the asset you want to unlink.
   * @param {string} tagName Id or name of the asset you want to unlink.
   * @param {boolean} defaultLinking Boolean that tells if wanting a default unlinking or not. Default meaning clicking on the link options button.
   */
  static unlinkAssetOfTag = (assetId, tagName, defaultUnlinking = true) => {
    const messageUnlinkingTag = constants.paneText.messageUnlinkingTag(assetId, tagName)

    if (defaultUnlinking) {
      Click.forcefullyOn(linkButton)
      cy.contains(linkOptionsContainer, unLinkTags).click(force)
      // Find the asset -  only for default
      HelperFunction.search(assetId, false)
    }
    HelperFunction.getRowByItemName(assetId, assetRow, iap).as('assetRow')
    Click.onButton('@assetRow', unlinkTagButton)
    Verify.theElement(assetDeleteDialog).contains(messageUnlinkingTag)
    Click.onButtonByInnerText(assetDeleteDialog, constants.buttonsInnerText.unlinkTag)
  }

  /**
   * Function that creates an Asset Type.
   * @param {string} name Of the new asset type.
   * @param {string} iconClass class of the icon you want o select
   * @param {string} actionType - The type of action to perform (create or edit).
   * @param {string} [page=assetType] - The page where the action is performed (default is asset type page).
   */
  static createOrEditAssetType = (name, iconClass, actionType, page = assetType) => {
    //setting conditions for asset type creation
    if (page === assetAssignment) {
      if (actionType === create) {
        Click.forcefullyOn(createAssetButton)
        Click.forcefullyOn(createAssetType)
      }
    } else if (actionType === create) {
      Click.forcefullyOn(addAssetTypeButton)
    }

    // Check create button is disable
    Verify.theElement(createButton).isDisabled()
    // Fill info
    Type.theText(name).into(assetTypeInput)
    HelperFunction.getElementFromSpecificDiv(assetTypeIcon, iconClass).as('iconButton')
    Click.forcefullyOn('@iconButton')
    if (page === assetAssignment) {
      cy.get(popupContainer).find(createButton).click(force)
    } else {
      Click.forcefullyOn(createButton)
    }
  }

  /**
   * Function that deletes a tag.
   * @param {string} tagId Id of the tag you want to delete
   */
  static deleteTag = (tagId) => {
    HelperFunction.search(tagId)
    HelperFunction.getRowByItemName(tagId, assetRow, 'iap').as('assetRow')
    Click.onButton('@assetRow', deleteBtn)
    Verify.theElement(assetDeleteDialog).contains(deleteTag)
    Click.onDeleteButton()
  }

  /**
   * Function that deletes a tag In the mobile view
   * @param {string} tagId Id of the tag you want to delete
   */
  static deleteTagInMobileview = (tagId) => {
    HelperFunction.search(tagId)
    HelperFunction.getRowByItemName(tagId, globals.cardView, iap).as('assetRow')
    Click.onButton('@assetRow', globals.deleteBtn)
    Verify.theElement(globals.popupTextDailogMessage).contains(constants.paneText.deleteTag)
    Click.forcefullyOn(globals.dialogueDeleteBtn)
  }

  /**
   * This function is used to create asset using the bulk import flow
   * @param {string} filePath Path of the file you want to upload
   * @param {string} fileName name of the file you want to validate
   */
  static assetBulkImport = (filePath, fileName) => {
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
    Verify.theElement(bulkUploadTableTitle).hasText(bulkImportTitle)
    //Getting data from csv file
    cy.fixture(fileName)
      .then(csv)
      .then((data) => {
        let bulkEquipmentData = data
        bulkEquipmentData.forEach((row) => {
          let verifyValues = {
            assetName: row['Asset Name'],
            assetId: row['Asset ID'],
            assetType: row['Asset Type'],
            serialNumber: row['Serial Number'],
            assignedOwner: row['Assigned Owner'],
          }
          //Verifying the data in  the bulk upload form
          HelperFunction.getRowByItemName(verifyValues.assetName, resultRow, 'asset-row').as('assetRow')
          HelperFunction.verifyValuesExist('@assetRow', verifyValues)
        })
      })
    //Uploading CSV file
    Click.onButtonByInnerText(button, upload)
    Click.onButtonByInnerText(button, completeCreation)
  }
}
