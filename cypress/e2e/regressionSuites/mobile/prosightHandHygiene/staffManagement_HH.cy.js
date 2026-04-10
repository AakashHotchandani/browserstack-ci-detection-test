/// <reference types="cypress" />
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import { Verify } from '../../../../utils/assertions'
import Click from '../../../../utils/Interactions/click'
import globalSels from '../../../../utils/selectors/globalSels'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import StaffManagement from '../../../../pageObjects/prosightSafety/staffManagementFns'
import userData from '../../../../fixtures/SignIn/user.json'
import staffManagementConst from '../../../../utils/constants/prosightSafety/staffManagementConst'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import staffData from '../../../../fixtures/prosightHandHygiene/staffManagement.json'
import prosightSafetySels from '../../../../utils/selectors/prosightSafety'
import globalConst from '../../../../utils/constants/globalConst'

let newStaffName, valuesToVerify, staffName, staffId, staffType, department, currentTestData, staffTypeName
const { smartCompliance, staff_Assignment, staff_Type } = staffManagementConst.urlText
const { staffManagementText, staffAssignment, smartComplianceText } = staffManagementConst.buttonInnerText
const { button, hamburgerBtn, cardView, createBtn, cancelButton, skipBtn, saveBtn, divTag } = globalSels
const {
  messageAfterUpdatingStaffDetails,
  messageAfterStaffCreation,
  messageAfterDeletingStaffType,
  messageAFterCreatingStaffType,
  messageAfterDeletingStaff,
  messageAfterUpdatingStaffTypeDetails,
} = staffManagementConst.toastMessages
const { handHygiene, unLinked, staffTypes, staffType: typeStaff } = staffManagementConst.uiText
const { username, password } = userData
const { staff } = leverageConstants.objectTypes
const { tableBtn } = globalConst.delete_EditActions
const { addStaffMemberBtnMobile } = prosightSafetySels.staffManagement.staffAssignment
const { nurseIcon } = prosightSafetySels.staffType
const { editMenu } = globalConst.delete_EditActions
const { mobile } = globalSels.viewport
const { defaultSTaffIcon } = prosightSafetySels.staffType

describe('Should perform CURD functionalities on HH staff assignment page', { viewportHeight: 667, viewportWidth: 400 }, () => {
  beforeEach('It should login to the application', () => {
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/compliance')
    LoginPage.doUserLogin(username, password)
    Verify.theUrl().includes(smartCompliance)
    Click.on(hamburgerBtn)
    Click.onContainText(button, smartComplianceText)
    HelperFunction.navigateToModule(button, staffManagementText)
  })

  afterEach('It should clean test data', () => {
    if (staffName) {
      HelperFunction.deleteItem_API(staffName, staff)
    }
  })

  it('User should be able to create new staff data without tag linking- SMARTHOSP-Tc-9037', () => {
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, staffAssignment)
    Verify.theUrl().includes(staff_Assignment)
    //Click on add icon
    Click.on(addStaffMemberBtnMobile)
    //Verify create button is disabled
    Verify.theElement(createBtn).isDisabled()
    //Verify cancel button is enabled
    Verify.theElement(cancelButton).isEnabled()
    ;({ staffName, staffId, department, staffType } = staffData.staff2)

    //Creating staff
    StaffManagement.enterDetailsForStaff(staffData.staff2)
    //Verify create button is enabled
    Verify.theElement(createBtn).isEnabled()
    //Click on create button
    Click.forcefullyOn(createBtn)

    // Click on the skip button to not link staff with a tag
    Click.forcefullyOn(skipBtn)

    // Verify the successful staff creation toast message
    Verify.theToast.showsToastMessage(messageAfterStaffCreation)

    // Search and verify the particular staff
    valuesToVerify = { staffName, staffId, staffType, department, unLinked }
    HelperFunction.search(staffName, false)
    HelperFunction.getRowByItemName(staffName, cardView, handHygiene).as('staffInfoCard')
    HelperFunction.verifyValuesInTheCardView('@staffInfoCard', valuesToVerify)
  })

  it('User should be able to edit staff data-SMARTHOSP-tc-9061', () => {
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, staffAssignment)
    Verify.theUrl().includes(staff_Assignment)

    //Creating test data
    StaffManagement.createStaff_API(staffData.staff10)
    ;({ staffName } = staffData.staff10)

    //Editing staff
    StaffManagement.editStaffDetails(staffData.staff10, staffData.editStaffData, tableBtn, mobile)

    // Verify the toast message
    Verify.theToast.showsToastMessage(messageAfterUpdatingStaffDetails)
    ;({ newStaffName } = staffData.editStaffData)
    staffName = newStaffName

    // Verifying after editing the staff
    HelperFunction.search(staffData.editStaffData.newStaffName, false)
    HelperFunction.getRowByItemName(staffData.editStaffData.newStaffName, cardView, handHygiene).as('staffInfoCard')
    HelperFunction.verifyValuesInTheCardView('@staffInfoCard', staffData.editStaffData)
  })

  it('User Should be able to delete staff - SMARTHOSP-TC-9069', () => {
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, staffAssignment)
    Verify.theUrl().includes(staff_Assignment)

    //Creating test data
    StaffManagement.createStaff_API(staffData.staff2)
    ;({ staffName } = staffData.staff2)

    //Deleting staff
    StaffManagement.deleteStaffOrStaffTypeInMobile(staffName)

    // Verify the toast message
    Verify.theToast.showsToastMessage(messageAfterDeletingStaff)
  })
})

describe('It should perform CRUD functionalities on HH-Staff type page', { viewportHeight: 667, viewportWidth: 400 }, () => {
  beforeEach('It should login to the application', () => {
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/compliance')
    LoginPage.doUserLogin(username, password)
    Verify.theUrl().includes(smartCompliance)
    Click.on(hamburgerBtn)
    Click.onContainText(button, smartComplianceText)
    HelperFunction.navigateToModule(button, staffManagementText)
  })

  afterEach('It should clear the test data', () => {
    if (staffName) {
      HelperFunction.deleteItem_API(staffName, staff)
    }
    if (staffTypeName) {
      HelperFunction.deleteEquipment_Asset_StaffType_API(staffTypeName, staff)
    }
    if (currentTestData) {
      HelperFunction.deleteEquipment_Asset_StaffType_API(currentTestData, staff)
    }
  })

  it('User should be able to create staff type data- SMARTHOSP-TC-9071', () => {
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, staffTypes)
    Verify.theUrl().includes(staff_Type)

    staffTypeName = staffData.staffTypeTestData.createStaffType.type1
    StaffManagement.createStaffType(staffTypeName)
    Verify.theToast.showsToastMessage(messageAFterCreatingStaffType)

    //verifying the created staff type
    HelperFunction.search(staffTypeName, false)
    HelperFunction.getRowByItemName(staffTypeName, cardView, handHygiene).as('resultRow')
    Verify.theElement('@resultRow').contains(staffTypeName)
    Verify.theElement('@resultRow').hasChildClass(defaultSTaffIcon)
  })

  it('User should be able to update staff type data SMARTHOSP-TC-9081', () => {
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, staffTypes)
    Verify.theUrl().includes(staff_Type)

    //creating test data
    currentTestData = staffData.staffTypeTestData.deleteStaffTypes.type1
    const newStaffTypeName = staffData.staffTypeTestData.editStaffType.type2
    HelperFunction.createEquipment_Asset_StaffType_API(currentTestData, staff)

    //finding and editing the staff type
    StaffManagement.editStaffType(currentTestData, newStaffTypeName, nurseIcon, mobile)
    Verify.theElement(saveBtn).isEnabled()
    Click.forcefullyOn(saveBtn)
    Verify.theToast.showsToastMessage(messageAfterUpdatingStaffTypeDetails)

    //verifying the edited data
    staffTypeName = newStaffTypeName
    HelperFunction.search(staffTypeName, false)
    HelperFunction.getRowByItemName(staffTypeName, divTag, handHygiene).as('resultRow')
    Verify.theElement('@resultRow').contains(staffTypeName)
    Verify.theElement('@resultRow').hasChildClass(nurseIcon)
  })

  it('User should not be able to delete staff type that is linked to a staff SMARTHOSP-9092', () => {
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, staffTypes)
    Verify.theUrl().includes(staff_Type)

    //creating test data
    staffTypeName = staffData.staffTypeTestData.staff9.staffType
    staffName = staffData.staffTypeTestData.staff9.staffName
    HelperFunction.createEquipment_Asset_StaffType_API(staffTypeName, staff)
    StaffManagement.createStaff_API(staffData.staffTypeTestData.staff9)

    // Deleting staffType that is linked to a staff.
    HelperFunction.search(staffTypeName, false)
    StaffManagement.deleteStaffOrStaffTypeInMobile(staffTypeName, true, staffTypes)
  })

  it('User should be able to delete staff type data SMARTHOSP-TC-9077', () => {
    HelperFunction.globalIntercept()
    HelperFunction.navigateToModule(button, staffTypes)
    Verify.theUrl().includes(staff_Type)
    currentTestData = staffData.staffTypeTestData.deleteStaffTypes.type1

    //creating test data
    HelperFunction.createEquipment_Asset_StaffType_API(currentTestData, staff)

    //deleting the staff type
    StaffManagement.deleteStaffOrStaffTypeInMobile(currentTestData)
    Verify.theToast.showsToastMessage(messageAfterDeletingStaffType)
  })
})
