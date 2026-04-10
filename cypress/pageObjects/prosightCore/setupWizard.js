///<reference types= 'cypress'/>
import commandOptions from '../../utils/constants/commandOptions'
import globalSels from '../../utils/selectors/globalSels'
import setupWizardConstants from '../../utils/constants/prosightCore/setupWizardConstants'
import selectors from '../../utils/selectors/prosightCore'
import constants from '../../utils/constants/prosightCore/hospitalManagementConst'
import buildingManagementConst from '../../utils/constants/prosightCore/buildingManagementConst'
import { Verify } from '../../utils/assertions'
import DeviceManagement from './deviceManagement'
import deviceManagementConstants from '../../utils/constants/prosightCore/deviceManagementConstants'
import Intercept from '../../utils/Interactions/Intercept'
import AliasWait from '../../utils/Interactions/wait'
import UserManagement from '../../pageObjects/prosightCore/userManagement'
import Click from '../../utils/Interactions/click'
import Type from '../../utils/Interactions/type'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import hospitalManagementConst from '../../utils/constants/prosightCore/hospitalManagementConst'
import FloorPlanManagement from './floorPlanManagementFns'
import userManagementConst from '../../utils/constants/prosightCore/userManagementConst'
const { SensorManagementButton, GatewayManagementButton } = deviceManagementConstants
const { hospitals } = hospitalManagementConst.buttonsInnerText
const { buildingsTab } = buildingManagementConst.buttonsInnerText
const { moduleButton } = selectors.general
const { buttonTag, checkbox, divTag, pageTitle, rowInTable, createBtn, cell } = globalSels
const {
  nameInputField,
  timeZoneDropdowns,
  streetAddressInput,
  cityInput,
  stateDropdown,
  popupItems,
  zipInput,
  contactNameInput,
  contactEmailInput,
  phoneNumberInput,
  hospitalDropdowns,
} = selectors.hospitalManagementPageSel
const { floorNameInputField, floorNumberInputField, selectedFloorPlanFileName, addFloorBtn } = selectors.floorPlanManagement.floors
const { saveBtn } = selectors.floorPlanManagement
const {
  setupWizardButtonLabel,
  facilityNameOnStep3,
  buildingNameOnStep3,
  facilityNameOnStep2,
  nextButtonOnPopup,
  confirmButton,
  boundaryNameInput,
  assignedOwnerInput,
  manufacturerDropdownInput,
  createButtonOnStep6,
  hospitalNameOnStep6,
  searchBarOnAssignedOwner,
  footer,
} = selectors.setupWizard
const { addDepartmentBoundaryBtn } = selectors.floorPlanManagement.departmentBoundariesSel
const {
  setupWizardButton,
  nextButton,
  getStarted,
  previousButton,
  save,
  hospital,
  FloorPlanManagementModuleLink,
  FacilityManagementModuleLink,
  geoJSONFilePath,
  geoJSONFile,
  createButton,
  DeviceManagementModuleLink,
  SensorButton,
  GatewayButton,
  UserManagementModuleLink,
  completeButton,
} = setupWizardConstants
const { urlOnStep2, urlOnUsers, urlOnStep3, urlOnGateway, urlOnSensor, urlOnTags } = setupWizardConstants.urls
const { TagTypeDropdown, ManufacturerDropdownLabel, ModelDropdown, SensorTypeLabel, FloorLabel, GatewayTypeLabel, locationLabel } =
  deviceManagementConstants
const { messageAfterTagCreation, messageAfterSensorCreation, messageAfterGatewayCreation, messageAfterUserCreation } =
  setupWizardConstants.toastMessages
const {
  addTagButton,
  tagIdTextField,
  tagTypeDropDown,
  manufacturerDropDown,
  modelDropDown,
  sensorId,
  sensorAndManufacturerDropdown,
  sensorModelName,
  addSensor,
  addGateway,
  gatewayDropdowns,
  gatewayCancelButton,
  gatewayDropdownOptions,
  gatewayManagementButton,
  gatewayName,
  gatewayPolicyName,
  gatewayPolicyNameForKontakt,
  gatewaySid,
  gatewayTable,
  gatewayTypeLabel,
  buildingDropdown,
  sensorTypeDropdown,
  gatewayType,
} = selectors.deviceManagementPageSel
/** This class consists of different static functions related to setup wizard page
 * @class setupWizard
 */
export default class setupWizard {
  /**
   * Function that navigates to setup wizard Page
   */
  static navigateToSetupWizardPage = () => {
    Click.onContainText(buttonTag, setupWizardButton)
    Click.onContainText(buttonTag, getStarted)
  }

  /**
   * Function that completes Step 1 by entering all required fields and creates new hospital
   * @param {Object} params - Parameters for editing hospital information.
   * @param {Array} params.hospitalName - The name of the hospital to edit.
   * @param {string} params.timezone - The new timezone for the hospital.
   * @param {string} params.street - The new street address.
   * @param {string} params.city - The new city where the hospital is located.
   * @param {string} params.state - The new state where the hospital is located.
   * @param {string} params.zipCode - The new ZIP code of the hospital.
   * @param {string} params.phone - The new phone number for contacting the hospital.
   * @param {string} params.email - The new email address for contacting the hospital.
   * @param {string} params.name - The new name of the contact person at the hospital.
   * @param {string[]} params.applications - An array of updated applications associated with the hospital.
   */
  static completeTheStep1 = (hospitalData) => {
    const { hospitalName, timezone, streetAddress, city, state, zipCode, email, contactPersonName, mobileNumber, applications } = hospitalData
    cy.get(nameInputField).clear(commandOptions.force).type(hospitalName, commandOptions.force)
    cy.get(hospitalDropdowns).click(commandOptions.force)
    cy.get(timeZoneDropdowns).contains(timezone).click(commandOptions.force)
    cy.get(streetAddressInput).clear(commandOptions.force).type(streetAddress, commandOptions.force)
    cy.get(cityInput).clear(commandOptions.force).type(city, commandOptions.force)
    cy.get(stateDropdown).click(commandOptions.force)
    cy.get(popupItems).contains(state).click(commandOptions.force)
    cy.get(zipInput).clear(commandOptions.force).type(zipCode, commandOptions.force)
    cy.get(contactNameInput).clear(commandOptions.force).type(contactPersonName, commandOptions.force)
    cy.get(phoneNumberInput).clear(commandOptions.force).type(mobileNumber, commandOptions.force)
    cy.get(contactEmailInput).clear(commandOptions.force).type(email, commandOptions.force)

    applications.forEach((application) => {
      cy.contains(divTag, application).prev().find(checkbox).click(commandOptions.force)
    })
    Verify.elementContainingText(moduleButton, nextButton).parentElementIsEnabled()
    cy.get(moduleButton).contains(nextButton).click(commandOptions.force)
  }

  /**
   * Function that completes Step 2 by entering all required fields and creates new building
   * @param { Object } params - Parameters for editing hospital information.
   * @param { Array } params.buildingName - The name of the hospital to edit.
   * @param { string } params.streetAddress - The new street address.
   * @param { string } params.city - The new city where the hospital is located.
   * @param { string } params.state - The new state where the hospital is located.
   * @param { string } params.zipCode - The new ZIP code of the hospital.
   */
  static completeTheStep2 = (buildingDetails, hospitalName) => {
    const { buildingName, streetAddress, city, state, zipCode, contactPersonName, mobileNumber, email } = buildingDetails
    Verify.elementContainingText(buttonTag, nextButton).parentElementIsDisabled()
    Verify.elementContainingText(buttonTag, previousButton).parentElementIsEnabled()
    Verify.theElement(facilityNameOnStep2).hasValue(hospitalName)
    cy.get(selectors.buildingManagementPageSel.buildingNameInput).type(buildingName, commandOptions.force)
    cy.get(selectors.setupWizard.streetAddressInput).type(streetAddress, commandOptions.force)
    cy.get(selectors.setupWizard.cityInput).type(city, commandOptions.force)
    cy.get(stateDropdown).click(commandOptions.force)
    cy.get(popupItems).contains(state).click(commandOptions.force)
    cy.get(selectors.setupWizard.zipCodeInput).type(zipCode, commandOptions.force)
    cy.get(selectors.setupWizard.contactNameInput).clear(commandOptions.force).type(contactPersonName, commandOptions.force)
    cy.get(selectors.setupWizard.contactNumberInput).clear(commandOptions.force).type(mobileNumber, commandOptions.force)
    cy.get(selectors.setupWizard.contactEmailInput).clear(commandOptions.force).type(email, commandOptions.force)
    Verify.elementContainingText(moduleButton, nextButton).parentElementIsEnabled()
    cy.get(buttonTag).contains(nextButton).click(commandOptions.force)
    cy.get(moduleButton).contains(nextButton).click(commandOptions.force)
  }

  /**
   * function that verifies the link on step 2 and making sure that its navigating to building page of hospital Management module
   */
  static checkFacilityManagementLinkOnStep2 = (hospitalName = null, buildingName = null) => {
    if (buildingName != null) {
      Verify.elementContainingText(buttonTag, previousButton).isEnabled()
      Click.onContainText(buttonTag, previousButton)
      cy.get(moduleButton).contains(FacilityManagementModuleLink).click(commandOptions.force)
      Verify.elementContainingText(pageTitle, buildingsTab).isVisible()
      Verify.theUrl().includes(setupWizardConstants.urls.urlOnStep2)
      HelperFunction.search(buildingName, false)
      HelperFunction.getRowByItemName(buildingName, rowInTable, 'admin').as('resultRow')
      Verify.theElement('@resultRow').contains(buildingName)
      cy.get(setupWizardButtonLabel).click(commandOptions.force)
      Click.onContainText(buttonTag, nextButton)
    } else {
      cy.get(moduleButton).contains(FacilityManagementModuleLink).click(commandOptions.force)
      Verify.elementContainingText(pageTitle, buildingsTab).isVisible()
      Verify.theUrl().includes(setupWizardConstants.urls.urlOnStep2)
      Click.onContainText(buttonTag, hospitals)
      HelperFunction.search(hospitalName, false)
      HelperFunction.getRowByItemName(hospitalName, rowInTable, 'admin').as('resultRow')
      Verify.theElement('@resultRow').contains(hospitalName)
      cy.get(setupWizardButtonLabel).click(commandOptions.force)
    }
  }

  /**
   * A function that enters the given details related to hospital floor in add floor page
   * @param {geojson} geojsonFile , it is the required geojson file i.e floor plan which user will upload in add floor page
   * @param {String} floorName,it is the required floorName which user will enter in the form
   * @param {Number} floorNumber, it is the floor number that user will enter in the form
   */
  static completeTheStep3 = (floorName, floorNumber, hospitalName, buildingName) => {
    Verify.theElement(facilityNameOnStep3).hasValue(hospitalName)
    Verify.theElement(buildingNameOnStep3).contains(buildingName)
    Type.theText(floorName).into(floorNameInputField)
    Type.theText(floorNumber).into(floorNumberInputField)
    FloorPlanManagement.uploadGeoJsonFile(geoJSONFilePath)
    Verify.theElement(saveBtn).isEnabled()
    Click.onContainText(saveBtn, save)
    Verify.theElement(selectedFloorPlanFileName).contains(geoJSONFile)
    Verify.elementContainingText(buttonTag, nextButton).parentElementIsEnabled()
    Click.onContainText(buttonTag, nextButton)
  }

  /**
   * function that verifies the link on step 3 and making sure that its navigating to floor page of floor plan Management module
   */
  static checkFloorPlanManagementLinkOnStep3 = (floorName) => {
    Click.onContainText(buttonTag, previousButton)
    Click.onContainText(buttonTag, FloorPlanManagementModuleLink)
    Verify.theElement(addFloorBtn).isVisible()
    Verify.theUrl().includes(setupWizardConstants.urls.urlOnStep3)
    HelperFunction.search(floorName, false)
    HelperFunction.getRowByItemName(floorName, rowInTable, 'admin').as('resultRow')
    Verify.theElement('@resultRow').contains(floorName)
    cy.get(setupWizardButtonLabel).click(commandOptions.force)
    Verify.elementContainingText(buttonTag, nextButton).parentElementIsEnabled()
    Click.onContainText(moduleButton, nextButton)
  }

  /**
   * Function that draws a polygon on given canvas element shape i.e department boundaries or floor boundaries
   * @param {String} canvasElemSel it is the selector of canvas element where we need to draw the shape
   * @param {Boolean} edit it is the boolean value i.e if user has to edit the polygon then true otherwise false
   */

  static completeTheStep4 = (canvasElemSel, boundaryDetails) => {
    const { boundaryName, assignedOwner } = boundaryDetails
    cy.get(canvasElemSel).then(($canvas) => {
      const canvasWidth = $canvas.width()
      const canvasHeight = $canvas.height()
      console.log(canvasHeight, canvasWidth)
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2
      const startingPointX = centerX + 50
      const startingPointY = centerY + 30
      cy.wait(3000)
      cy.wrap($canvas)
        .scrollIntoView()
        .click(startingPointX, startingPointY)
        .click(startingPointX + 30, startingPointY)
        .click(startingPointX + 30, startingPointY - 30)
        .dblclick(startingPointX, startingPointY - 30)
      cy.get(nextButtonOnPopup).click(commandOptions.force)
      cy.wait(3000)
      Click.forcefullyOn(confirmButton)
      Type.theText(boundaryName).into(boundaryNameInput)
      Verify.theElement(assignedOwnerInput).isEnabled()
      Click.forcefullyOn(assignedOwnerInput)
      Type.theText(assignedOwner).into(searchBarOnAssignedOwner)
      cy.contains(assignedOwner).click(commandOptions.force)
      Click.forcefullyOn(createBtn)
      cy.get(footer).find(buttonTag).contains(nextButton).parent().should('be.enabled')
      Click.onButtonByFindingInnerText(footer, moduleButton, nextButton)
    })
  }

  /**
   * function that verifies the link on step 4 and making sure that its navigating to Department Boundaries page of floor plan Management module
   */
  static checkFloorPlanManagementLinkOnStep4 = (departmentName) => {
    Verify.elementContainingText(buttonTag, previousButton).isEnabled()
    Click.onContainText(buttonTag, previousButton)
    Click.onContainText(buttonTag, FloorPlanManagementModuleLink)
    Verify.theElement(addDepartmentBoundaryBtn).isVisible()
    Verify.theUrl().includes(urlOnStep3)
    HelperFunction.search(departmentName)
    HelperFunction.getRowByItemName(departmentName, rowInTable, 'admin').as('resultRow')
    Verify.theElement('@resultRow').contains(departmentName)
    Click.forcefullyOn(setupWizardButtonLabel)
    Verify.elementContainingText(buttonTag, nextButton).parentElementIsEnabled()
    Click.onContainText(moduleButton, nextButton)
  }

  static completeTheStep5 = () => {
    Click.onContainText(buttonTag, FloorPlanManagementModuleLink)
    Verify.theElement(selectors.setupWizard.createRoom).isVisible()
    Verify.theUrl().includes(setupWizardConstants.urls.urlOnStep3)
    Click.forcefullyOn(setupWizardButtonLabel)
    Verify.elementContainingText(buttonTag, nextButton).isEnabled()
    Click.onContainText(buttonTag, nextButton)
  }

  /**
   * Function that creates a new tag by filling required fields
   * @param {string} tagName , its tag name that user will enter in the form
   * @param {string} tagType , its type of tag that user will select from the dropdown
   * @param {string} Manufacture ,its type of manufacturer  that user will select from the dropdown
   * @param {string} Model,its type of model that user will select from the dropdown
   */
  static addTagOnStep6 = (tagDetails) => {
    const { tagName, tagType, Manufacturer, Model } = tagDetails
    Type.theText(tagName).into(tagIdTextField)
    Click.onContainText(tagTypeDropDown, TagTypeDropdown)
    cy.contains(tagType).click(commandOptions.force)
    Click.onContainText(manufacturerDropDown, ManufacturerDropdownLabel)
    cy.contains(Manufacturer).click(commandOptions.force)
    Click.onContainText(modelDropDown, ModelDropdown)
    cy.contains(Model).click(commandOptions.force)
    Click.onContainText(buttonTag, createButton)
    Verify.theToast.showsToastMessage(messageAfterTagCreation)
    Click.onContainText(buttonTag, DeviceManagementModuleLink)
    Verify.theElement(addTagButton).isVisible()
    Verify.theUrl().includes(urlOnTags)
    HelperFunction.search(tagName, false)
    HelperFunction.getRowByItemName(tagName, rowInTable, 'admin').as('resultRow')
    Verify.theElement('@resultRow').contains(tagName)
    Click.forcefullyOn(setupWizardButtonLabel)
  }

  /**
   * Function that creates a new senor by filling required fields
   * @param {string} sensor ,its sensor name that user will enter in the form
   * @param {string} sensorTypes, its type of sensor that user will select from the dropdown
   * @param {string} manufacturer,its type of manufacturer  that user will select from the dropdown
   * @param {string} modelName,its model name that user will enter in the form
   */

  static addSensorOnStep6 = (sensorDetails) => {
    const { sensor, sensorTypes, manufacturer, modelName } = sensorDetails
    Click.onContainText(buttonTag, SensorButton)
    Type.theText(sensor).into(sensorId)
    cy.get(sensorTypeDropdown).click(commandOptions.force)
    cy.contains(sensorTypes).click(commandOptions.force)
    cy.get(manufacturerDropdownInput).eq(1).click(commandOptions.force)
    cy.contains(manufacturer).click(commandOptions.force)
    Type.theText(modelName).into(sensorModelName)
    cy.get(createButtonOnStep6).eq(1).click(commandOptions.force)
    Verify.theToast.showsToastMessage(messageAfterSensorCreation)
    Click.onContainText(buttonTag, DeviceManagementModuleLink)
    Click.onContainText(buttonTag, SensorManagementButton)
    Verify.theUrl().includes(urlOnSensor)
    Verify.theElement(addSensor).isVisible()
    HelperFunction.search(sensor, false)
    HelperFunction.getRowByItemName(sensor, rowInTable, 'admin').as('resultRow')
    Verify.theElement('@resultRow').contains(sensor)
    Click.forcefullyOn(setupWizardButtonLabel)
  }

  /**
   * Function that creates a new gateway by filling required fields
   * @param {string} gatewaySID,its Gateway ID that user will enter in the form
   * @param {string} gatewayManufacturer,its manufacturer that user will select from the dropdown
   * @param {string} gatewayTypeHID,its gateway Type that user will select from the dropdown
   * @param {string} gatewayName,its gateway name that user will enter in the form
   * @param {string} building,its building name that user will select from the dropdown
   * @param {string} URLS,its the api call which is used for Wait
   * @param {string} floor,its floor name that user will select from the dropdown
   * @param {string} location,its location name that user will select from the dropdown
   */

  static addGatewayOnStep6 = (gatewayData) => {
    const { manufacturerHID, gatewaySID, gatewayTypeHID, gatewayName, building, floor, URLS, location, gatewayPolicy } = gatewayData
    Click.onContainText(buttonTag, GatewayButton)
    cy.get(manufacturerDropdownInput).eq(2).click(commandOptions.force)
    cy.contains(manufacturerHID).click(commandOptions.force)
    Type.theText(gatewaySID).into(gatewaySid)
    Click.forcefullyOn(gatewayType)
    cy.contains(gatewayTypeHID).click(commandOptions.force)
    Type.theText(gatewayName).into(selectors.deviceManagementPageSel.gatewayName)
    Type.theText(gatewayPolicy).into(gatewayPolicyName)
    cy.get(createButtonOnStep6).eq(2).click(commandOptions.force)
    Verify.theToast.showsToastMessage(messageAfterGatewayCreation)
    Click.onContainText(buttonTag, DeviceManagementModuleLink)
    Click.onContainText(buttonTag, GatewayManagementButton)
    Verify.theUrl().includes(urlOnGateway)
    Verify.theElement(addGateway).isVisible()
    HelperFunction.search(gatewayName, false)
    HelperFunction.getRowByItemName(gatewayName, rowInTable, 'admin').as('resultRow')
    Verify.theElement('@resultRow').contains(gatewayName)
    Click.forcefullyOn(setupWizardButtonLabel)
    Verify.elementContainingText(buttonTag, nextButton).isEnabled()
    Click.onContainText(buttonTag, nextButton)
  }

  static completeTheStep7 = (userData, hospitalName) => {
    const { name, email, username, role, phone = null, department = null } = userData
    // selectors
    const { nameInput, phoneInput, emailInput, usernameInput, departmentList, hospitalList, hospitalDropdown, departmentDropdown } =
      selectors.userManagementSel.users
    const { users } = userManagementConst.buttonsInnerText
    // user details section
    Verify.theElement(hospitalNameOnStep6).hasValue(hospitalName)
    Type.theText(name).into(nameInput)
    Type.theText(email).into(emailInput)
    Type.theText(username).into(usernameInput)

    // optional fields
    if (phone) Type.theText(phone).into(phoneInput)
    if (department) {
      Click.forcefullyOn(departmentDropdown)
      cy.contains(department).click(commandOptions.force)
    }
    // get the name of the role how it appears in the list
    cy.get(selectors.setupWizard.userRole).contains(setupWizardConstants.userRole).click(commandOptions.force)
    cy.contains(role).click(commandOptions.force)
    Click.forcefullyOn(createButtonOnStep6)
    Verify.theToast.showsToastMessage(messageAfterUserCreation)
    Click.onContainText(buttonTag, UserManagementModuleLink)
    Verify.theUrl().includes(urlOnUsers)
    Verify.elementContainingText(pageTitle, users).isVisible()
    HelperFunction.search(username, false)
    HelperFunction.getRowByItemName(username, cell, 'admin').as('resultRow')
    Verify.theElement('@resultRow').contains(username)
    Click.forcefullyOn(setupWizardButtonLabel)
    Verify.elementContainingText(buttonTag, completeButton).isEnabled()
    Click.onContainText(buttonTag, completeButton)
  }

  static selectHospitalFromGlobalFilter = (hospitalName) => {
    cy.get(globalSels.filters.hospitalFilter).eq(0).click()
    cy.get(globalSels.filters.availableDropDownOptions).scrollTo(commandOptions.scrollBottom)
    cy.contains(hospitalName).click(commandOptions.force)
  }
}
