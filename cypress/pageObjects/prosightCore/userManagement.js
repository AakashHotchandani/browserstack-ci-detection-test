/* eslint-disable no-undef */
import { prosightModules } from '../../utils/selectors/prosightModules'
import prosightCore from '../../utils/selectors/prosightCore'
import Click from '../../utils/Interactions/click'
import Type from '../../utils/Interactions/type'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import userManagementConst from '../../utils/constants/prosightCore/userManagementConst'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
const { hospital } = leverageConstants.objectTypes
import { Verify } from '../../utils/assertions'
import commandOptions from '../../utils/constants/commandOptions'
import globals from '../../utils/selectors/globalSels'
import APIEndpoints from '../../../APIEndpoints'
import LoginPage from '../signIn/siginPage'
const system_ID = Cypress.env('SystemId')
const baseUrl = Cypress.env('API_BaseUrl')
const projectId = Cypress.env('ProjectId')
/** This class consists of different static functions related to userManagement page
 * @class userManagement
 */
export default class UserManagement {
  /**
   * Function that selects the User Role, checking for an exact match
   * @param {string} userRoleName user role string for user role, written same as json file name.
   * @param {boolean} withinSendInvite Boolean to check weather or not you're on send invite view.
   */
  static selectUserRole = (userRoleName, withinSendInvite = false) => {
    // Click button to activate the dropdown and get its list
    const exactRoleName = userRoleName
    if (withinSendInvite) {
      Click.forcefullyOn(prosightCore.userManagementSel.userRoleButtonInInvite)
      Click.onContainText(prosightCore.userManagementSel.roleOptionInInvite, exactRoleName)
    } else {
      cy.get(prosightCore.userManagementSel.userRoleLabel).parent().find(prosightCore.userManagementSel.userRoleButton).click(commandOptions.force)
      Click.onContainText(prosightCore.userManagementSel.roleOption, exactRoleName)
    }
  }

  /**
   * Function that verify all checkboxes are in the expected state (check||unchecked)
   * @param {object} indexOfApp Index of the app container
   * @param {string} appName Name of the main app (e.g. core,env,assets...)
   * @param {object} permissionsObj Json object that have all permissions for a particular role
   */
  static verifyCheckboxes = (indexOfApp, appName, permissionsObj) => {
    cy.get(prosightCore.userManagementSel.moduleContainer)
      .eq(indexOfApp)
      .within(() => {
        const prosightModuleObj = prosightModules[appName]

        // Get the submodules object for the current module
        const subModulesObj = permissionsObj[appName]
        const subModulesName = Object.keys(subModulesObj) // [e.g. assetsSettig...]

        subModulesName.forEach((subModuleName) => {
          const isChecked = subModulesObj[subModuleName]
          const indexSubModule = prosightModuleObj[subModuleName].index

          // Interacting with the checkbox and asserting its state
          cy.get(prosightCore.userManagementSel.checkboxInModuleContainer)
            .eq(indexSubModule)
            .should(isChecked ? 'be.checked' : 'not.be.checked')
        })
      })
  }

  /**
   * Function that creates an user
   * @param {object} userData Object that contains the user data (phone, name, hospital...)
   */
  static createUser = (userData) => {
    const { name, email, role, phone = null, department = null, hospital = 'Oschner Lafayette General1' } = userData
    // selectors
    const {
      nameInput,
      phoneInput,
      emailInput,
      usernameInput,
      dropdownList: departmentList,
      dropdownList: hospitalList,
      hospitalDropdown,
      departmentDropdown,
      createUserButton,
      passwordInput,
    } = prosightCore.userManagementSel.users

    Click.forcefullyOn(createUserButton)
    Click.onContainText(globals.dropdownContainer, userManagementConst.buttonsInnerText.createUser)
    // Wait for pasw to load
    Verify.theElement(passwordInput).hasNotValue('')
    // user details section
    Type.theText(name).into(nameInput)
    Type.theText(email).into(emailInput)
    Type.theText(email).into(usernameInput)

    // optional fields
    if (phone) Type.theText(phone).into(phoneInput)
    if (department) {
      Click.forcefullyOn(departmentDropdown)
      Click.onContainText(departmentList, department)
    }
    // permissioning section
    Click.forcefullyOn(hospitalDropdown)
    Click.onContainText(hospitalList, hospital)

    UserManagement.selectUserRole(role)
    Verify.theElement(globals.createBtn).isEnabled()
    Click.forcefullyOn(globals.createBtn)
  }

  /**
   * Function that deletes an user and test the cancel button
   * @param {string} name Username you want to delete, it's unique for every user
   * @param {string} deleteActionType Method for deletion. ('default' to delete from button and 'sidePanel')
   * @param {boolean} cancelAfterDelete Option for testing the cancel button that appears after clicking on Delete
   */
  static deleteUser = (username, deleteActionType = userManagementConst.deleteActionType.default, cancelAfterDelete = false) => {
    const { userRow, deleteButton, sidePanelButtons } = prosightCore.userManagementSel.users
    cy.intercept('DELETE', userManagementConst.endpoints.users).as('deleteUser')
    HelperFunction.search(username)
    HelperFunction.getRowByItemName(username, userRow).as('userElement')

    if (deleteActionType === userManagementConst.deleteActionType.sidePanel) {
      // delete from sidePanel
      cy.get('@userElement').click(commandOptions.force)
      cy.get(sidePanelButtons).find(deleteButton).click(commandOptions.force)
    } else {
      // delete directly from deleteButton
      cy.get('@userElement').find(deleteButton).click(commandOptions.force)
    }
    if (cancelAfterDelete) {
      Verify.textPresent.isVisible(userManagementConst.confirmationMessages.deleteUserConfirmation)
      Click.onCancelButton()
      return
    }

    Verify.textPresent.isVisible(userManagementConst.confirmationMessages.deleteUserConfirmation)
    Click.onDeleteButton()
    // check if user doesn't exist
    cy.wait('@deleteUser').its('response.statusCode').should('eq', 200)
  }

  /**
   * Function that edits an user and test the cancel button
   * @param {object} currentInfo Object data with the current info
   * @param {object} newInfo Object with the newInfo
   * @param {string} editActionType Type of edit you want. Options are: default and sidePanel
   * @param {boolean} cancelAfterDelete True if you want to test the cancel button from edit page
   */
  static editUser = (
    currentInfo,
    newInfo,
    editActionType = userManagementConst.editActionType.default,
    deleteAfterEdit = false,
    cancelAfterDelete = false
  ) => {
    const { name, department, phone, email, role, hospital, username } = newInfo
    const {
      userRow,
      sidePanelButtons,
      editButton,
      emailInput,
      phoneInput,
      nameInput,
      hospitalDropdown,
      departmentDropdown,
      dropdownList: departmentList,
      saveAfterEdit,
      dropdownList: hospitalList,
      confirmSave,
      deleteButtonDialog,
      cancelButtonDialog,
      editUserButtonInHeader,
      usernameInput,
      userRoleLabel,
      userRoleInput,
    } = prosightCore.userManagementSel.users

    // look for the user
    HelperFunction.search(currentInfo.name)
    HelperFunction.getRowByItemName(currentInfo.name, userRow).as('userElement')

    if (editActionType === userManagementConst.editActionType.sidePanel) {
      // delete from sidePanel
      cy.get('@userElement').click(commandOptions.force)
      cy.get(sidePanelButtons).find(editButton).click(commandOptions.force)
    } else {
      cy.get('@userElement').find(editButton).click(commandOptions.force)
    }
    // wait until data is loaded
    cy.get(emailInput).should('not.have.value', '')
    // Verify the current info matches
    Verify.theElement(emailInput).hasValue(currentInfo.email)
    Verify.theElement(nameInput).hasValue(currentInfo.name)
    Verify.theElement(usernameInput).hasValue(currentInfo.username)
    //cy.get(userRoleLabel).parent().find(userRoleInput).as('currentRole')
    //Verify.theElement('@currentRole').hasValue(currentInfo.role) -- Can't apply because there''s bug that show role names wrong

    if (role) {
      // get the role name how's written in the list
      UserManagement.selectUserRole(role)
    }
    if (email) {
      Type.theText(email).into(emailInput)
    }
    if (department) {
      Click.forcefullyOn(departmentDropdown)
      Click.onContainText(departmentList, department)
    }
    if (phone) {
      Type.theText(phone).into(phoneInput)
    }
    if (name) {
      Type.theText(name).into(nameInput)
    }
    if (hospital) {
      Click.forcefullyOn(hospitalDropdown)
      Click.onContainText(hospitalList, hospital)
    }

    if (deleteAfterEdit) {
      Click.onDeleteButton()
      Click.forcefullyOn(deleteButtonDialog)
      return
    }
    if (cancelAfterDelete) {
      Click.onDeleteButton()
      Verify.textPresent.isVisible(userManagementConst.confirmationMessages.deleteUserConfirmation)
      Click.forcefullyOn(cancelButtonDialog)
      Click.forcefullyOn(editUserButtonInHeader)
      return
    }
    // save the edited user
    Click.forcefullyOn(saveAfterEdit)
    if (role || hospital) {
      Verify.textPresent.isVisible(userManagementConst.confirmationMessages.confirmPermissioningChange)
      Click.forcefullyOn(globals.confirmationBtnInConfirmationDialogue)
    }
  }

  /**
   * Function that creates email invitation
   * @param {object} userData Object that contains the user data (phone, name, hospital...)
   */
  static createEmailInvite = (userData) => {
    const { hospital, role, email } = userData
    const { emailInput, addEmailButton, hospitalDropdown } = prosightCore.userManagementSel.users.emailInvite
    const hospitalList = prosightCore.userManagementSel.users.dropdownList
    Click.forcefullyOn(hospitalDropdown)
    Click.onContainText(hospitalList, hospital)
    // get the role name as it's written in the list
    UserManagement.selectUserRole(role, true)
    Type.theText(email).into(emailInput)
    Click.forcefullyOn(addEmailButton)
  }

  /**
   * Function that applies filter(s) in Users page
   * @param {string} keyName Name of the key in dataObj
   * @param {object | string} userData Object or string that contains user data
   * @param {string} buttonNameFilter Name of the button filter
   * @param {string} buttonSel Selector of the button filter
   * @param {boolean} buttonInColum True when button doesn't have title. It will look for the text parent.
   * @param {string} module
   */
  static applyFilters = (keyName, userData, buttonNameFilter, buttonSel, buttonInColum = false, module = 'admin') => {
    // it check type of parameter since it can accept a whole object or just a string
    const filtersArr = typeof userData === 'object' ? HelperFunction.getArrayUniquesByObj(userData, keyName, true) : [userData]
    const { applyButtonFilter, checkboxInFilter, filterRow, filterContainer } = prosightCore.userManagementSel.users

    filtersArr.forEach((filter) => {
      if (buttonInColum) {
        if (module != 'admin') {
          cy.get(buttonSel).parent().contains(buttonNameFilter).parent().find('button').click(commandOptions.force)
        } else {
          cy.get(buttonSel).parent().contains(buttonNameFilter).find('button').click(commandOptions.force)
        }
      } else {
        Click.onContainText(buttonSel, buttonNameFilter)
      }
      const optionName = new RegExp('^' + filter + '$')
      // it checks if the filter option has already been applied
      Verify.theElement(filterContainer).isVisible()
      //cy.get(filterContainer).contains(optionName).parent().find(checkboxInFilter).check(commandOptions.force)
      cy.get(filterRow)
        .contains(optionName)
        .parent()
        .find(checkboxInFilter)
        .as('checkbox')
        .then(($checkbox) => {
          if (!$checkbox.prop('checked')) {
            cy.get('@checkbox').check(commandOptions.force)
          }
        })
      Click.forcefullyOn(applyButtonFilter)
    })
  }

  /**
   * Function that checks if all filters were applied in Users page
   * @param {string} keyName Name of the key in dataObj
   * @param {object} dataObj Object that contains user data
   */
  static checkFilterPillRow = (keyName, dataObj) => {
    const { pillsContainer, secondaryPillsContainer, secondaryPillsButton } = prosightCore.userManagementSel.users
    let filterTitlesArr = HelperFunction.getArrayUniquesByObj(dataObj, keyName, true)

    cy.get(pillsContainer)
      .find('[title]:button') // Finds child elements with both title attribute and are buttons
      .each(($button) => {
        // Extract title of each button and filter it out from the original array
        const titleFromButton = $button.attr('title')
        if (filterTitlesArr.includes(titleFromButton)) {
          Verify.theElement(pillsContainer).contains(titleFromButton)
          filterTitlesArr = filterTitlesArr.filter((title) => title !== titleFromButton)
        }
      })
      .then(() => {
        // Check in the second filter pill if the condition is met
        if (filterTitlesArr.length === 0) return
        Click.forcefullyOn(secondaryPillsButton)
        filterTitlesArr.forEach((title) => {
          Verify.theElement(secondaryPillsContainer).contains(title)
          filterTitlesArr = filterTitlesArr.filter((title) => title !== title)
        })
      })
  }

  /**
   * Function that will remove all elements depending of the type of removal
   * @param {string} removeActionType Type of removal to execute. From the main filter pill or secondary (dropdownButton)
   */
  static removeFilter = (removeActionType = userManagementConst.removeActionType.mainFilterPill) => {
    // Selectors from the secondary pill filter (the one that has a dropdown)
    const { pillsContainer, secondaryPillsContainer, secondaryPillRowFilter, secondaryPillsButton } = prosightCore.userManagementSel.users

    if (removeActionType === userManagementConst.removeActionType.secondaryFilterPill) {
      Click.forcefullyOn(secondaryPillsButton)
      cy.get(secondaryPillsContainer)
        .find(secondaryPillRowFilter)
        .each(($row, index, $rows) => {
          const textOfRow = $row.text().trim()
          Click.onContainText(secondaryPillRowFilter, textOfRow)
          // Check if it's the last iteration
          if (index < $rows.length - 1) {
            Click.forcefullyOn(secondaryPillsButton)
          }
        })
    } else {
      cy.get(pillsContainer)
        .find('[title]:button') // Finds child elements with both title attribute and are buttons
        .each(($button) => {
          // Extract title of each button and filter it out from the original array
          const titleFromButton = $button.attr('title')
          Click.onContainText($button, titleFromButton)
        })
    }
  }

  /**
   * This function is used to delete user using API
   * @param {String} email  -  The name used to delete the email
   */
  static deleteUsers_API = (email, hospitalName = null) => {
    let filteredIds = []
    const { userSearchEndpoint, deleteUserEndpoint } = APIEndpoints
    HelperFunction.search_API(hospitalName, hospital).then(({ authToken, Id }) => {
      let hospital_ID = Id
      LoginPage.loginToApplication().then(({ authToken }) => {
        cy.api({
          method: 'GET',
          url: baseUrl + userSearchEndpoint(system_ID, hospital_ID),
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
        }).then((response) => {
          if (response.status === 200) {
            if (response.body.items.length === 0) {
              cy.log('Items not found ')
            } else {
              const item = response.body.items
              filteredIds = item.find((user) => user.email === `${email}`)?.id
              if (filteredIds) {
                let userId = filteredIds
                cy.api({
                  method: 'DELETE',
                  url: baseUrl + deleteUserEndpoint(system_ID, hospital_ID),
                  failOnStatusCode: false,
                  headers: {
                    authorization: authToken,
                  },
                  body: {
                    userId: userId,
                    deviceId: hospital_ID,
                    projectId: projectId,
                  },
                })
              } else {
                cy.log('No user found')
              }
            }
          } else {
            cy.log('Unable to fetch user details')
          }
        })
      })
    })
  }
}
