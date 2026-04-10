/// <reference types="cypress" />
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import prosightAssetsSel from '../../../../utils/selectors/prosightAssets'
import Click from '../../../../utils/Interactions/click'
import constants from '../../../../utils/constants/prosightAssets/assetsManagement'
import { Verify } from '../../../../utils/assertions'
import AssetManagement from '../../../../pageObjects/prosightAssets/assetsManagement'
import assetTestData from '../../../../fixtures/prosightAssets/assetTestDataforAssetManagement_mobile.json'
import globalSels from '../../../../utils/selectors/globalSels'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import Asset_API from '../../../../pageObjects/prosightAssets/assetSmartAlerts'
import commandOptions from '../../../../utils/constants/commandOptions'
import SmartAlertsUsingAPI from '../../../../pageObjects/prosightCore/triggeringAlerts'
import Type from '../../../../utils/Interactions/type'
import assetTypeTestData from '../../../../fixtures/prosightAssets/typeData.json'
import application from '../../../../utils/constants/Leverage/leverageConstants'
import tagData from '../../../../fixtures/prosightCore/tags.json'
import userData from '../../../../fixtures/SignIn/user.json'
import globalConst from '../../../../utils/constants/globalConst'
import FloorPlanManagement from '../../../../pageObjects/prosightCore/floorPlanManagementFns'
import assetTagsMobile from '../../../../fixtures/prosightAssets/assetTagsMobile.json'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
let currentAsset
let currTag
let assetToUnlinkFromTag, tagId
const exist = commandOptions.exist
const unlinked = constants.dataOptions.unlinked
const { buttonTag, linkAssetToTagBtn, tagIdInput, linkBtn, cardView, hamburgerBtn, assetTxt, tagTxt, popupTextDailogMessage, editIconBtn, button } =
  globalSels
const linked = constants.dataOptions.linked

const { asset_Type } = assetTypeTestData
let assetTypeData = assetTypeTestData.assetType6
let assetTypeForEdit = assetTypeTestData.assetType7
let assetType3 = assetTypeTestData.assetType8
let assetType4 = assetTypeTestData.assetType10
let assetType5 = assetTypeTestData.assetType9
let assetTypeToDelete

const { defaultIcon, assetTypeInput, walkerIcon, wheelChairIcon, navbar, typeButton, searchAsset, serialNumInput, nameInput } =
  prosightAssetsSel.assetsManagement
const { assetType, assetsAssignment, assetsManagement, tagManagement } = constants.buttonsInnerText
const { asset } = application.objectTypes
const { create, edit } = globalConst.actions
const { iap, assetAssignment } = constants.dataOptions
const { assetTypeCreated, assetTypeEdited, assetTypeDeleted, assetCreated, tagLinked, editedAsset, deletedAsset, deletedTag } =
  constants.toastMessages
const { smartLocation, assetsType } = constants.urlText
const { username, password, name } = userData
const { mobile } = globalSels.viewport
let {
  hospitalName,
  departmentBoundaryName,
  departmentName,
  buildingName,
  roomDetails,
  floorDetails,
  locationDetails,
  previousRoomName,
  locationName,
} = assetTestData
let { roomName_1, roomName_2 } = locationDetails
// Handles extra spaces around alert text in UI.
const regex = new RegExp(`^\\s*${assetAssignment}\\s*$`)
before('Deleting created asset and staff and deleting the timer', () => {
  //Deleting staff type
  HelperFunction.deleteEquipment_Asset_StaffType_API(assetTestData.assetType, asset)

  //Delete Room type
  FloorPlanManagement.deleteRoomType_API(assetTestData.roomDetails.roomTypeName)

  //Delete department
  FloorPlanManagement.deleteDepartment_API(departmentName)

  //Delete Floor
  FloorPlanManagement.deleteFloor_API(assetTestData.floorDetails.floorName, hospitalName)
})

before('Create tag and asset and linking it together', () => {
  HelperFunction.globalIntercept()

  //Create Department
  FloorPlanManagement.createDepartment_API(departmentName, buildingName)

  //Create Room type
  FloorPlanManagement.createRoomType_API(roomDetails)

  //Create floor and room
  FloorPlanManagement.createFloor_API(floorDetails, locationDetails, hospitalName, buildingName, departmentName)

  //create department boundaries
  FloorPlanManagement.createDepartmentBoundary_API(departmentBoundaryName, departmentName, floorDetails.floorName)

  // Create asset type
  HelperFunction.createEquipment_Asset_StaffType_API(assetTestData.assetType, asset)

  /**********************************Assignining ID's after Data Creation**************************************/
  HelperFunction.search_API(floorDetails.floorName, leverageConstants.objectTypes.floors).then(({ authToken, Id }) => {
    assetTestData.floorDetails.floorID = Id
  })
  HelperFunction.search_API(departmentName, leverageConstants.objectTypes.departments).then(({ authToken, Id }) => {
    assetTestData.departmentID = Id
  })
  HelperFunction.search_API(locationName, leverageConstants.objectTypes.room).then(({ authToken, Id }) => {
    assetTestData.locationID = Id
  })
  HelperFunction.search_API(previousRoomName, leverageConstants.objectTypes.room).then(({ authToken, Id }) => {
    assetTestData.previousRoomID = Id
  })
})

after('Deleting created asset and staff and deleting the timer', () => {
  //Deleting staff type
  HelperFunction.deleteEquipment_Asset_StaffType_API(assetTestData.assetType, asset)

  //Delete Room type
  FloorPlanManagement.deleteRoomType_API(assetTestData.roomDetails.roomTypeName)

  //Delete department
  FloorPlanManagement.deleteDepartment_API(departmentName)

  //Delete Floor
  FloorPlanManagement.deleteFloor_API(assetTestData.floorDetails.floorName, hospitalName)
})
describe(
  'Should execute functions within the Assets Assignment Page of Asset Management module In Mobile view',
  { viewportHeight: 667, viewportWidth: 375, testIsolation: false },
  () => {
    beforeEach('Deleting Existing Alerts and Navigate to Smart Alerts module', () => {
      HelperFunction.globalIntercept()
      cy.session('login-session', () => {
        HelperFunction.globalIntercept()
        LoginPage.toVisit('/assets/')
        LoginPage.doUserLogin(username, password)
        Verify.theUrl().includes(smartLocation)
        Verify.textPresent.isVisible(assetType)
        Click.on(hamburgerBtn)
        HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)
      })
      LoginPage.toVisit('/asset')
      Verify.textPresent.isVisible(assetType)
      Click.on(hamburgerBtn)
      //Navigate to the Asset Assignment page
      Click.onContainText(buttonTag, assetsManagement)
      Click.onContainText(buttonTag, assetsAssignment)

      //Verifying the URL
      Verify.theUrl().includes('assetAssignment')
    })
    afterEach('Delete the test data', () => {
      if (assetToUnlinkFromTag) HelperFunction.unlinkTagOrSensor_Mobile_UI(assetTxt, assetToUnlinkFromTag, currTag)
      if (currentAsset) HelperFunction.deleteItem_API(currentAsset, assetTxt)
      if (currTag) HelperFunction.deleteItem_API(currTag, tagTxt)
      currTag = null
      currentAsset = null
      assetToUnlinkFromTag = null
    })

    it('User should be able to create an asset Without linking Tag', () => {
      const { assetName, id, department, type } = assetTestData.asset14
      const valuesToVerifyAsset = { assetName, id, type, department, unlinked }

      // CREATE ASSET - WITHOUT LINKING TAG
      AssetManagement.createOrEditAsset(assetTestData.asset14, create, mobile)

      // Verify Toast message
      Verify.textPresent.isVisible(assetCreated)

      //Click on Done button
      Click.onDoneButton()

      //assign asset to delete test data
      currentAsset = assetName

      //Search,select and Verify perticular asset info
      HelperFunction.search(assetName, false)
      HelperFunction.getRowByItemName(assetName, cardView, iap).should(exist).as('assetRow')
      HelperFunction.verifyValuesInTheCardView('@assetRow', valuesToVerifyAsset)
    })

    it('User should be able to create an asset and link with the tag in one flow', () => {
      const { assetName, id, department, type } = assetTestData.asset19
      const valuesToVerifyAsset = { assetName, id, type, department, linked }
      tagId = assetTagsMobile.tag1.deviceId

      //create tag through API
      SmartAlertsUsingAPI.createTags(assetTagsMobile.tag1)
      //assign tag to delete test data
      currTag = tagId

      // CREATE ASSET - WITHOUT LINKING TAG
      AssetManagement.createOrEditAsset(assetTestData.asset19, create, mobile)
      //assign asset to delete test data
      currentAsset = assetName

      // Verify Toast message
      Verify.textPresent.isVisible(assetCreated)
      //click on the 'Link Asset to Tag' button to link with tag
      Click.onContainText(buttonTag, linkAssetToTagBtn)

      // Enter the tag Id to link
      Type.theTextAndEnter(tagId).into(tagIdInput)

      //Verify the asset input has the correct the asset name
      Verify.theElement(searchAsset).hasValue(assetName)

      //check the Link button is enabled and click on that Link button
      Verify.elementContainingText(buttonTag, linkBtn).isEnabled()
      Click.onContainText(buttonTag, linkBtn)

      //Verify Toast message and click on Done button
      Verify.textPresent.isVisible(tagLinked)
      Click.onDoneButton()
      //Assign asset to unlink with Tag
      assetToUnlinkFromTag = assetName

      //Search,select and Verify perticular asset info
      HelperFunction.search(assetName, false)
      HelperFunction.getRowByItemName(assetName, cardView, iap).should(exist).as('assetRow')
      HelperFunction.verifyValuesInTheCardView('@assetRow', valuesToVerifyAsset)
    })

    it('User should be able to Link and Unlink tag with Asset - SMARTHOSP-TC-4980', () => {
      const { assetName, assetId, assetType } = assetTestData.asset18
      const valuesToVerifyAsset = { assetName, assetId, assetType, linked }
      tagId = assetTagsMobile.tag1.deviceId

      //create tag through API
      SmartAlertsUsingAPI.createTags(assetTagsMobile.tag1)
      //assign tag to delete test data
      currTag = tagId

      //create Asset through API
      Asset_API.createAsset(assetTestData.asset18)
      //assign asset to delete test data
      currentAsset = assetName

      //Link Tag with Asset
      HelperFunction.linkTagOrSenor_Mobile_UI(tagId, tagTxt, assetTxt, assetName)
      //Assign asset to unlink with Tag
      assetToUnlinkFromTag = assetName

      //Search,select and Verify perticular asset info
      HelperFunction.search(assetName, false)
      HelperFunction.getRowByItemName(assetName, cardView, iap).should(exist).as('assetRow')
      HelperFunction.verifyValuesInTheCardView('@assetRow', valuesToVerifyAsset)
    })

    it('User should be able to edit Asset data - SMARTHOSP-TC-4974', () => {
      const { assetName, assetId, assetType, serialNumber } = assetTestData.asset15
      const valuesToVerifyAsset1 = {
        assetName,
        assetType,
        assetId,
        unlinked,
      }
      const { assetName: name, assetId: id, department: department, assetType: type } = assetTestData.asset16
      const valuesToVerifyAsset2 = { name, id, type, department, unlinked }
      // CREATE ASSET
      Asset_API.createAsset(assetTestData.asset15)
      //assign asset to delete test data
      currentAsset = assetName
      //search, select and Verify asset info
      HelperFunction.search(assetName, false)
      HelperFunction.getRowByItemName(assetName, cardView, iap).should(exist).as('assetRow')
      HelperFunction.verifyValuesInTheCardView('@assetRow', valuesToVerifyAsset1)
      // click on Edit Icon
      Click.onButton('@assetRow', editIconBtn)
      // Asserting that the form fields contain the correct values
      Verify.theUrl().includes(constants.urlText.edit)
      Verify.theElement(nameInput).hasAttributeValue('value', assetName)
      Verify.theElement(serialNumInput).hasAttributeValue('value', serialNumber)
      Verify.theElement(typeButton).contains(assetType)
      // Editing - using same create function to edit asset but changing the action type to Edit
      AssetManagement.createOrEditAsset(assetTestData.asset16, edit, mobile)
      //assign asset to delete test data
      currentAsset = name
      // Verify Toast messages
      Verify.theToast.showsUpWithText(editedAsset)
      //search, select and Verify asset info
      HelperFunction.search(name, false)
      HelperFunction.getRowByItemName(name, cardView, iap).should(exist).as('assetRow')
      HelperFunction.verifyValuesInTheCardView('@assetRow', valuesToVerifyAsset2)
    })

    it('User should be able to delete the asset - SMARTHOSP-TC-4972', () => {
      const { assetName, assetId, assetType } = assetTestData.asset17
      const valuesToVerifyAsset = {
        assetName,
        assetType,
        assetId,
        unlinked,
      }

      //CREATE ASSET
      Asset_API.createAsset(assetTestData.asset17)

      //assign asset to delete test data
      currentAsset = assetName

      //search, select and Verify asset info
      HelperFunction.search(assetName, false)
      HelperFunction.getRowByItemName(assetName, cardView, iap).as('assetRow')
      HelperFunction.verifyValuesInTheCardView('@assetRow', valuesToVerifyAsset)

      //DELETE the Asset
      AssetManagement.deleteAssetInMobileView(assetName)

      //Verify Toast message
      Verify.theToast.showsToastMessage(deletedAsset)

      // Reset test data assignment after successful asset deletion
      currentAsset = null
    })
  }
)

describe(
  'Should execute functions within the Tag Management Page of Asset Management module In Mobile view',
  { viewportHeight: 667, viewportWidth: 375, testIsolation: false },
  () => {
    beforeEach('Deleting Existing Alerts and Navigate to Smart Alerts module', () => {
      HelperFunction.globalIntercept()
      cy.session('login-session', () => {
        HelperFunction.globalIntercept()
        LoginPage.toVisit('/assets/')
        LoginPage.doUserLogin(username, password)
        Verify.theUrl().includes(smartLocation)
        Verify.textPresent.isVisible(assetType)
        Click.on(hamburgerBtn)
        HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)
      })
      LoginPage.toVisit('/asset')
      Verify.textPresent.isVisible(assetType)
      Click.on(hamburgerBtn)
      //Navigate to the Asset Assignment page
      Click.onContainText(buttonTag, assetsManagement)
      Click.onContainText(buttonTag, tagManagement)
      HelperFunction.navigateToModule(button, tagManagement)

      //Verifying the URL
      Verify.theUrl().includes('tagManagement')
    })

    afterEach('Delete the test data', () => {
      if (assetToUnlinkFromTag) HelperFunction.unlinkTag_Sensor_API(assetToUnlinkFromTag, assetTxt)
      if (currentAsset) HelperFunction.deleteItem_API(currentAsset, assetTxt)
      if (currTag) HelperFunction.deleteItem_API(currTag, tagTxt)
      currTag = null
      currentAsset = null
      assetToUnlinkFromTag = null
    })

    it('User should be able to link and unlink the tag with an asset - SMARTHOSP-TC-4980', () => {
      const tagId = assetTagsMobile.tag1.deviceId
      const { assetName } = assetTestData.asset20
      const verifyTagInfoPostLinking = { tagId, assetName, linked }
      const verifyTagInfoPostUnlinking = { tagId, unlinked }

      //Create a tag through API
      SmartAlertsUsingAPI.createTags(assetTagsMobile.tag1)

      //assign the tag to delete the test data
      currTag = tagId

      //create Asset through API
      Asset_API.createAsset(assetTestData.asset20)

      //assign asset to delete test data
      currentAsset = assetName

      //Link Tag with Asset
      HelperFunction.linkTagOrSenor_Mobile_UI(tagId, tagTxt, assetTxt, assetName)

      //Assign the asset to unlink with the Tag
      assetToUnlinkFromTag = assetName

      //Search,select and Verify perticular Tag info after linking with Asset
      HelperFunction.search(tagId, false)
      HelperFunction.getRowByItemName(tagId, cardView, iap).should(exist).as('assetRow')
      HelperFunction.verifyValuesInTheCardView('@assetRow', verifyTagInfoPostLinking)

      //unlink the tag with asset
      HelperFunction.unlinkTagOrSensor_Mobile_UI(assetTxt, assetName, tagId)

      //Search,select and Verify perticular Tag info after unlinking with Asset
      HelperFunction.search(tagId, false)
      HelperFunction.getRowByItemName(tagId, cardView, iap).should(exist).as('assetRow')
      HelperFunction.verifyValuesInTheCardView('@assetRow', verifyTagInfoPostUnlinking)

      //re-assigning null after successful unlink tag with an asset
      assetToUnlinkFromTag = null
    })

    it('User should be able to delete the Tag - SMARTHOSP-TC-4976', () => {
      const tagId = assetTagsMobile.tag1.deviceId

      //create Tag through API
      SmartAlertsUsingAPI.createTags(assetTagsMobile.tag1)

      //delete the tag
      AssetManagement.deleteTagInMobileview(tagId)

      //verify the toast message
      Verify.theToast.showsToastMessage(deletedTag)
    })

    it('User should unable to delete the Tag which is linked an Asset', () => {
      const linked = constants.dataOptions.linked
      const { assetName } = assetTestData.asset21
      const tagId = assetTagsMobile.tag2.deviceId
      const valuesToVerifyAsset = { assetName, linked }

      //create Tag through API
      SmartAlertsUsingAPI.createTags(assetTagsMobile.tag2)

      //assign tag to delete test data
      currTag = tagId

      //create Asset through API
      Asset_API.createAsset(assetTestData.asset21)

      //assign asset to delete test data
      currentAsset = assetName

      //link a tag with Asset using API
      HelperFunction.linkSensor_Tag_API(assetName, assetTxt, tagId)

      //Assign asset to unlink with Tag
      assetToUnlinkFromTag = assetName
      Click.on(hamburgerBtn)
      Click.onContainText(buttonTag, tagManagement)
      //Search,select and Verify perticular asset info
      HelperFunction.search(tagId)
      HelperFunction.getRowByItemName(tagId, cardView, iap).should(exist).as('assetRow')
      HelperFunction.verifyValuesInTheCardView('@assetRow', valuesToVerifyAsset)

      //click on delete button
      Click.onButton('@assetRow', globalSels.deleteBtn)

      //Verify the con't delete tag text due to the asset is linked with tag
      Verify.theElement(popupTextDailogMessage).contains(constants.paneText.cannotDeleteTag)

      //click on Continue button
      Click.onContinueButton()
    })
  }
)

describe('Execute functions on the Asset Type page in mobile view', { viewportHeight: 667, viewportWidth: 400, testIsolation: false }, () => {
  beforeEach('Deleting Existing Alerts and Navigate to Smart Alerts module', () => {
    HelperFunction.globalIntercept()
    cy.session('login-session', () => {
      HelperFunction.globalIntercept()
      LoginPage.toVisit('/assets/')
      LoginPage.doUserLogin(username, password)
      Verify.theUrl().includes(smartLocation)
      Verify.textPresent.isVisible(assetType)
      Click.on(hamburgerBtn)
      HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)
    })
    LoginPage.toVisit('/asset')
    Verify.textPresent.isVisible(assetType)
    Click.on(hamburgerBtn)

    //Verify the user name
    Verify.textPresent.isVisible(username)

    Click.onContainText(buttonTag, assetsManagement)
    cy.contains(tagManagement).next().click()

    //Verifying the URL
    Verify.theUrl().includes('assetType')
  })

  afterEach('Clean up test data after each test block', () => {
    if (assetTypeToDelete) {
      HelperFunction.deleteEquipment_Asset_StaffType_API(assetTypeToDelete, asset)
    }
  })

  it('User should be able to create Asset Type data - SMARTHOSP-TC-8727', () => {
    //creating assest type
    AssetManagement.createOrEditAssetType(assetTypeData, wheelChairIcon, create)
    assetTypeToDelete = assetTypeData
    Verify.theToast.showsUpWithText(assetTypeCreated)
    // Search for the created asset type
    HelperFunction.search(assetTypeData)
    // Get the row of the created asset type and alias it as 'assetDetailsInRow'
    HelperFunction.getRowByItemName(assetTypeData, cardView, iap).as('assetDetailsInRow')
    // Verifying the created asset type
    Verify.theElement('@assetDetailsInRow').contains(assetTypeData)
    Verify.theElement('@assetDetailsInRow').hasChildClass(wheelChairIcon)
  })

  it('User should be able to edit Asset Type data - SMARTHOSP-TC-8727', () => {
    // Creating asset type
    HelperFunction.createEquipment_Asset_StaffType_API(assetType3, asset)
    assetTypeToDelete = assetType3

    // Search for the created asset type
    HelperFunction.search(assetType3)
    HelperFunction.getRowByItemName(assetType3, cardView, iap).as('assetDetailsInRow')
    // Verifying the created asset type
    Verify.theElement('@assetDetailsInRow').contains(assetType3)
    Verify.theElement('@assetDetailsInRow').hasChildClass(defaultIcon)
    // Editing the asset type
    Click.onButton('@assetDetailsInRow', buttonTag)
    // Verify the URL to ensure we are on the edit page
    Verify.theUrl().includes(constants.urlText.edit)
    // Verify the input field has the correct initial value
    Verify.theElement(assetTypeInput).hasAttributeValue('value', assetType3)
    // Editing the asset type with new data
    AssetManagement.createOrEditAssetType(assetTypeForEdit, walkerIcon, edit)
    assetTypeToDelete = assetTypeForEdit
    // Verifying the toast message after editing
    Verify.theToast.showsToastMessage(assetTypeEdited)
    // Searching for the edited asset type
    HelperFunction.search(assetTypeForEdit, false)
    // Get the row of the edited asset type and alias it as 'editedAssetTypeRow'
    HelperFunction.getRowByItemName(assetTypeForEdit, cardView, iap).as('editedAssetTypeRow')
    // Verifying the edited asset type
    Verify.theElement('@editedAssetTypeRow').contains(assetTypeForEdit)
    Verify.theElement('@editedAssetTypeRow').hasChildClass(walkerIcon)
  })

  it('User should be able to delete Asset Type data - SMARTHOSP-TC-8727', () => {
    // Creating asset type
    HelperFunction.createEquipment_Asset_StaffType_API(assetType4, asset)
    assetTypeToDelete = assetType4
    // Reload the page to ensure the created asset type is reflected

    // Search for the created asset type
    HelperFunction.search(assetType4)
    // Get the row of the created asset type and alias it as 'assetDetailsInRow'
    HelperFunction.getRowByItemName(assetType4, cardView, iap).as('assetDetailsInRow')
    // Verifying the created asset type
    Verify.theElement('@assetDetailsInRow').contains(assetType4)
    Verify.theElement('@assetDetailsInRow').hasChildClass(defaultIcon)
    // Clicking on the edit button
    Click.onButton('@assetDetailsInRow', buttonTag)
    // Verifying the URL to ensure we are on the edit page
    Verify.theUrl().includes(constants.urlText.edit)
    // Verify the input field has the correct initial value
    Verify.theElement(assetTypeInput).hasAttributeValue('value', assetType4)
    // Deleting the asset type
    Click.onDeleteButton()
    Click.forcefullyOn(globalSels.dialogueDeleteBtn)
    // Verifying the toast message after deletion
    Verify.theToast.showsToastMessage(assetTypeDeleted)
  })
})

describe(
  'Execute functions on the Asset assignment page to create an asset type in mobile view',
  { viewportHeight: 667, viewportWidth: 400, testIsolation: false },
  () => {
    beforeEach('Deleting Existing Alerts and Navigate to Smart Alerts module', () => {
      HelperFunction.globalIntercept()
      cy.session('login-session', () => {
        HelperFunction.globalIntercept()
        LoginPage.toVisit('/assets/')
        LoginPage.doUserLogin(username, password)
        Verify.theUrl().includes(smartLocation)
        Verify.textPresent.isVisible(assetType)
        Click.on(hamburgerBtn)
        HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)
      })
      LoginPage.toVisit('/asset')
      Verify.textPresent.isVisible(assetType)
      Click.on(hamburgerBtn)
      //Navigate to the Asset Assignment page
      Click.onContainText(buttonTag, assetsManagement)
      Click.onContainText(buttonTag, assetsAssignment)

      //Verifying the URL
      Verify.theUrl().includes('assetAssignment')
    })

    afterEach('Clean up test data after each test block', () => {
      if (assetTypeToDelete) {
        HelperFunction.deleteEquipment_Asset_StaffType_API(assetTypeToDelete, asset)
      }
    })

    it('User should be able to create Asset Type data- SMARTHOSP-TC-8727', () => {
      //creating assest type
      AssetManagement.createOrEditAssetType(assetType5, wheelChairIcon, create, assetAssignment)
      assetTypeToDelete = assetType5
      Verify.theToast.showsUpWithText(assetTypeCreated)
      Verify.theElement(typeButton).contains(assetType5)
    })
  }
)
