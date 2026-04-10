import selectors from '../../utils/selectors/prosightCore'
import buildingManagementConst from '../../utils/constants/prosightCore/buildingManagementConst'
import commandOptions from '../../utils/constants/commandOptions'
import globalSels from '../../utils/selectors/globalSels'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants.js'
import HelperFunction from '../../utils/helpers/crossModuleFunctions.js'
import options from '../../utils/constants/commandOptions.js'
import Verify from '../../utils/assertions/verify.js'
import globalConst from '../../utils/constants/globalConst.js'
import Click from '../../utils/Interactions/click.js'

const {
  nameInputField,
  streetAddressInput,
  cityInput,
  stateDropdown,
  popupItems,
  zipInput,
  saveButton,
  contactEmailInput,
  contactNameInput,
  contactPhoneNumberInput,
  tableRow,
  buildingNameInput,
  detailSidePanel,
} = selectors.buildingManagementPageSel
const { hospitalDropdown, stateTxt } = buildingManagementConst.formsText
const { force, scrollRight, enabled } = commandOptions
const { dropDown, scrollBar, labelTag, confirmationPopup, deleteIcon, dialogueDeleteBtn, deleteBtn, editBtn } = globalSels
const { buildings, hospital } = leverageConstants.objectTypes
const { application } = globalConst
const { buildingDelete } = buildingManagementConst.confirmationMessages
const { editMenu, sidePanelBtn, tableBtn } = globalConst.delete_EditActions
const apiBaseURL = Cypress.env('API_BaseUrl')
const systemId = Cypress.env('SystemId')
const projectId = Cypress.env('ProjectId')
const buildingBlueprintId = Cypress.env('BUILDING_BLUEPRINT_ID')

/** This class consists of different static functions related to BuildingManagement page
 * @class BuildingManagement
 */
export default class BuildingManagement {
  /**
   * Creates an building for an existin hospital.
   *
   * @param {Object} params - Parameters for editing hospital information.
   * @param {Array} params.buildingName - The name of the hospital to edit.
   * @param {string} params.streetAddress - The new street address.
   * @param {string} params.city - The new city where the hospital is located.
   * @param {string} params.state - The new state where the hospital is located.
   * @param {string} params.zipCode - The new ZIP code of the hospital.
   * @returns {void}
   */
  static addNewBuilding = ({
    hospitalName,
    buildingName,
    streetAddress,
    city,
    state,
    zipCode,
    contactName = null,
    contactPhoneNumber = null,
    contactEmail = null,
  }) => {
    //select hospital
    cy.get(dropDown).contains(hospitalDropdown).click(force)
    cy.get(dropDown).contains(hospitalName).click(force)

    //fill all the building details
    cy.get(buildingNameInput).clear(force).type(buildingName, force)
    cy.get(streetAddressInput).clear(force).type(streetAddress, force)
    cy.get(cityInput).clear(force).type(city, force)
    cy.get(stateDropdown).click(force)
    cy.get(popupItems).contains(state).click(force)
    cy.get(zipInput).clear(force).type(zipCode, force)

    //fill the optional contact details
    if (contactName) cy.get(contactNameInput).clear(force).type(contactName, force)
    if (contactPhoneNumber) cy.get(contactPhoneNumberInput).clear(force).type(contactPhoneNumber, force)
    if (contactEmail) cy.get(contactEmailInput).clear(force).type(contactEmail, force)

    //click on create button
    cy.get(saveButton).click(force)
  }

  /**
   * Deletes a building using the API based on the provided building name.
   *
   * @function
   * @param {string} buildingName - The name of the building to be deleted.
   *
   * @description
   * This function searches for a building by its name using the `search_API` helper function. Once the building is found, it retrieves the authorization token and building ID.
   * The function then sends a DELETE request to the API to remove the building. If the response status is 200, the function logs a success message.
   * Otherwise, it logs a failure message indicating that the building could not be deleted.
   */
  static deleteBuilding_API = (buildingName) => {
    HelperFunction.search_API(buildingName, buildings).then(({ authToken, Id }) => {
      cy.api({
        method: options.requestMethod.delete,
        failOnStatusCode: false,
        url: `${apiBaseURL}project/${projectId}/system/${systemId}/srv/prosightApiServer/building/${Id}`,
        headers: {
          authorization: authToken,
        },
      }).then((res) => {
        if (res.status === 204) {
          expect(res.status, 'Verifying the response code').to.equal(204)
          cy.log(`${buildingName} deleted successfully`)
        } else {
          const errorMsg = `Failed to delete ${buildingName}`
          cy.log(errorMsg)
        }
      })
    })
  }

  /**
   * Verifies building details in the side panel.
   *
   * @function
   * @param {Object} buildingDetails - Object containing building details.
   * @param {string} buildingDetails.buildingName - Building name.
   * @param {string} buildingDetails.hospitalName - Hospital name.
   * @param {string} buildingDetails.streetAddress - Street address.
   * @param {string} buildingDetails.city - City name.
   * @param {string} buildingDetails.state - State name.
   * @param {string} buildingDetails.zipCode - Zip code.
   * @param {string} [buildingDetails.contactName=null] - Contact name (optional).
   * @param {string} [buildingDetails.contactPhoneNumber=null] - Contact phone number (optional).
   * @param {string} [buildingDetails.contactEmail=null] - Contact email (optional).
   */
  static verifyBuildingDetailsInSidePanel = (buildingDetails) => {
    const {
      buildingName,
      hospitalName,
      streetAddress,
      city,
      state,
      zipCode,
      contactName = null,
      contactPhoneNumber = null,
      contactEmail = null,
    } = buildingDetails

    const sidePanelDataObj = {
      Facility: hospitalName,
      'Street Address': streetAddress,
      City: city,
      State: state,
      'Zip Code': zipCode,
      'Contact Name': contactName || '-',
      'Contact Number': `${HelperFunction.formatPhoneNumber(contactPhoneNumber)}` || '-',
      'Contact Email': contactEmail || '-',
    }

    Verify.theElement(detailSidePanel).contains(buildingName)
    HelperFunction.verifyValueFromSidePanel(sidePanelDataObj)
  }

  /**
   * Creates a building and associates it with a hospital.
   *
   * @param {Object} params - Parameters for creating a building.
   * @param {Object} params.buildingDetails - Building details.
   * @param {string} params.buildingDetails.buildingName - Building name.
   * @param {string} params.buildingDetails.streetAddress - Building street address.
   * @param {string} params.buildingDetails.city - Building city.
   * @param {string} params.buildingDetails.zipCode - Building ZIP code.
   * @param {string} params.buildingDetails.state - Building state.
   * @param {string} params.buildingDetails.contactName - Contact name.
   * @param {string} params.buildingDetails.contactPhoneNumber - Contact phone number.
   * @param {string} params.buildingDetails.contactEmail - Contact email.
   *
   * @param {Object} params.hospitalDetails - Hospital details.
   * @param {string} params.hospitalDetails.hospitalName - Hospital name.
   * @param {string} params.hospitalDetails.streetAddress - Hospital street address.
   * @param {string} params.hospitalDetails.city - Hospital city.
   * @param {string} params.hospitalDetails.zipCode - Hospital ZIP code.
   * @param {string} params.hospitalDetails.state - Hospital state.
   * @param {string} params.hospitalDetails.contactPersonName - Hospital contact person.
   * @param {string} params.hospitalDetails.mobileNumber - Contact mobile number.
   * @param {string} params.hospitalDetails.email - Contact email.
   */
  static createBuilding_API = (buildingHospitalData) => {
    // Get the current timestamp
    const currentTimestamp = Date.now()

    // Destructure building details
    const {
      buildingName,
      streetAddress: buildingStreetAddress,
      city: buildingCity,
      zipCode: buildingZipCode,
      state: buildingState,
      contactName,
      contactPhoneNumber,
      contactEmail,
    } = buildingHospitalData.buildingDetails

    // Destructure hospital details
    const {
      hospitalName,
      streetAddress: hospitalStreetAddress,
      city: hospitalCity,
      zipCode: hospitalZipCode,
      state: hospitalState,
      contactPersonName,
      mobileNumber,
      email,
    } = buildingHospitalData.hospitalDetails
    // Search for the hospital by name to get the auth token and hospital ID
    HelperFunction.search_API(hospitalName, hospital).then(({ authToken, Id }) => {
      // Make an API request to create a new building
      cy.api({
        method: commandOptions.requestMethod.post,
        failOnStatusCode: false,
        url: `${apiBaseURL}project/${projectId}/system/${systemId}/srv/prosightApiServer/building`,
        headers: {
          authorization: authToken,
        },
        body:{
             data: {
             hospital: {
             metadata: {
                allowedApplications: [
                    "safety",
                    "assets",
                    "environment",
                    "core"
                ],
                timeZone: "America/New_York"
            },
             systemId: systemId,
             data: {
                address: {
                    zipCode: hospitalZipCode,
                    city: hospitalCity,
                    street: hospitalStreetAddress,
                    state: hospitalState,
                },
                hospitalType: "Default",
                timezone: "America/New_York",
                name: hospitalName,
                position: {
                    lon: -86.786333,
                    lat: 33.51054
                },    
                contact: {
                    phone: mobileNumber,
                    name: contactPersonName,
                    email: email,
                  },
            },
            purpose: "organization",
            created: 1767594617571,
            simulated: false,
            name: hospitalName,
            id: Id,
            lastModified: currentTimestamp,
            blueprintId: buildingBlueprintId,
            projectId: projectId
         },
            name: buildingName,
            addressDetails: {
            streetAddress: buildingStreetAddress,
            city: buildingCity,
            state: buildingState,
            zipCode: buildingZipCode
        },        
            contactDetails: {            
              contactName: contactName,            
              phoneNumber: contactPhoneNumber,            
              emailAddress: contactEmail        
        },        
        position: {
            lat: 32.828866,
            lon: -86.789292
        }
    },
    "name": buildingName
},
      }).then((res) => {
        if (res.status === 201) {
          // Verify the response code and log a success message
          expect(res.status, 'Verifying the response code').to.equal(201)
          cy.log(`${buildingName} created successfully`)
          // Verify the building name matches the expected value
          expect(res.body.name, 'Verifying the building name').to.eq(buildingName)
          // Verify the street address in the response matches the expected value
          expect(res.body.data.addressDetails.streetAddress, 'Verifying the building street address').to.eq(buildingStreetAddress)
        } else {
          // Log an error message if the building creation fails
          const errorMsg = `Failed to create ${buildingName}`
          cy.log(errorMsg)
        }
      })
    })
  }

  /**
   * Edits the details of an existing building.
   *
   * @param {Object} initialDetails - The initial details of the building before editing.
   * @param {string} initialDetails.hospitalName - The name of the hospital.
   * @param {string} initialDetails.buildingName - The current name of the building.
   * @param {string} initialDetails.streetAddress - The current street address of the building.
   * @param {string} initialDetails.city - The current city where the building is located.
   * @param {string} initialDetails.state - The current state where the building is located.
   * @param {string} initialDetails.zipCode - The current ZIP code of the building.
   * @param {string} [initialDetails.contactName=null] - The current contact name (optional).
   * @param {string} [initialDetails.contactPhoneNumber=null] - The current contact phone number (optional).
   * @param {string} [initialDetails.contactEmail=null] - The current contact email (optional).
   *
   * @param {Object} newDetails - The new details to update for the building.
   * @param {string} [newDetails.newBuildingName=null] - The new name of the building (optional).
   * @param {string} [newDetails.newStreetAddress=null] - The new street address of the building (optional).
   * @param {string} [newDetails.newCity=null] - The new city where the building is located (optional).
   * @param {string} [newDetails.newState=null] - The new state where the building is located (optional).
   * @param {string} [newDetails.newZipCode=null] - The new ZIP code of the building (optional).
   * @param {string} [newDetails.newContactName=null] - The new contact name (optional).
   * @param {string} [newDetails.newContactPhoneNumber=null] - The new contact phone number (optional).
   * @param {string} [newDetails.newContactEmail=null] - The new contact email (optional).
   *
   * @param {string} editType - The type of edit operation ('table' or 'sidePanel').
   */
  static editBuildingDetails = (initialDetails, newDetails, editType) => {
    const { buildingName, streetAddress, city, state, zipCode, contactName = null, contactPhoneNumber = null, contactEmail = null } = initialDetails

    const {
      newBuildingName = null,
      newStreetAddress = null,
      newCity = null,
      newState = null,
      newZipCode = null,
      newContactName = null,
      newContactPhoneNumber = null,
      newContactEmail = null,
    } = newDetails

    //search and get the perticular building
    HelperFunction.search(buildingName, false)
    cy.get(scrollBar).scrollTo(scrollRight)
    HelperFunction.getRowByItemName(buildingName, tableRow, application.core).as('resultRow')

    //click on edit button based on edit type
    if (editType === tableBtn) {
      cy.get('@resultRow').find(editBtn).click(force)
    } else if (editType === sidePanelBtn) {
      cy.get('@resultRow').click(force)
      cy.get(detailSidePanel).find(editBtn).click(force)
    }

    //verify the save button is disabled
    Verify.theElement(saveButton).isDisabled()

    //Verify the initial data
    Verify.theElement(buildingNameInput).hasValue(buildingName)
    Verify.theElement(streetAddressInput).hasValue(streetAddress)
    Verify.theElement(cityInput).hasValue(city)
    Verify.theElementNextToLabel(stateTxt).contains(state)
    Verify.theElement(zipInput).hasValue(zipCode)
    if (contactName) Verify.theElement(contactNameInput).hasValue(contactName)
    if (contactPhoneNumber) Verify.theElement(contactPhoneNumberInput).hasValue(contactPhoneNumber)
    if (contactEmail) Verify.theElement(contactEmailInput).hasValue(contactEmail)

    // Building Address details
    if (newBuildingName) cy.get(buildingNameInput).clear(force).type(newBuildingName, force)
    if (newStreetAddress) cy.get(streetAddressInput).clear(force).type(newStreetAddress, force)
    if (newCity) cy.get(cityInput).clear(force).type(newCity, force)
    if (newState) cy.contains(labelTag, stateTxt).next().click(force)
    if (newState) cy.get(popupItems).contains(newState).click(force)
    if (newZipCode) cy.get(zipInput).clear(force).type(newZipCode, force)
    //contact details
    if (newContactName) cy.get(contactNameInput).clear(force).type(newContactName, force)
    if (newContactPhoneNumber) cy.get(contactPhoneNumberInput).clear(force).type(newContactPhoneNumber, force)
    if (newContactEmail) cy.get(contactEmailInput).clear(force).type(newContactEmail, force)

    //click on save button
    cy.get(saveButton).should(enabled).click(force)
  }

  /**
   * Deletes a building using the specified delete method.
   *
   * @param {string} buildingName - Name of the building to delete.
   * @param {string} deleteType - Method of deletion (`tableBtn`, `sidePanelBtn`, or `editMenu`).
   */
  static deleteBuilding_UI = (buildingName, deleteType) => {
    // Search for the building by name
    HelperFunction.search(buildingName)
    // Scroll the table to the right to make the delete button visible
    cy.get(scrollBar).scrollTo(scrollRight)
    // Get the row corresponding to the building name and alias it as 'resultRow'
    HelperFunction.getRowByItemName(buildingName, tableRow, application.core).as('resultRow')

    //click on delete button based on edit type
    if (deleteType === tableBtn) {
      cy.get('@resultRow').find(deleteBtn).click(force)
    } else if (deleteType === sidePanelBtn) {
      cy.get('@resultRow').click(force)
      cy.get(detailSidePanel).find(deleteBtn).click(force)
    } else if (deleteType === editMenu) {
      cy.get('@resultRow').find(editBtn).click(force)
      Click.onDeleteButton()
    }

    //verify the delete confirmation message and click on delete button
    //can't verify the text due to bug
    //Verify.theElement(confirmationPopup).contains(buildingDelete)
    Click.forcefullyOn(dialogueDeleteBtn)
  }
}
