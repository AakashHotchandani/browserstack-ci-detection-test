/// <reference types="cypress" />
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import Click from '../../../../utils/Interactions/click'
import { Verify } from '../../../../utils/assertions'
import constants from '../../../../utils/constants/prosightSafety/staffManagementConst'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import globalSels from '../../../../utils/selectors/globalSels'
import prosightSafetySel from '../../../../utils/selectors/prosightSafety'
import APIFunctions from '../../../../pageObjects/prosightCore/triggeringAlerts'
import StaffManagement from '../../../../pageObjects/prosightSafety/staffManagementFns'
import commandOptions from '../../../../utils/constants/commandOptions'
import Type from '../../../../utils/Interactions/type'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import userData from '../../../../fixtures/SignIn/user.json'
import staffData from '../../../../fixtures/prosightSafety/staffAssignment_Mobile.json'
import globalConst from '../../../../utils/constants/globalConst'
import FloorPlanManagement from '../../../../pageObjects/prosightCore/floorPlanManagementFns'

let tagId = null,
  tagDetails,
  currStaffName,
  currTag,
  staffToUnlinkFromTag,
  currStaffType,
  staffTypeName,
  staffTypeIcon
const exist = commandOptions.exist
const { safety, unLinked, linked, staffType } = constants.uiText
const { button, createBtn, cardView, skipBtn, buttonTag, tagIdInput, linkBtn, viewport, hamburgerBtn, mobileSecondarySideNav } = globalSels
const { linkStaffToTagBtn, searchStaff } = prosightSafetySel.staffManagement
const {
  messageAFterCreatingStaffType,
  messageAfterUpdatingStaffTypeDetails,
  messageAFterDeletingTag,
  messageAfterDeletingStaffType,
  messageAfterStaffCreation,
  messageAfterLinkingTag,
  messageAfterUpdatingStaffDetails,
  messageAfterDeletingStaff,
} = constants.toastMessages
const { staff, tag } = leverageConstants.objectTypes
const { staffManagementModule, tagManagement, staffTypePage, staffAssignment } = prosightSafetySel.moduleBtnsText
const { staffManagement, smartLocation, tag_Management, staff_Type } = constants.urlText
const { addStaffMemberBtnMobile, createStaffTypeBtn } = prosightSafetySel.staffManagement.staffAssignment
const { nurseIcon, physicianIcon } = prosightSafetySel.staffType
const { hospitalName, buildingName } = globalConst.hospitalAndBuilding
const { username, password, name } = userData
const { locationDetails, floorDetails, roomDetails, departmentBoundaryName } = staffData

//deleting the test data before running the scripts
before('delete test data', () => {
  // delete the existing equipment type
  HelperFunction.deleteEquipment_Asset_StaffType_API(staffData.staff_Type, staff)

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

  // delete the existing staff type
  HelperFunction.deleteEquipment_Asset_StaffType_API(staffData.staff_Type, staff)

  //create the new staff type
  HelperFunction.createEquipment_Asset_StaffType_API(staffData.staff_Type, staff)
})

describe(
  'It should perform CRUD functionalities for Staff Assignment page of Staff Management in Mobileview',
  { viewportHeight: 667, viewportWidth: 375 },
  () => {
    beforeEach('It should login to the Safety application and should navigate the staff assignment page', () => {
      HelperFunction.globalIntercept()
      cy.session([username, password], () => {
        LoginPage.toVisit('/safety')
        LoginPage.doUserLogin(username, password)
        Verify.theUrl().includes(smartLocation)
        Verify.textPresent.isVisible(staffTypePage)
        Click.on(hamburgerBtn)
        Verify.textPresent.isVisible(name)

        //Select tha Hospital and Building
        HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)
        //Navigate to the Staff Assignment page
        HelperFunction.navigateToModule(button, staffManagementModule)
      })

      LoginPage.toVisit('/safety/')
      Click.on(hamburgerBtn)
      HelperFunction.navigateToModule(button, staffManagementModule)
      HelperFunction.navigateToModule(button, staffAssignment)
      Verify.theUrl().includes(staffManagement)
    })

    it('User should able to create a new Staff - SMARTHOSP-TC-4740', () => {
      const { staffName, staffId, department, staffType } = staffData.staff1
      const valuesToVerifyAsset = { staffName, staffId, department, staffType, unLinked }

      // Click on plus button to create a new Staff
      Click.forcefullyOn(addStaffMemberBtnMobile)

      // Enter the details of new staff and click on create button
      Verify.theElement(createBtn).isDisabled()
      StaffManagement.enterDetailsForStaff(staffData.staff1)
      Verify.theElement(createBtn).isEnabled()
      Click.forcefullyOn(createBtn)

      // Verify the staff successful creation message
      Verify.textPresent.isVisible(messageAfterStaffCreation)
      // Assign staff to delete the test data
      currStaffName = staffName

      // Click on skip button
      Click.on(skipBtn)

      // Search, select and verify perticular staff
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName, cardView, safety).should(exist).as('staffInfoCard')
      HelperFunction.verifyValuesInTheCardView('@staffInfoCard', valuesToVerifyAsset)
    })

    it('User should able to link a tag with staff at staff creation', () => {
      const { staffName, staffId, department, staffType } = staffData.staff2
      const valuesToVerifyStaff = { staffName, staffId, department, staffType, linked }
      tagId = staffData.staffTag5.deviceId
      tagDetails = staffData.staffTag5

      // Create a Tag using API method
      APIFunctions.createTags(tagDetails)
      // Assign the tag to delete the test data
      currTag = tagId

      // Click on plus button to create a new Staff
      Click.forcefullyOn(addStaffMemberBtnMobile)

      // Enter the details of new staff and click on create button
      Verify.theElement(createBtn).isDisabled()
      StaffManagement.enterDetailsForStaff(staffData.staff2)
      Verify.theElement(createBtn).isEnabled()
      Click.forcefullyOn(createBtn)

      // Verify the staff successful creation message
      Verify.textPresent.isVisible(messageAfterStaffCreation)
      // Assign staff to delete the test data
      currStaffName = staffName

      // Click on Link Staff to Tag button
      Click.onContainText(buttonTag, linkStaffToTagBtn)

      // Enter the Tag ID
      Type.theTextAndEnter(tagId).into(tagIdInput)

      //Verify the staff input has the correct the staff name
      Verify.theElement(searchStaff).hasValue(staffName)

      //check the Link button is enabled and click on that Link button
      Verify.elementContainingText(buttonTag, linkBtn).isEnabled()
      Click.onContainText(buttonTag, linkBtn)

      //Verify Toast message and click on Done button
      Verify.textPresent.isVisible(messageAfterLinkingTag)
      Click.onDoneButton()

      // Assign staff to unlink from Tag
      staffToUnlinkFromTag = staffName

      // Search, select and verify perticular staff
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName, cardView, safety).should(exist).as('staffInfoCard')
      HelperFunction.verifyValuesInTheCardView('@staffInfoCard', valuesToVerifyStaff)
    })

    it('User should be able to edit the staff details - SMARTHOSP-TC-4742', () => {
      const { staffName, staffId, department, staffType } = staffData.staff3
      const { newStaffName, newStaffId, newDepartment, newStaffType } = staffData.staffsForEditTestCase.staff4
      const valuesToVerifyOldAsset = { staffName, staffId, department, staffType, unLinked }
      const valuesToVerifyUpdatedAsset = { newStaffName, newStaffId, newDepartment, newStaffType, unLinked }

      // Create a staff through API
      StaffManagement.createStaff_API(staffData.staff3)
      // Assign staff to delete the test data
      currStaffName = staffName

      // Search, select and verify perticular staff
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName, cardView, safety).should(exist).as('staffInfoCard')
      HelperFunction.verifyValuesInTheCardView('@staffInfoCard', valuesToVerifyOldAsset)

      // Edit the staff details
      StaffManagement.editStaffDetails(staffData.staff3, staffData.staffsForEditTestCase.staff4, undefined, viewport.mobile)
      // Verify the toast message
      Verify.textPresent.isVisible(messageAfterUpdatingStaffDetails)
      // Assign staff to delete the test data
      currStaffName = newStaffName
      cy.log('staffName', currStaffName)

      //Search, select and verify perticular staff
      HelperFunction.search(newStaffName, false)
      HelperFunction.getRowByItemName(newStaffName, cardView, safety).should(exist).as('staffInfoCard')
      HelperFunction.verifyValuesInTheCardView('@staffInfoCard', valuesToVerifyUpdatedAsset)
      HelperFunction.deleteItem_API(staffData.staffsForEditTestCase.staff4, staff)
    })

    it('User should be able to link and unlink tag with staff - SMARTHOSP-TC-4587', () => {
      const { staffName, staffId, department, staffType } = staffData.staff5
      const verifyStaffDataAfterLink = { staffName, staffId, department, staffType, linked }
      const verifyStaffDataAfterUnLink = { staffName, staffId, department, staffType, unLinked }
      tagId = staffData.staffTag6.deviceId

      // Create a tag using API
      APIFunctions.createTags(staffData.staffTag6)
      // Assign current tag for test data cleanup
      currTag = tagId

      // Create a staff through API
      StaffManagement.createStaff_API(staffData.staff5)
      // Assign current staff name for test data cleanup
      currStaffName = staffName

      // link tag with staff
      HelperFunction.linkTagOrSenor_Mobile_UI(tagId, tag, staff, staffName)
      // Assign staff name for unlinking from tag
      staffToUnlinkFromTag = staffName

      //Search, select and verify perticular staff link with tag
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName, cardView, safety).should(exist).as('staffInfoCard')
      HelperFunction.verifyValuesInTheCardView('@staffInfoCard', verifyStaffDataAfterLink)

      //unlink staff with tag
      HelperFunction.unlinkTagOrSensor_Mobile_UI(staff, staffName, tagId)

      //Search, select and verify perticular staff after unlink with tag
      HelperFunction.search(staffName, false)
      HelperFunction.getRowByItemName(staffName, cardView, safety).should(exist).as('staffInfoCard')
      HelperFunction.verifyValuesInTheCardView('@staffInfoCard', verifyStaffDataAfterUnLink)
    })

    it('User should be able to delete the Staff - SMARTHOSP-TC-4748', () => {
      const { staffName } = staffData.staff6

      // Create a staff through API
      StaffManagement.createStaff_API(staffData.staff6)
      // Assign current staff name for test data cleanup
      currStaffName = staffName

      // delete the staff
      StaffManagement.deleteStaffOrStaffTypeInMobile(staffName)
      //verify the toast message
      Verify.theToast.showsToastMessage(messageAfterDeletingStaff)

      // Reset test data assignment after successful staff deletion
      currStaffName = null
    })

    it('User should unable to delete the staff which is linked a Tag', () => {
      const { staffName } = staffData.staff7
      tagId = staffData.staffTag7.deviceId

      // Create a tag using API
      APIFunctions.createTags(staffData.staffTag7)
      // Assign current tag for test data cleanup
      currTag = tagId

      // Create a staff through API
      StaffManagement.createStaff_API(staffData.staff7)
      // Assign current staff name for test data cleanup
      currStaffName = staffName

      //link a staff with tag
      HelperFunction.linkSensor_Tag_API(staffName, staff, tagId)
      // Assign staff name for unlinking from tag
      staffToUnlinkFromTag = staffName

      // Try to delete the tag linked staff
      StaffManagement.deleteStaffOrStaffTypeInMobile(staffName, true)
    })

    afterEach('it should clean test data after each test block', () => {
      if (staffToUnlinkFromTag) HelperFunction.unlinkTag_Sensor_API(staffToUnlinkFromTag, staff)

      if (currStaffName) HelperFunction.deleteItem_API(currStaffName, staff)

      if (currTag) HelperFunction.deleteItem_API(currTag, tag)
    })
  }
)

describe('It should perform operations on Tag management page of Staff Management in Mobileview', { viewportHeight: 667, viewportWidth: 375 }, () => {
  beforeEach('It should login to the Safety application and should navigate the  Tag management submodule of staff assignment module', () => {
    HelperFunction.globalIntercept()
    cy.session([username, password], () => {
      LoginPage.toVisit('/safety')
      LoginPage.doUserLogin(username, password)
      Verify.theUrl().includes(smartLocation)
      Verify.textPresent.isVisible(staffTypePage)
      Click.on(hamburgerBtn)
      Verify.textPresent.isVisible(name)

      //Select tha Hospital and Building
      HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)
      //Navigate to the Staff Assignment page
      HelperFunction.navigateToModule(button, staffManagementModule)
    })

    LoginPage.toVisit('/safety/')
    Click.on(hamburgerBtn)
    HelperFunction.navigateToModule(button, staffManagementModule)
    HelperFunction.navigateToModule(button, tagManagement)
    Verify.theUrl().includes(tag_Management)
  })

  it('User should be able to link and unlink tag with staff from Tag management page', () => {
    tagId = staffData.staffTag8.deviceId
    const { manufacturer, model } = staffData.staffTag8
    const { staffName } = staffData.staff9
    const verifyTagDataAfterLink = { staffName, linked }
    const verifyTagDataAfterUnLink = { tagId, manufacturer, model, unLinked }

    // Create a tag using API
    APIFunctions.createTags(staffData.staffTag8)
    // Assign current tag for test data cleanup
    currTag = tagId

    // Create a staff through API
    StaffManagement.createStaff_API(staffData.staff9)
    // Assign current staff name for test data cleanup
    currStaffName = staffName

    // link tag with staff
    HelperFunction.linkTagOrSenor_Mobile_UI(tagId, tag, staff, staffName)
    // Assign staff name for unlinking from tag
    staffToUnlinkFromTag = staffName

    //Search, select and verify perticular staff link with tag
    HelperFunction.search(tagId, false)
    HelperFunction.getRowByItemName(tagId, cardView, safety).should(exist).as('staffInfoCard')
    HelperFunction.verifyValuesInTheCardView('@staffInfoCard', verifyTagDataAfterLink)

    //unlink staff with tag
    HelperFunction.unlinkTagOrSensor_Mobile_UI(staff, staffName, tagId)

    //Search, select and verify perticular staff after unlink with tag
    HelperFunction.search(tagId, false)
    HelperFunction.getRowByItemName(tagId, cardView, safety).should(exist).as('staffInfoCard')
    HelperFunction.verifyValuesInTheCardView('@staffInfoCard', verifyTagDataAfterUnLink)
  })

  it('User should be able to delete the Tag', () => {
    const tagId = staffData.staffTag9.deviceId

    //create Tag through API
    APIFunctions.createTags(staffData.staffTag9)
    // Assign current tag for test data cleanup
    currTag = tagId

    //delete the tag
    StaffManagement.deleteTagInMobile(tagId, false)

    //verify the toast message
    Verify.theToast.showsToastMessage(messageAFterDeletingTag)
  })

  it('User should unable to delete the Staff linked Tag', () => {
    const tagId = staffData.staffTag10.deviceId
    const { staffName } = staffData.staff10

    // Create a tag using API
    APIFunctions.createTags(staffData.staffTag10)
    // Assign current tag for test data cleanup
    currTag = tagId

    // Create a staff through API
    StaffManagement.createStaff_API(staffData.staff10)
    // Assign current staff name for test data cleanup
    currStaffName = staffName

    //link a tag with Staff using API
    HelperFunction.linkSensor_Tag_API(staffName, staff, tagId)
    // Assign staff name for unlinking from tag
    staffToUnlinkFromTag = staffName

    // Try to delete the staff linked tag
    StaffManagement.deleteTagInMobile(tagId, true)

    //Unlink a tag with Staff using API
    HelperFunction.unlinkTag_Sensor_API(staffName, staff)

    // Delete the tag (Here the Tag is unlinked with staff)
    StaffManagement.deleteTagInMobile(tagId, false)

    // Verify the toast message
    Verify.theToast.showsToastMessage(messageAFterDeletingTag)
    // Reset the current staff name to null after successful tag deletion
    currStaffName = null
  })

  afterEach('it should clean test data after each test block', () => {
    if (staffToUnlinkFromTag) HelperFunction.unlinkTag_Sensor_API(staffToUnlinkFromTag, staff)

    if (currStaffName) HelperFunction.deleteItem_API(currStaffName, staff)

    if (currTag) HelperFunction.deleteItem_API(currTag, tag)
  })
})

describe(
  'It should perform CRUD functionalities for Staff type page of Staff Management module in Mobile view',
  { viewportHeight: 667, viewportWidth: 375 },
  () => {
    beforeEach('It should login to the Safety application and should navigate the staff assignment page', () => {
      HelperFunction.globalIntercept()
      cy.session([username, password], () => {
        LoginPage.toVisit('/safety')
        LoginPage.doUserLogin(username, password)
        Verify.theUrl().includes(smartLocation)
        Verify.textPresent.isVisible(staffTypePage)
        Click.on(hamburgerBtn)
        Verify.textPresent.isVisible(name)

        //Select tha Hospital and Building
        HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)
        //Navigate to the Staff Assignment page
        HelperFunction.navigateToModule(button, staffManagementModule)
      })

      LoginPage.toVisit('/safety/')
      Click.on(hamburgerBtn)
      HelperFunction.navigateToModule(button, staffManagementModule)
      Click.onContainText(mobileSecondarySideNav, staffTypePage)
      Verify.theUrl().includes(staff_Type)
    })

    it('user should be able to create a new staff type - SMARTHOSP-TC-2976', () => {
      staffTypeName = staffData.staffTypeData.name1
      staffTypeIcon = nurseIcon

      // Create new Staff Type
      StaffManagement.createStaffType(staffTypeName, staffTypeIcon)
      // Assign staff type name to delete the test data
      currStaffType = staffTypeName
      //verify toast message
      Verify.textPresent.isVisible(messageAFterCreatingStaffType)

      // Search, select and verify staff type
      HelperFunction.search(staffTypeName, false)
      HelperFunction.getRowByItemName(staffTypeName, cardView, safety).should(exist).as('staffTypeCard')
      Verify.theElement('@staffTypeCard').contains(staffTypeName)
      Verify.theElement('@staffTypeCard').hasChildClass(staffTypeIcon)
    })

    it('User should be able to edit staff Type - SMARTHOSP-TC-3402 ', () => {
      staffTypeName = staffData.staffTypeData.name2
      staffTypeIcon = nurseIcon
      const newStaffTypeName = staffData.staffTypeData.name3
      const newStaffIcon = prosightSafetySel.staffType.physicianIcon

      // Test data creation
      HelperFunction.createEquipment_Asset_StaffType_API(staffTypeName, staff)
      // Assign staff type name to delete the test data
      currStaffType = staffTypeName

      // Edit staff Type details
      StaffManagement.editStaffType(staffTypeName, newStaffTypeName, newStaffIcon, viewport.mobile)
      Verify.theElement(createBtn).isEnabled()
      Click.forcefullyOn(createBtn)
      Verify.theToast.showsToastMessage(messageAfterUpdatingStaffTypeDetails)
      currStaffType = newStaffTypeName

      // Search, select and verify staff type
      HelperFunction.search(newStaffTypeName, false)
      HelperFunction.getRowByItemName(newStaffTypeName, cardView, safety).should(exist).as('staffTypeCard')
      Verify.theElement('@staffTypeCard').contains(newStaffTypeName)
      Verify.theElement('@staffTypeCard').hasChildClass(newStaffIcon)
    })

    it('User should be able to delete the Staff Type - SMARTHOSP-TC-4931', () => {
      staffTypeName = staffData.staffTypeData.name5

      //Test data creation
      HelperFunction.createEquipment_Asset_StaffType_API(staffTypeName, staff)
      // Assign staff type name to delete the test data
      currStaffType = staffTypeName

      // Delete staffType
      StaffManagement.deleteStaffOrStaffTypeInMobile(staffTypeName, false, staffType)
      // Verify toast message
      Verify.textPresent.isVisible(messageAfterDeletingStaffType)
      // reAssign curr staff type with null after successful deletion
      currStaffType = null
    })

    it('User Should unable to delete the Staff type which associated with Staff', () => {
      staffTypeName = staffData.staffTypeData.name6

      // Test data creation
      HelperFunction.createEquipment_Asset_StaffType_API(staffTypeName, staff)
      // Assign staff type name to delete the test data
      currStaffType = staffTypeName

      //  Use the created staff type in staff creation
      StaffManagement.createStaff_API(staffData.staff8)
      currStaffName = staffData.staff8.staffName

      // Try to delete the staff type which is associated with a staff
      StaffManagement.deleteStaffOrStaffTypeInMobile(staffTypeName, true, staffType)
    })

    afterEach('it should clean test data after each test block', () => {
      if (currStaffName) {
        HelperFunction.deleteItem_API(currStaffName, staff)
      }
      if (currStaffType) {
        HelperFunction.deleteEquipment_Asset_StaffType_API(currStaffType, staff)
      }
    })

    after('Test data cleanup', () => {
      // delete the existing equipment type
      HelperFunction.deleteEquipment_Asset_StaffType_API(staffData.staff_Type, staff)

      //Delete Room type
      FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)

      //Delete department
      FloorPlanManagement.deleteDepartment_API(staffData.departmentName)

      //Delete Floor
      FloorPlanManagement.deleteFloor_API(staffData.floorDetails.floorName, hospitalName)
    })
  }
)

describe(
  'Execute create a new Staff type functionality on the staff assignment page to in mobile view',
  { viewportHeight: 667, viewportWidth: 375 },
  () => {
    beforeEach('It should login to the Safety application and should navigate the staff assignment page', () => {
      HelperFunction.globalIntercept()
      cy.session([username, password], () => {
        LoginPage.toVisit('/safety')
        LoginPage.doUserLogin(username, password)
        Verify.theUrl().includes(smartLocation)
        Verify.textPresent.isVisible(staffTypePage)
        Click.on(hamburgerBtn)
        Verify.textPresent.isVisible(name)

        //Select tha Hospital and Building
        HelperFunction.selectBuildingFromGlobalFilterInMobile(hospitalName, buildingName)
        //Navigate to the Staff Assignment page
        HelperFunction.navigateToModule(button, staffManagementModule)
      })

      LoginPage.toVisit('/safety/')
      Click.on(hamburgerBtn)
      HelperFunction.navigateToModule(button, staffManagementModule)
      HelperFunction.navigateToModule(button, staffAssignment)
      Verify.theUrl().includes(staffManagement)
    })

    afterEach('it should clean test data after each test block', () => {
      if (currStaffType) {
        HelperFunction.deleteEquipment_Asset_StaffType_API(currStaffType, staff)
      }
    })

    it('User should be able to create new Staff type from staff Assignment page ', () => {
      staffTypeName = staffData.staffTypeData.name4
      staffTypeIcon = physicianIcon

      // Click on plus button (create new staff)
      Click.forcefullyOn(addStaffMemberBtnMobile)

      //Click on Create StaffType button in staff creation form
      Click.forcefullyOn(createStaffTypeBtn)

      // Create new Staff Type
      StaffManagement.createStaffType(staffTypeName, staffTypeIcon, staffAssignment)
      // Assign staff type name to delete the test data
      currStaffType = staffTypeName

      //verify toast message
      Verify.textPresent.isVisible(messageAFterCreatingStaffType)
    })
  }
)

after('Test data cleanup', () => {
  // delete the existing equipment type
  HelperFunction.deleteEquipment_Asset_StaffType_API(staffData.staff_Type, staff)

  //Delete Room type
  FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)

  //Delete department
  FloorPlanManagement.deleteDepartment_API(staffData.departmentName)

  //Delete Floor
  FloorPlanManagement.deleteFloor_API(staffData.floorDetails.floorName, hospitalName)
})
