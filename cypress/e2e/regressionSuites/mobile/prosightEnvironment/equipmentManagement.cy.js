/// <reference types="cypress" />
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import { Verify } from '../../../../utils/assertions'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import globalSels from '../../../../utils/selectors/globalSels'
import constants from '../../../../utils/constants/prosightEnvironment/equipmentAssignmentConst'
import environmentSelector from '../../../../utils/selectors/prosightEnvironment'
import Click from '../../../../utils/Interactions/click'
import EquipmentManagement from '../../../../pageObjects/prosightEnvironment/equipmentManagementFns'
import Type from '../../../../utils/Interactions/type'
import sensorData from '../../../../fixtures/prosightEnvironment/sensorData.json'
import DeviceManagement from '../../../../pageObjects/prosightCore/deviceManagement'
import equipmentData from '../../../../fixtures/prosightEnvironment/equipment_data.json'
import userData from '../../../../fixtures/SignIn/user.json'
import globalConst from '../../../../utils/constants/globalConst'
import FloorPlanManagement from '../../../../pageObjects/prosightCore/floorPlanManagementFns'

let currEquipmentName, currSensor, equipmentToUnlinkFromSensor, currEquipmentType
const { smartMonitoring, environment, equipment_Type } = constants.urlText
const { equipmentManagement, equipmentAssignment, sensorManagement, equipmentType } = environmentSelector.moduleButtonText
const {
  addNewEquipmentBtnMobile,
  locationDropdown,
  assignedOwnerDropdown,
  floorDropdown,
  linkEquipmentToSensorBtn,
  searchEquipment,
  createEquipmentTypeBtn,
} = environmentSelector.equipmentManagement.equipmentAssignment
const {
  button,
  hamburgerBtn,
  createBtn,
  viewport,
  cardView,
  skipBtn,
  saveBtn,
  editIconBtn,
  sensorIdInput,
  linkBtn,
  buttonTag,
  mobileSecondarySideNav,
  deleteIcon,
  confirmationPopup,
} = globalSels
const { equipment, unLinked, linked, sensor } = constants.uiText
const {
  messageAfterCreatingEquipment,
  messageAfterUpdatingEquipmentDetails,
  messageAfterDeletingEquipment,
  messageAfterLinkingSensor,
  messageAfterCreatingEquipmentType,
  messageAfterUpdatingEquipmentTypeDetails,
  messageAfterDeletingEquipmentType,
  messageAfterDeletingSensor,
} = constants.toastMessages
const { genericIconClass, freezerIcon, fluidBathIcon } = environmentSelector.equipmentManagement.equipment_type
const { create, edit } = constants.actions
const { hospitalName, buildingName } = globalConst.hospitalAndBuilding
const { username, name, password } = userData
const { locationDetails, floorDetails, roomDetails, departmentBoundaryName } = equipmentData
const { confirmationMessageBeforeDeletingSensor } = constants.confirmationMessages

//Deleting test data before running the scripts
before('Test data cleanup', () => {
  // delete the existing equipment type
  HelperFunction.deleteEquipment_Asset_StaffType_API(equipmentData.equipment_Type, equipment)

  //Delete Room type
  FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)

  //Delete department
  FloorPlanManagement.deleteDepartment_API(equipmentData.departmentName)

  //Delete Floor
  FloorPlanManagement.deleteFloor_API(equipmentData.floorDetails.floorName, hospitalName)
})

describe('It should perform CRUD operations on Equipment assignment page', { viewportHeight: 667, viewportWidth: 375 }, () => {
  before('create a new equipment type, floor, assigned owner and location ', () => {
    HelperFunction.createEquipment_Asset_StaffType_API(equipmentData.equipment_Type, equipment)

    //Create Department
    FloorPlanManagement.createDepartment_API(equipmentData.departmentName, equipmentData.buildingName)

    //Create Room type
    FloorPlanManagement.createRoomType_API(roomDetails)

    //Create floor and room
    FloorPlanManagement.createFloor_API(
      floorDetails,
      locationDetails,
      equipmentData.hospitalName,
      equipmentData.buildingName,
      equipmentData.departmentName
    )

    //create department boundaries
    FloorPlanManagement.createDepartmentBoundary_API(departmentBoundaryName, equipmentData.departmentName, floorDetails.floorName)

    // delete the existing equipment type
    HelperFunction.deleteEquipment_Asset_StaffType_API(equipmentData.equipment_Type, equipment)
    //create the new equipment type
    HelperFunction.createEquipment_Asset_StaffType_API(equipmentData.equipment_Type, equipment)
  })

  beforeEach('It should login to the Environment application and should clear the test data', () => {
    cy.session('login-session', () => {
      HelperFunction.globalIntercept()
      //login to the prosight Environment application
      LoginPage.toVisit('/environment/')
      LoginPage.doUserLogin(username, password)
      Verify.theUrl().includes(smartMonitoring)
      Verify.textPresent.isVisible(equipmentType)
      Click.on(hamburgerBtn)

      //Verify the username after login
      Verify.textPresent.isVisible(name)
    })
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/environment/')
    Click.on(hamburgerBtn)
    //Navigate to the equipment management module
    HelperFunction.navigateToModule(button, equipmentManagement)
    Verify.theUrl().includes(environment)
    HelperFunction.navigateToModule(button, equipmentAssignment)
  })

  afterEach('It should delete the created test data', () => {
    if (currEquipmentName) HelperFunction.deleteItem_API(currEquipmentName, equipment)

    if (equipmentToUnlinkFromSensor) HelperFunction.unlinkTag_Sensor_API(equipmentToUnlinkFromSensor, equipment)

    if (currSensor) HelperFunction.deleteItem_API(currSensor, sensor)

    if (currEquipmentType) HelperFunction.deleteEquipment_Asset_StaffType_API(currEquipmentType, equipment)
  })

  it('user should be able to create new equipment', () => {
    const { equipmentName, id, type, department } = equipmentData.equip9
    const verifyEquipmentValues = { equipmentName, id, type, department, unLinked }

    HelperFunction.minimizeCarouselIfVisible()

    // Click on the plus button to create new equipment
    Click.forcefullyOn(addNewEquipmentBtnMobile)

    // Check if floor, assigned owner, and create button are in disabled state before entering the values
    Verify.theElement(floorDropdown).isDisabled()
    Verify.theElement(assignedOwnerDropdown).isDisabled()
    Verify.theElement(locationDropdown).isDisabled()
    Verify.theElement(createBtn).isDisabled()

    // Enter the equipment details
    EquipmentManagement.fillEquipmentDetails(equipmentData.equip9, viewport.mobile)
    //click on create button
    Click.forcefullyOn(createBtn)
    // Verify the successful equipment creation message
    Verify.textPresent.isVisible(messageAfterCreatingEquipment)

    // Assign equipment name to delete test data later
    currEquipmentName = equipmentName

    // Click on the skip button to not link equipment with a sensor
    Click.forcefullyOn(skipBtn)

    // Search, select, and verify the particular equipment
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, cardView, environment).as('equipmentInfoCard')
    HelperFunction.verifyValuesInTheCardView('@equipmentInfoCard', verifyEquipmentValues)
  })

  it('User should be able to update the Equipment - SMARTHOSP-TC-6725', () => {
    const { equipmentName } = equipmentData.equip10
    const { newEquipmentName } = equipmentData.equipmentsForEditCase.equip11

    //create test data
    EquipmentManagement.createEquipment_API(equipmentData.equip10)
    // Assign equipment name to delete test data
    currEquipmentName = equipmentName

    //edit the equipment details
    EquipmentManagement.editEquipment(equipmentData.equip10, equipmentData.equipmentsForEditCase.equip11, viewport.mobile)
    // Verify the successful toast message of equipment update
    Verify.theToast.showsToastMessage(messageAfterUpdatingEquipmentDetails)
    // reassign updated equipment name to delete test data
    currEquipmentName = newEquipmentName
  })

  it('User should be able to link sensor with equipment at equipment creation', () => {
    const { equipmentName, id, type, department } = equipmentData.equip15
    const { sensorId } = sensorData.sensor8
    const verifyEquipmentValues = { equipmentName, id, type, department, linked, sensorId }

    //create a sensor
    DeviceManagement.createSensor_API(sensorData.sensor8)
    // Assign sensor name to delete test data
    currSensor = sensorId
    cy.reload()

    // Click on the plus button to create new equipment
    Click.forcefullyOn(addNewEquipmentBtnMobile)
    //verify the create button is disabled
    Verify.theElement(createBtn).isDisabled()
    // Enter the equipment details
    EquipmentManagement.fillEquipmentDetails(equipmentData.equip15, viewport.mobile)
    //click on create button
    Click.forcefullyOn(createBtn)
    // Verify the successful equipment creation message
    Verify.textPresent.isVisible(messageAfterCreatingEquipment)
    // Assign equipment name to delete test data
    currEquipmentName = equipmentName

    //click on Link Equipment to Sensor button to link equipment with sensor
    Click.forcefullyOn(linkEquipmentToSensorBtn)

    //Enter sensor ID
    Type.theTextAndEnter(sensorId).into(sensorIdInput)
    //Verify the equipment input has the correct equipment name
    Verify.theElement(searchEquipment).hasValue(equipmentName)

    //check the Link button is enabled and click on that Link button
    Verify.elementContainingText(buttonTag, linkBtn).isEnabled()
    Click.onContainText(buttonTag, linkBtn)

    //Verify the successful linked message and click on Done button
    Verify.textPresent.isVisible(messageAfterLinkingSensor)
    Click.onDoneButton()
    //assign equipment name to unlink from sensor
    equipmentToUnlinkFromSensor = equipmentName
    cy.reload()

    // Search, select and verify the equipment
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, cardView, environment).as('equipmentRow')
    HelperFunction.verifyValuesInTheCardView('@equipmentRow', verifyEquipmentValues)
  })

  it('User should be able to link and unlink equipment with sensor', () => {
    const { equipmentName, id, type, departmentName } = equipmentData.equip12
    const { sensorId } = sensorData.sensor6
    let valuesToVerify = { equipmentName, id, type, departmentName, linked, sensorId }

    // create a test data
    EquipmentManagement.createEquipment_API(equipmentData.equip12)
    // Assign equipment name to delete test data
    currEquipmentName = equipmentName

    //create a sensor
    DeviceManagement.createSensor_API(sensorData.sensor6)
    // Assign sensor name to delete test data
    currSensor = sensorId
    cy.reload()

    //link equipment with sensor
    HelperFunction.linkTagOrSenor_Mobile_UI(sensorId, sensor, equipment, equipmentName)
    //assign equipment name to unlink from sensor
    equipmentToUnlinkFromSensor = equipmentName
    cy.reload()

    //Search, select and verify perticular equipment linked with sensor
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, cardView, environment).as('equipmentInfoCard')
    HelperFunction.verifyValuesInTheCardView('@equipmentInfoCard', valuesToVerify)

    //unlink equipment from sensor
    HelperFunction.unlinkTagOrSensor_Mobile_UI(equipment, equipmentName, sensorId)

    //verification values of equipment after unlink from sensor
    valuesToVerify = { ...valuesToVerify, unLinked, linked: undefined, sensorId: undefined }

    //Search, select and verify the equipment after unlinked from sensor
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, cardView, environment).as('equipmentInfoCard')
    HelperFunction.verifyValuesInTheCardView('@equipmentInfoCard', valuesToVerify)
  })

  it('User Should be able to delete The equipment - SMARTHOSP-TC-6741', () => {
    const { equipmentName } = equipmentData.equip13

    //create test data
    EquipmentManagement.createEquipment_API(equipmentData.equip13)
    //Assign equipment name to delete test data
    currEquipmentName = equipmentName

    //Delete the equipment
    EquipmentManagement.deleteEquipment_EquipmentType_InMobile(equipmentName, false, equipment)
    //Verify the successful toast message of equipment deletion
    Verify.theToast.showsToastMessage(messageAfterDeletingEquipment)
  })

  it('User should not able to delete the Sensor linked Equipment', () => {
    const { equipmentName } = equipmentData.equip14
    const { sensorId } = sensorData.sensor7

    //create test data
    EquipmentManagement.createEquipment_API(equipmentData.equip14)
    //Assign equipment name to delete test data
    currEquipmentName = equipmentName

    //create a sensor
    DeviceManagement.createSensor_API(sensorData.sensor7)
    // Assign sensor name to delete test data
    currSensor = sensorId

    //link equipment with sensor
    HelperFunction.linkSensor_Tag_API(equipmentName, equipment, sensorId)
    //assign equipment name to unlink from sensor
    equipmentToUnlinkFromSensor = equipmentName

    // Try to Delete the Sensor linked equipment
    EquipmentManagement.deleteEquipment_EquipmentType_InMobile(equipmentName, true, equipment)
  })

  it('User should be able to create new equipment type from equipment Assignment page ', () => {
    const equipmentTypeName = equipmentData.equipmentType.type5

    // Click on the plus button to open equipment creation form
    Click.forcefullyOn(addNewEquipmentBtnMobile)

    //click on create equipment type button
    Click.forcefullyOn(createEquipmentTypeBtn)

    //create a new equipment type on equipment creation page
    EquipmentManagement.create_EditEquipmentType(equipmentTypeName, create, fluidBathIcon, equipmentAssignment)
    //verify the successful toastMessage of equipment type creation
    Verify.theToast.showsToastMessage(messageAfterCreatingEquipmentType, equipment)

    //assign equipment type name to delete the test data
    currEquipmentType = equipmentTypeName
  })

  after('delete test data', () => {
    // delete the existing equipment type
    HelperFunction.deleteEquipment_Asset_StaffType_API(equipmentData.equipment_Type, equipment)

    //Delete Room type
    FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)

    //Delete department
    FloorPlanManagement.deleteDepartment_API(equipmentData.departmentName)

    //Delete Floor
    FloorPlanManagement.deleteFloor_API(equipmentData.floorDetails.floorName, hospitalName)
  })
})

describe('It should perform operations of Sensor Management page', () => {
  before('create a new equipment type, floor, assigned owner and location ', () => {
    HelperFunction.createEquipment_Asset_StaffType_API(equipmentData.equipment_Type, equipment)

    //Create Department
    FloorPlanManagement.createDepartment_API(equipmentData.departmentName, equipmentData.buildingName)

    //Create Room type
    FloorPlanManagement.createRoomType_API(roomDetails)

    //Create floor and room
    FloorPlanManagement.createFloor_API(
      floorDetails,
      locationDetails,
      equipmentData.hospitalName,
      equipmentData.buildingName,
      equipmentData.departmentName
    )

    //create department boundaries
    FloorPlanManagement.createDepartmentBoundary_API(departmentBoundaryName, equipmentData.departmentName, floorDetails.floorName)

    // delete the existing equipment type
    HelperFunction.deleteEquipment_Asset_StaffType_API(equipmentData.equipment_Type, equipment)

    //create the new equipment type
    HelperFunction.createEquipment_Asset_StaffType_API(equipmentData.equipment_Type, equipment)
  })

  beforeEach('It should login to the Environment application,navigate to Sensor Management page of Equipment Management module', () => {
    cy.session('login-session', () => {
      HelperFunction.globalIntercept()
      //login to the prosight Environment application
      LoginPage.toVisit('/environment/')
      LoginPage.doUserLogin(username, password)
      Verify.theUrl().includes(smartMonitoring)
      Verify.textPresent.isVisible(equipmentType)
      Click.on(hamburgerBtn)

      //Verify the username after login
      Verify.textPresent.isVisible(name)
    })
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/environment/')
    Click.on(hamburgerBtn)
    //Navigate to the Sensor Management page
    HelperFunction.navigateToModule(button, equipmentManagement)
    Verify.theUrl().includes(environment)
    HelperFunction.navigateToModule(button, sensorManagement)
  })

  afterEach('It should delete the created test data', () => {
    if (currEquipmentName) {
      HelperFunction.deleteItem_API(currEquipmentName, equipment)
    }
    if (equipmentToUnlinkFromSensor) {
      HelperFunction.unlinkTag_Sensor_API(equipmentToUnlinkFromSensor, equipment)
    }
    if (currSensor) {
      HelperFunction.deleteItem_API(currSensor, sensor)
    }
  })

  it('User should be able link and unlink sensor with equipment', { viewportHeight: 667, viewportWidth: 375 }, () => {
    const { equipmentName } = equipmentData.equip16
    const { sensorId, sensorType, manufacturerName } = sensorData.sensor9
    let verifySensorData = { sensorId, sensorType, manufacturerName, linked, equipmentName }

    // create a test data
    EquipmentManagement.createEquipment_API(equipmentData.equip16)
    // Assign equipment name to delete test data
    currEquipmentName = equipmentName

    //create a sensor
    DeviceManagement.createSensor_API(sensorData.sensor9)
    // Assign sensor name to delete test data
    currSensor = sensorId
    cy.reload()

    //link equipment with sensor
    HelperFunction.linkTagOrSenor_Mobile_UI(sensorId, sensor, equipment, equipmentName)
    //assign equipment name to unlink from sensor
    equipmentToUnlinkFromSensor = equipmentName

    //Search, select and verify perticular equipment linked with sensor
    HelperFunction.search(sensorId, false)
    HelperFunction.getRowByItemName(sensorId, cardView, environment).as('sensorInfoCard')
    HelperFunction.verifyValuesInTheCardView('@sensorInfoCard', verifySensorData)

    //unlink equipment from sensor
    HelperFunction.unlinkTagOrSensor_Mobile_UI(equipment, equipmentName, sensorId)

    //verification values of a sensor after unlinked with equipment
    verifySensorData = { ...verifySensorData, unLinked, linked: undefined, equipmentName: undefined }

    //Can't verify due to bug
    //Search, select and verify perticular equipment after unlinked from sensor
    HelperFunction.search(sensorId, false)
    HelperFunction.getRowByItemName(sensorId, cardView, environment).as('sensorInfoCard')
    HelperFunction.verifyValuesInTheCardView('@sensorInfoCard', verifySensorData)
  })

  it('User should be able to delete the sensor', { viewportHeight: 667, viewportWidth: 375 }, () => {
    const { sensorId, sensorType, manufacturerName } = sensorData.sensor9

    let verifySensorData = { sensorId, sensorType, unLinked, manufacturerName }

    //create a sensor
    DeviceManagement.createSensor_API(sensorData.sensor9)

    //Search, select and verify perticular sensor
    HelperFunction.search(sensorId, false)
    cy.reload()
    HelperFunction.getRowByItemName(sensorId, cardView, environment).as('sensorInfoCard')
    HelperFunction.verifyValuesInTheCardView('@sensorInfoCard', verifySensorData)
    //click on delete button
    Click.onButton('@sensorInfoCard', deleteIcon)
    Verify.theElement(confirmationPopup).contains(confirmationMessageBeforeDeletingSensor)
    Click.onDeleteButton()
    Verify.theToast.showsToastMessage(messageAfterDeletingSensor)
  })

  after('delete test data', () => {
    HelperFunction.deleteEquipment_Asset_StaffType_API(equipmentData.equipment_Type, equipment)

    //Delete Room type
    FloorPlanManagement.deleteRoomType_API(roomDetails.roomTypeName)

    //Delete department
    FloorPlanManagement.deleteDepartment_API(equipmentData.departmentName)

    //Delete Floor
    FloorPlanManagement.deleteFloor_API(equipmentData.floorDetails.floorName, hospitalName)
  })
})

describe('It should perform CRUD operations on Equipment Type', { viewportHeight: 667, viewportWidth: 375 }, () => {
  beforeEach('It should login to the Environment application and navigate to Equipment Type of Equipment Management Module', () => {
    cy.session('login-session', () => {
      HelperFunction.globalIntercept()
      //login to the prosight Environment application
      LoginPage.toVisit('/environment/')
      LoginPage.doUserLogin(username, password)
      Verify.theUrl().includes(smartMonitoring)
      Verify.textPresent.isVisible(equipmentType)
      Click.on(hamburgerBtn)

      //Verify the username after login
      Verify.textPresent.isVisible(name)
    })
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/environment/')
    Click.on(hamburgerBtn)
    //Navigate to the Sensor Management page
    HelperFunction.navigateToModule(button, equipmentManagement)
    Verify.theUrl().includes(environment)
    Click.onContainText(mobileSecondarySideNav, equipmentType)
    Verify.theUrl().includes(equipment_Type)
  })

  afterEach('It should delete the created test data', () => {
    if (currEquipmentType) HelperFunction.deleteEquipment_Asset_StaffType_API(currEquipmentType, equipment)
    if (currEquipmentName) HelperFunction.deleteItem_API(currEquipmentName, equipment)
  })

  it('User should be able to create a new Equipment Type - SMARTHOSP-TC-6448', () => {
    const equipmentTypeName = equipmentData.equipmentType.type3

    //create a new equipment type
    EquipmentManagement.create_EditEquipmentType(equipmentTypeName, create)
    //verify the successful toastMessage of equipment type creation
    Verify.theToast.showsToastMessage(messageAfterCreatingEquipmentType, equipment)
    //assign equipment type name to delete the test data
    currEquipmentType = equipmentTypeName

    // Search, select and verify equipment type
    HelperFunction.search(equipmentTypeName, false)
    HelperFunction.getRowByItemName(equipmentTypeName, cardView, environment).as('equipmentTypeCard')
    Verify.theElement('@equipmentTypeCard').contains(equipmentTypeName)
    Verify.theElement('@equipmentTypeCard').hasChildClass(genericIconClass)
  })

  it('User should be able to edit the equipment type - SMARTHOSP-TC-6449', () => {
    const equipmentTypeName = equipmentData.equipmentType.type4
    const newEquipmentTypeName = equipmentData.equipmentType.editType1
    const newEquipmentTypeIcon = freezerIcon

    //create a test data
    HelperFunction.createEquipment_Asset_StaffType_API(equipmentTypeName, equipment)
    cy.reload() //to load the created test data
    //assign equipment type name to delete the test data
    currEquipmentType = equipmentTypeName

    //click on edit icon button
    HelperFunction.search(equipmentTypeName, false)
    HelperFunction.getRowByItemName(equipmentTypeName, cardView, environment).as('equipmentTypeCard')
    Click.onButton('@equipmentTypeCard', editIconBtn)

    //edit equipment type
    EquipmentManagement.create_EditEquipmentType(newEquipmentTypeName, edit, freezerIcon)
    //verify the successful toast message of equipment type update
    Verify.theToast.showsToastMessage(messageAfterUpdatingEquipmentTypeDetails)
    //assign equipment type name to delete the test data
    currEquipmentType = newEquipmentTypeName

    // Search, select and verify the updated equipment type
    HelperFunction.search(newEquipmentTypeName, false)
    HelperFunction.getRowByItemName(newEquipmentTypeName, cardView, environment).as('equipmentTypeCard')
    Verify.theElement('@equipmentTypeCard').contains(newEquipmentTypeName)
    Verify.theElement('@equipmentTypeCard').hasChildClass(newEquipmentTypeIcon)
  })

  it('User should be able to delete the equipment type - SMARTHOSP-TC-6450', () => {
    const equipmentTypeName = equipmentData.equipmentType.deleteTestCase.name3

    //create a test data
    HelperFunction.createEquipment_Asset_StaffType_API(equipmentTypeName, equipment)
    cy.reload() //to load the created test data
    //assign equipment type name to delete the test data
    currEquipmentType = equipmentTypeName

    //delete the equipment type
    EquipmentManagement.deleteEquipment_EquipmentType_InMobile(equipmentTypeName, false, equipmentType)
    //verify the successful toast message of equipment type deletion
    Verify.theToast.showsToastMessage(messageAfterDeletingEquipmentType)
  })

  it('User should not be able to delete the equipment associated equipment type', () => {
    const { equipmentName } = equipmentData.equip17
    const equipmentTypeName = equipmentData.equipmentType.deleteTestCase.name4

    //create a test data
    HelperFunction.createEquipment_Asset_StaffType_API(equipmentTypeName, equipment)
    cy.reload() //to load the created test data
    //assign equipment type name to delete the test data
    currEquipmentType = equipmentTypeName

    // Use the created equipment type in equipment creation
    EquipmentManagement.createEquipment_API(equipmentData.equip17)
    //Assign equipment name to delete test data
    currEquipmentName = equipmentName

    //Try to delete the equipment associated equipment type
    EquipmentManagement.deleteEquipment_EquipmentType_InMobile(equipmentTypeName, true, equipmentType)
  })
})
