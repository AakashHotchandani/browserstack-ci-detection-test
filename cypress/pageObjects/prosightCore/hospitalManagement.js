import selectors from '../../utils/selectors/prosightCore'
import commandOptions from '../../utils/constants/commandOptions'
import constants from '../../utils/constants/prosightCore/hospitalManagementConst'
import options from '../../utils/constants/commandOptions.js'
import HelperFunction from '../../utils/helpers/crossModuleFunctions.js'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants.js'
import globalSels from '../../utils/selectors/globalSels'
import Click from '../../utils/Interactions/click'
import Verify from '../../utils/assertions/verify.js'
import hospitalManagementPageSel from '../../utils/selectors/prosightCore.js'
import userConst from '../../utils/constants/prosightCore/userManagementConst.js'

const { hospital } = leverageConstants.objectTypes
const { buttonTag, checkbox, divTag, deleteBtn } = globalSels
const { hospitalManagement, delete: deleteButtonDialog } = constants.buttonsInnerText
const { right } = constants

const {
  nameInputField,
  hospitalDropdowns,
  timeZoneDropdowns,
  streetAddressInput,
  cityInput,
  stateDropdown,
  popupItems,
  zipInput,
  contactNameInput,
  contactEmailInput,
  phoneNumberInput,
  saveButton,
  detailSidePanel,
  tableRow,
  deleteButton,
  editButton,
  hospitalTableScrollContainer,
  hidHospital
} = selectors.hospitalManagementPageSel
const apiBaseURL = Cypress.env('API_BaseUrl')
const systemId = Cypress.env('SystemId')
const projectId = Cypress.env('ProjectId')
const { confirmHospitalDeletionMessage, hospitalCannotBeDeleted } = constants.confirmationMessages
const { deleteDialogBox } = hospitalManagementPageSel.hospitalManagementPageSel
const { core } = userConst.apps

/** This class consists of different static functions related to hospitalManagement page
 * @class HospitalManagement
 */
export default class HospitalManagement {
  /**
   * Adds a new hospital with the provided details.
   *
   * @param {Object} params - The parameters for adding a new hospital.
   * @param {string[]} params.hospitalName - An array containing the hospital name.
   * @param {string} params.timezone - The timezone of the hospital.
   * @param {string} params.streetAddress - The street address of the hospital.
   * @param {string} params.city - The city where the hospital is located.
   * @param {string} params.state - The state where the hospital is located.
   * @param {string} params.zipCode - The ZIP code of the hospital.
   * @param {string} params.email - The contact email of the hospital.
   * @param {string} params.mobileNumber - The contact mobile number of the hospital.
   * @param {string} params.contactPersonName - The name of the contact person for the hospital.
   * @param {string[]} params.applications - An array of applications associated with the hospital.
   */
  static addNewHospital = ({ hospitalName, timezone, streetAddress, city, state, zipCode, email, mobileNumber, contactPersonName, applications }) => {
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
    cy.get(hidHospital).click(commandOptions.force)
    applications.forEach((application) => {
      cy.contains(divTag, application).prev().find(checkbox).click(commandOptions.force)
    })
    cy.get(saveButton).click(commandOptions.force)
  }

  static deleteHospitalNameFieldContent = () => {
    cy.get(nameInputField).clear(commandOptions.force)
  }

  static navigateToAddHospital = () => {
    cy.get(selectors.hospitalManagementPageSel.createHospitalButton).click(commandOptions.force)
  }

  /**
   * Edits the contact information details such as the contact person's name and email.
   * It clears the existing information and enters the new details provided.
   *
   * @param {Object} contactDetails - An object containing the new contact information.
   * @param {string} contactDetails.contactPersonName - The name of the contact person.
   * @param {string} contactDetails.email - The email address of the contact person.
   */
  static editContactInformation = (contactDetails, hospitalDetails) => {
    const { hospitalName, zipCode, contactPersonName, email } = hospitalDetails
    cy.get(nameInputField).should('have.value', hospitalName)
    cy.get(zipInput).should('have.value', zipCode)
    cy.get(contactNameInput).should('have.value', contactPersonName)
    cy.get(contactEmailInput).should('have.value', email)
    cy.get(contactNameInput).clear(commandOptions.force)
    cy.get(contactNameInput).type(contactDetails.contactPersonName, commandOptions.force)
    cy.get(contactEmailInput).clear(commandOptions.force)
    cy.get(contactEmailInput).type(contactDetails.email, commandOptions.force)
    cy.get(saveButton).click(commandOptions.force)
  }

  /**
   * Navigates to the edit page of a specific hospital and clicking on the edit button.
   *
   * @param {string} hospitalName - The name of the hospital to be edited.
   */
  static navigateToEditHospital = (hospitalName) => {
    cy.reload()
    cy.get(tableRow).contains(hospitalName).click(commandOptions.force)
    cy.get(editButton).click(commandOptions.force)
  }

  /**
   * Deletes a hospital from the side panel by clicking on the hospital's row and confirming the deletion.
   *
   * @param {string} hospitalName - The name of the hospital to be deleted.
   */
  static deleteHospitalFromSidePanel = (hospitalName) => {
    cy.get(tableRow).contains(hospitalName).click(commandOptions.force)
    cy.get(deleteButton).click(commandOptions.force)
    Verify.textPresent.isVisible(confirmHospitalDeletionMessage)
    Click.on(globalSels.deleteButton)
  }

  /**
   * Deletes a hospital from the edit form page by verifying the hospital details are correctly populated,
   * checking that the save button is disabled and the delete button is enabled,
   * then confirming the deletion.
   *
   * @param {Object} hospitalDetails - The details of the hospital to be deleted.
   */
  static deleteHospitalFromForm = (hospitalDetails) => {
    const { hospitalName, timezone, streetAddress, city, state, zipCode, contactPersonName, mobileNumber, email } = hospitalDetails
    cy.get(nameInputField).should('have.value', hospitalName)
    cy.get(streetAddressInput).should('have.value', streetAddress)
    cy.get(cityInput).should('have.value', city)
    cy.get(zipInput).should('have.value', zipCode)
    cy.get(contactNameInput).should('have.value', contactPersonName)
    cy.get(contactEmailInput).should('have.value', email)
    Verify.theElement(saveButton).isDisabled()
    Verify.theElement(globalSels.deleteButton).isEnabled()
    Click.forcefullyOn(globalSels.deleteButton)
    Verify.textPresent.isVisible(confirmHospitalDeletionMessage)
    Click.onContainText(deleteDialogBox, deleteButtonDialog)
  }

  /**
   * Deletes a hospital from the table view by scrolling  and confirming the deletion.
   *
   * @param {string} state - The state of the hospital to be deleted.
   */
  static deleteHospitalFromTableView = (state) => {
    cy.get(hospitalTableScrollContainer).scrollTo(right)
    HelperFunction.getRowByItemName(state, globalSels.resultRow, core).as('deleteButton')
    Click.onButton('@deleteButton', deleteBtn)
    Click.onContainText(deleteDialogBox, deleteButtonDialog)
  }

  /**
   * Attempts to delete a hospital that has associated multiple buildings from the table view.
   *
   * @param {string} state - The state of the hospital to be deleted.
   */
  static deleteHospitalWithBuildings = (state) => {
    cy.get(hospitalTableScrollContainer).scrollTo(right)
    HelperFunction.getRowByItemName(state, globalSels.resultRow, core).as('deleteButton')
    Click.onButton('@deleteButton', deleteBtn)
    Verify.textPresent.isVisible(hospitalCannotBeDeleted)
    Click.onContinueButton()
  }

  static navigateAfterNotDeletedHospital = () => {
    cy.get(selectors.hospitalManagementPageSel.confirmActionDialogButton).contains(constants.buttonsInnerText.continue).click(commandOptions.force)
  }

  /**
   * Verifies the hospital details in side Panel.
   *
   * @param {Object} hospitalData - The hospital data object containing details to verify.
   * @param {string} hospitalData.hospitalName - The name of the hospital.
   * @param {string} hospitalData.streetAddress - The street address of the hospital.
   * @param {string} hospitalData.contactPersonName - The contact person name for the hospital.
   * @param {string} hospitalData.email - The email address for the hospital contact person.
   * @param {number} hospitalData.mobileNumber - The mobile number for the hospital contact person.
   * @param {Array<string>} hospitalData.applications - The list of applications associated with the hospital.
   */
  static verifyHospitalDetailsInSidePanel = (hospitalData) => {
    const hospitalName = hospitalData.hospitalName
    const detailsToVerify = {
      'Street Address': hospitalData.streetAddress,
      City: hospitalData.city,
      State: hospitalData.state,
      'Zip Code': hospitalData.zipCode,
      'Contact Name': hospitalData.contactPersonName,
      'Contact Number': HelperFunction.formatPhoneNumber(hospitalData.mobileNumber),
      'Contact Email': hospitalData.email,
    }
    Verify.theElement(detailSidePanel).contains(hospitalName)
    HelperFunction.verifyValueFromSidePanel(detailsToVerify)

    // Verify applications separately
    hospitalData.applications.forEach((application) => {
      Verify.theElement(detailSidePanel).contains(application)
    })
  }

  /**
   * Creates a hospital using the provided hospital data via an API request.
   *
   * @param {Object} hospital - The hospital data.
   * @param {Array} hospital.hospitalName - An array where the second element is the hospital's name.
   */
  static createHospital_API = (hospital) => {
    cy.task('getAuthToken').then((authToken) => {
      cy.api({
        method: commandOptions.requestMethod.post,
        failOnStatusCode: false,
        url: `${apiBaseURL}project/${projectId}/system/${systemId}/srv/prosightApiServer/hospital`,
        headers: {
          authorization: authToken,
        },
        body: {
          name: hospital.hospitalName,
          data: {
            name: hospital.hospitalName,
            address: {
              street: hospital.streetAddress,
              city: hospital.city,
              state: hospital.state,
              zipCode: hospital.zipCode,
            },
            contact: {
              name: hospital.contactPersonName,
              phone: '9285963258',
              email: hospital.email,
            },
            hospitalType: 'Default',
            timezone: 'America/New_York',
            position: {
              lat: 33.51054,
              lon: -86.786333,
            },
          },
          metadata: {
            timeZone: 'America/New_York',
            allowedApplications: ['safety', 'assets', 'environment', 'core'],
          },
         hasHIDTags: true
        },
      }).then((res) => {
        if (res.status === 201) {
          expect(res.status, 'Verifying the response code').to.equal(201)
          cy.log(`${hospital.hospitalName} created successfully`)
          expect(res.body.name).to.eq(hospital.hospitalName)
          expect(res.body.data.address.street).to.eq(hospital.streetAddress)
        } else {
          const errorMsg = `Failed to create ${hospital.hospitalName}`
          cy.log(errorMsg)
        }
      })
    })
  }

  /**
   * Deletes a hospital from the API using the provided hospital name.
   *
   * This function first retrieves the `authToken` and `Id` of the hospital by calling the `search_API` function from `HelperFunction`.
   * It then sends a DELETE request to the API endpoint to remove the hospital. The function checks the response status and logs
   * appropriate messages based on whether the deletion was successful or not.
   *
   *
   */
  static deleteHospital_API = (hospitalName) => {
    HelperFunction.search_API(hospitalName, hospital, true).then(({ authToken, Id, items }) => {
      cy.log("Entered into hospital")
         if (!items || items.length === 0) {
           cy.log(`No hospitals found with name: ${hospitalName},response is ${items}`)
           return
         }
   
         cy.log(`Deleting ${items.length} hospitals(s) named: "${hospitalName}"`)
         items.forEach((ele) => {
           let hospital_ID = ele.id
           cy.api({
            method: options.requestMethod.delete,
            failOnStatusCode: false,
            url: `${apiBaseURL}project/${projectId}/system/${systemId}/srv/prosightApiServer/hospital/${hospital_ID}`,
            headers: {
              authorization: authToken,
            },
          }).then((res) => {
            if (res.status === 200) {
              expect(res.status, 'Verifying the response code').to.equal(200)
              cy.log(`${hospitalName} deleted successfully`)
            } else {
              const errorMsg = `Failed to delete ${hospitalName}`
              cy.log(errorMsg)
            }
          })
         })
       })
  }
}
