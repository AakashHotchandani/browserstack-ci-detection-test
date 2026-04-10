/// <reference types="cypress" />
import constants from '../../../../utils/constants/prosightSafety/staffManagementConst'
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import hospitalDetails from '../../../../fixtures/prosightCore/hospitalDetails.json'
import globalSels from '../../../../utils/selectors/globalSels'
import safetyPageSel from '../../../../utils/selectors/prosightSafety'
import { Verify } from '../../../../utils/assertions'
import Click from '../../../../utils/Interactions/click'
import StaffManagement from '../../../../pageObjects/prosightSafety/staffManagementFns'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import APIFunctions from '../../../../pageObjects/prosightCore/triggeringAlerts'
import staffData from '../../../../fixtures/prosightSafety/staffAssignment.json'
import Type from '../../../../utils/Interactions/type'
import tags from '../../../../fixtures/prosightSafety/staffTags.json'
import globalConst from '../../../../utils/constants/globalConst'
import userData from '../../../../fixtures/SignIn/user.json'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import FloorPlanManagement from '../../../../pageObjects/prosightCore/floorPlanManagementFns'
const csv = require('neat-csv')

const {
  addStaffMemberBtn,
  staffNameInputField,
  staffIdInputField,
  doneButton,
  createStaffTypeBtn,
  staffNameFieldError,
  staffIdFieldError,
  contactEmailFieldError,
  contactPhNoFieldError,
} = safetyPageSel.staffManagement.staffAssignment
const { linkTagBtnInConfirmationBox, skipLinkTagBtn, linkButton } = safetyPageSel.staffManagement
const { staffManagementModule, tagManagement, staffTypePage, staffAssignment } = safetyPageSel.moduleBtnsText
const { createBtn, confirmationPopup, resultRow, linkUnlinkScreenBackBtn, button, skipBtn, profileSection, headerButtonToBack } = globalSels
const {
  messageAfterStaffCreation,
  messageAfterLinkingTag,
  messageAfterUpdatingStaffDetails,
  messageAfterDeletingStaff,
  messageAFterCreatingStaffType,
  messageAfterUpdatingStaffTypeDetails,
  messageAfterDeletingStaffType,
  messageAfterUnlinkingTag,
  messageAFterDeletingTag,
  messageAfterBulkUpload,
} = constants.toastMessages
const { confirmationBeforeLinkingTag } = constants.confirmationMessages
const { staffManagement, tag_Management, staff_Type, smartLocation } = constants.urlText
const { linked, safety, unLinked } = constants.uiText
const { defaultSTaffIcon, nurseIcon, staffTypeNameFieldError } = safetyPageSel.staffType
const { tableBtn, sidePanelBtn, editMenu } = globalConst.delete_EditActions
const { link, unlink } = globalConst.actions
const { staff18, staff19, staff20, staff21, staff22, staff23, staff24 } = staffData.staffDataForNegativeScenariosOnDesktop
const { staff, tag } = leverageConstants.objectTypes
const { staffNameExistsErrMsg, staffIDExistsErrMsg, invalidStaffNameErrMsg, invalidStaffIDErrMsg, invalidEmailErrMsg, invalidPhoneNumberErrMsg } =
  constants.errorMessagesForStaffAssignmentPage
const { username, password, name } = userData
const { name12, name13, name14 } = staffData.staffType.staffTypeDataForNegativeScenariosOnDesktop
const { staffTypeExistsErrMsg, invalidStaffTypeNameErrMsg } = constants.errorMessagesForStaffTypePage
const { staff1, staff2, staff3, staff4, staff26 } = staffData
const { staffTag1, staffTag2, staffTag3, staffTag4 } = tags
const { staff25, staff27 } = staffData.staffsForEditTestCase
const { desktop } = globalSels.viewport
const { csvFileName, staffBulkCsvPath } = constants.bulkImportConstants
const { locationDetails, floorDetails, roomDetails, departmentBoundaryName } = staffData

let hospitalName = hospitalDetails.hospitalName[0]
let staffId,
  valuesToVerify,
  department,
  staffType,
  listOfStaffDetailsForDeleteTestCase,
  tagId = null,
  manufacturer,
  model,
  staffName,
  staffTypeName,
  bulkStaffData
let runId
const testResults = []

//deleting the test data before running the scripts
before('delete test data', () => {
  //Delete the existing Staff type
  HelperFunction.deleteEquipment_Asset_StaffType_API(staffData.staff_Typee, staff)

  //Delete Room type
  FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)

  //Delete department
  FloorPlanManagement.deleteDepartment_API(staffData.departmentName)

  //Delete Floor
  FloorPlanManagement.deleteFloor_API(staffData.floorDetails.floorName, hospitalName)

  //Create Department
  FloorPlanManagement.createDepartment_API(staffData.departmentName, staffData.buildingName)

  //Create Room type
  FloorPlanManagement.createRoomType_API(roomDetails)

  //Create floor and room
  FloorPlanManagement.createFloor_API(floorDetails, locationDetails, staffData.hospitalName, staffData.buildingName, staffData.departmentName)

  //create department boundaries
  FloorPlanManagement.createDepartmentBoundary_API(departmentBoundaryName, staffData.departmentName, floorDetails.floorName)

  //create the new staff type
  HelperFunction.createEquipment_Asset_StaffType_API(staffData.staff_Typee, staff)
})
describe('It should perform CRUD functionalities for Staff Assignment page', () => {
  beforeEach('It should login to the Safety application and should clear the test data', () => {
    HelperFunction.globalIntercept()
    cy.session([username, password], () => {
      LoginPage.toVisit('/safety')
      LoginPage.doUserLogin(username, password)
      HelperFunction.navigateToModule(button, staffManagementModule)
    })
    LoginPage.toVisit('/safety')
    HelperFunction.navigateToModule(button, staffManagementModule)
    Verify.theUrl().includes(staffManagement)
  })

  it('7349, TC-4740_4739 The user should able to create a new staff ,link tag and view it', () => {
    HelperFunction.globalIntercept()
    //test data creation
    tagId = staffTag1.deviceId
      ; ({ staffName, staffId, department, staffType } = staff1)
    APIFunctions.createTags(staffTag1)
    valuesToVerify = { staffName, staffId, staffType, tagId, department }

    //creating a staff , linking it to a tag and verifying the same  -- Scenario 1
    Click.forcefullyOn(addStaffMemberBtn)
    Verify.theElement(createBtn).isDisabled()
    StaffManagement.enterDetailsForStaff(staff1) //--staff details entered
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
    Verify.theElement(confirmationPopup).contains(confirmationBeforeLinkingTag)
    Click.forcefullyOn(linkTagBtnInConfirmationBox)
    Verify.theToast.showsToastMessage(messageAfterStaffCreation) //-- assertion after staff creation completed

    Verify.theElement(linkButton).isDisabled()
    StaffManagement.selectTag_Sensor(tagId) //--linking a tag to staff
    Verify.theElement(linkButton).isEnabled()
    Click.forcefullyOn(linkButton)
    Verify.theToast.showsToastMessage(messageAfterLinkingTag) //--assertions after linking tag
    valuesToVerify = { ...valuesToVerify, linked }

    //navigating back
    Click.forcefullyOn(headerButtonToBack)

    // Verify staff info from table view
    HelperFunction.search(staffName)
    HelperFunction.getRowByItemName(staffName, resultRow, safety).as('linkedTagRow')
    HelperFunction.verifyValuesExist('@linkedTagRow', valuesToVerify)

    // Verify the staff info from side panel
    Click.forcefullyOn('@linkedTagRow')
    StaffManagement.verifyStaffDataFromSidePanel(staff1, staffTag1)
  })

  it('TC-4740_4739 The user should able to create a new staff(no tag link) and view it', () => {
    HelperFunction.globalIntercept()
      //creating a staff and verifying for the same without linking to tag  -- Scenario 2
      ; ({ staffName, staffId, department, staffType } = staff2)
    Click.onContainText(button, staffAssignment)
    Click.forcefullyOn(addStaffMemberBtn)
    Verify.theElement(createBtn).isDisabled()
    StaffManagement.enterDetailsForStaff(staff2) //--staff details entered

    Verify.theElement(staffNameInputField).hasValue(staffName)
    Verify.theElement(staffIdInputField).hasValue(staffId)
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)

    Verify.theElement(confirmationPopup).contains(confirmationBeforeLinkingTag)
    Click.forcefullyOn(skipLinkTagBtn)
    Verify.theToast.showsToastMessage(messageAfterStaffCreation) //--assertion after staff  creation

    //verify the staff info from table
    HelperFunction.search(staffName)
    HelperFunction.getRowByItemName(staffName, resultRow, safety).as('result')
    valuesToVerify = { staffName, staffId, staffType, unLinked }
    HelperFunction.verifyValuesExist('@result', valuesToVerify)

    // Verify the staff info from side panel
    Click.forcefullyOn('@result')
    StaffManagement.verifyStaffDataFromSidePanel(staff2)
  })

  it('7350, TC-4742 The User should able to edit the staff data', () => {
    HelperFunction.globalIntercept()
    const { newStaffName: name1, newDepartment: department1, newStaffId: staffId1, newStaffType: staffType1 } = staff25
    const { newStaffName: name2, newDepartment: department2, newStaffId: staffId2, newStaffType: staffType2 } = staff27

      //test data creation
      ; ({ staffName, staffId, department, staffType } = staff3)
    StaffManagement.createStaff_API(staff3)
    StaffManagement.createStaff_API(staff26)

    valuesToVerify = { staffName, staffId, staffType, department, unLinked }
    HelperFunction.search(staffName)
    HelperFunction.getRowByItemName(staffName, resultRow, safety).as('results')
    HelperFunction.verifyValuesExist('@results', valuesToVerify)

    //editing staff details directly via table edit button
    StaffManagement.editStaffDetails(staff3, staff25, tableBtn, desktop)
    Verify.theToast.showsToastMessage(messageAfterUpdatingStaffDetails)
    staffName = name1
    // Verify the values after editing from table edit button
    valuesToVerify = { name1, department1, staffId1, staffType1, unLinked }
    HelperFunction.search(name1)
    HelperFunction.getRowByItemName(name1, resultRow, safety).as('editResults1')
    HelperFunction.verifyValuesExist('@editResults1', valuesToVerify)
    //delete the staff
    HelperFunction.deleteItem_API(staffName, staff)

    //editing staff details directly via side panel edit button
    StaffManagement.editStaffDetails(staff26, staff27, sidePanelBtn, desktop)
    Verify.theToast.showsToastMessage(messageAfterUpdatingStaffDetails)
    staffName = name2
    // Verify the values after editing from table edit button
    valuesToVerify = { name2, department2, staffType2, staffId2, unLinked }
    HelperFunction.search(name2)
    HelperFunction.getRowByItemName(name2, resultRow, safety).as('editResults2')
    HelperFunction.verifyValuesExist('@editResults2', valuesToVerify)
  })

  it('7351, TC-4748_ The user should able to delete the staff data', () => {
    HelperFunction.globalIntercept()
    //test data creation
    tagId = staffTag2.deviceId
    // tagDetails = staffTag2
    APIFunctions.createTags(staffTag2)

    listOfStaffDetailsForDeleteTestCase = Object.values(staffData.staffsForDeleteTestCase)
    listOfStaffDetailsForDeleteTestCase.forEach((staffs, index) => {
      StaffManagement.createStaff_API(staffs)
      if (index === 0) {
        HelperFunction.linkSensor_Tag_API(staffs.staffName, staff, tagId)
      }
    })

    staffName = listOfStaffDetailsForDeleteTestCase[0].staffName
    //try to delete a tagLinked staff from table  --Scenario 1
    StaffManagement.deleteStaff_StaffType(staffName, tableBtn, true)
    HelperFunction.unlinkTag_Sensor_API(staffName, staff)
    StaffManagement.deleteStaff_StaffType(staffName, tableBtn)
    Verify.theToast.showsToastMessage(messageAfterDeletingStaff)

    //delete a staff from edit menu ----Scenario 2
    staffName = listOfStaffDetailsForDeleteTestCase[1].staffName
    StaffManagement.deleteStaff_StaffType(staffName, editMenu)
    Verify.theToast.showsToastMessage(messageAfterDeletingStaff)

    //delete a staff from side panel ----Scenario 3
    staffName = listOfStaffDetailsForDeleteTestCase[2].staffName
    StaffManagement.deleteStaff_StaffType(staffName, sidePanelBtn)
    Verify.theToast.showsToastMessage(messageAfterDeletingStaff)
  })

  afterEach('it should clean test data after each test block', () => {
    if (staffName && tagId) HelperFunction.unlinkTag_Sensor_API(staffName, staff)

    if (staffName) HelperFunction.deleteItem_API(staffName, staff)

    if (tagId) HelperFunction.deleteItem_API(tagId, tag)
  })

  after('In case of any assertion failure it should clean test data for last IT block', () => {
    Object.values(staffData.staffsForDeleteTestCase).forEach((body) => {
      HelperFunction.deleteItem_API(body.staffName, staff)
    })
    if (tagId) HelperFunction.deleteItem_API(tagId, tag)
  })
})

describe('It should perform CRUD functionalities for Staff type page', () => {
  beforeEach('It should login to the Safety application and should clear the test data', () => {
    HelperFunction.globalIntercept()
    cy.session([username, password], () => {
      LoginPage.toVisit('/safety')
      LoginPage.doUserLogin(username, password)
      HelperFunction.navigateToModule(button, staffManagementModule)
    })

    LoginPage.toVisit('/safety')
    HelperFunction.navigateToModule(button, staffManagementModule)
    Verify.theUrl().includes(staffManagement)
    Click.onContainText(button, staffTypePage)
    Verify.theUrl().includes(staff_Type)
  })

  it('7356, SMARTHOSP-7870, TC-  The user should able to create a staff type', () => {
    HelperFunction.globalIntercept()
    staffTypeName = staffData.staffType.name1
    StaffManagement.createStaffType(staffTypeName)
    Verify.theToast.showsToastMessage(messageAFterCreatingStaffType)

    HelperFunction.search(staffTypeName)
    HelperFunction.getRowByItemName(staffTypeName, resultRow, safety).as('resultRow')
    Verify.theElement('@resultRow').contains(staffTypeName)
    Verify.theElement('@resultRow').hasChildClass(defaultSTaffIcon)
  })

  it('7357, SMARTHOSP-7871, TC- The user should able to edit a staff type', () => {
    HelperFunction.globalIntercept()
    staffTypeName = staffData.staffType.name2
    const newStaffTypeName = staffData.staffType.editStaffTypeName
    HelperFunction.createEquipment_Asset_StaffType_API(staffTypeName, staff)

    StaffManagement.editStaffType(staffTypeName, newStaffTypeName)
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
    Verify.theToast.showsToastMessage(messageAfterUpdatingStaffTypeDetails)
    staffTypeName = newStaffTypeName

    //verify the edit
    HelperFunction.search(staffTypeName)
    HelperFunction.getRowByItemName(staffTypeName, resultRow, safety).as('resultRow')
    Verify.theElement('@resultRow').contains(staffTypeName)
    Verify.theElement('@resultRow').hasChildClass(nurseIcon)
  })

  let staffTypeListForDeleteTestCase
  it('7358, SMARTHOSP-7872, TC- The user should able to delete a staff type', () => {
    HelperFunction.globalIntercept()
    //test data creation
    staffTypeListForDeleteTestCase = Object.values(staffData.staffType.staffTypeForDeleteTestCase)
    staffTypeListForDeleteTestCase.forEach((staffType) => {
      HelperFunction.createEquipment_Asset_StaffType_API(staffType, staff)
    })

    //deleting a staff type from staff type table
    staffTypeName = staffData.staffType.staffTypeForDeleteTestCase.name3
    StaffManagement.deleteStaff_StaffType(staffTypeName, undefined, undefined, staff_Type)
    Verify.theToast.showsToastMessage(messageAfterDeletingStaffType)

    //deleting a staff type from edit menu
    staffTypeName = staffData.staffType.staffTypeForDeleteTestCase.name4
    StaffManagement.deleteStaff_StaffType(staffTypeName, editMenu, undefined, staff_Type)
    Verify.theToast.showsToastMessage(messageAfterDeletingStaffType)
  })

  afterEach('It should clean test data after each test blocks', () => {
    if (staffTypeName) {
      HelperFunction.deleteEquipment_Asset_StaffType_API(staffTypeName, staff)
    }
  })

  after('In case of any assertion failure it should clean test data for last IT block', () => {
    cy.reload()
    Click.onContainText(button, staffTypePage)
    cy.fixture('prosightSafety/staffAssignment').then((staffTypeData) => {
      staffTypeListForDeleteTestCase = Object.values(staffTypeData.staffType.staffTypeForDeleteTestCase)
      staffTypeListForDeleteTestCase.forEach((staffTypeName) => {
        HelperFunction.deleteEquipment_Asset_StaffType_API(staffTypeName, staff)
      })
    })
  })
})

describe('It should perform operations on Tag management page', () => {
  beforeEach('It should login to the application before each test case run', () => {
    HelperFunction.globalIntercept()
    cy.session([username, password], () => {
      LoginPage.toVisit('/safety')
      LoginPage.doUserLogin(username, password)
      HelperFunction.navigateToModule(button, staffManagementModule)
    })
    LoginPage.toVisit('/safety')
    HelperFunction.navigateToModule(button, staffManagementModule)
    Verify.theUrl().includes(staffManagement)
  })
  it('7354, 7355, The user should able to link/unlink a tag to a staff', () => {
    HelperFunction.globalIntercept()
    //test data creation
    tagId = staffTag3.deviceId
      // tagDetails = staffTag3
      ; ({ staffName, staffId, department, staffType } = staff4)

    APIFunctions.createTags(staffTag3)
    // StaffManagement.createNewStaffAndLinkToTag(staff4)
    Click.forcefullyOn(addStaffMemberBtn)
    Verify.theElement(createBtn).isDisabled()
    StaffManagement.enterDetailsForStaff(staff4) //--staff details entered
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
    Verify.theElement(confirmationPopup).contains(confirmationBeforeLinkingTag)
    Click.forcefullyOn(linkTagBtnInConfirmationBox)
    Verify.theToast.showsToastMessage(messageAfterStaffCreation)

    //test case execution - linking a tag
    HelperFunction.navigateToModule(button, tagManagement)
    Verify.theUrl().includes(tag_Management)
    StaffManagement.linkUnlinkTag(staffName, link, tagId)
    Verify.theToast.showsToastMessage(messageAfterLinkingTag)
    valuesToVerify = { tagId, model, manufacturer, staffName }
    HelperFunction.getRowByItemName(tagId, resultRow, safety).as('tagRow')
    HelperFunction.verifyValuesExist('@tagRow', valuesToVerify)
    Click.forcefullyOn(doneButton)
    HelperFunction.search(tagId)
    HelperFunction.getRowByItemName(tagId, resultRow, safety).as('linkedTagRow')
    valuesToVerify = { ...valuesToVerify, linked }
    HelperFunction.verifyValuesExist('@linkedTagRow', valuesToVerify)

    StaffManagement.linkUnlinkTag(staffName, unlink, tagId) //unlinking a tag
    Verify.theToast.showsToastMessage(messageAfterUnlinkingTag)
    Click.forcefullyOn(linkUnlinkScreenBackBtn)
    valuesToVerify = {
      ...valuesToVerify,
      staffName: undefined,
      linked: undefined,
      unLinked,
    }
    HelperFunction.search(tagId, false)
    HelperFunction.getRowByItemName(tagId, resultRow, safety).as('unLinkedTagRow')
    HelperFunction.verifyValuesExist('@unLinkedTagRow', valuesToVerify)
  })

  it(`The user able to delete a tag from Tag management page`, () => {
    HelperFunction.globalIntercept()
    tagId = staffTag4.deviceId
    //create a tag
    APIFunctions.createTags(staffTag4)
    //Navigate to Tag Management Page
    HelperFunction.navigateToModule(button, tagManagement)
    //delete the tag
    StaffManagement.deleteTag(tagId)
    //verify the toast message for tag deletion
    Verify.theToast.showsToastMessage(messageAFterDeletingTag)
  })

  afterEach('it should clean test data after each test block', () => {
    if (staffName && tagId) HelperFunction.unlinkTag_Sensor_API(staffName, staff)

    if (staffName) HelperFunction.deleteItem_API(staffName, staff)

    if (tagId) HelperFunction.deleteItem_API(tagId, tag)
  })
})

after('Test data cleanup', () => {
  // delete the existing equipment type
  HelperFunction.deleteEquipment_Asset_StaffType_API(staffData.staff_Typee, staff)

  //Delete Room type
  FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)

  //Delete department
  FloorPlanManagement.deleteDepartment_API(staffData.departmentName)

  //Delete Floor
  FloorPlanManagement.deleteFloor_API(staffData.floorDetails.floorName, hospitalName)
})
