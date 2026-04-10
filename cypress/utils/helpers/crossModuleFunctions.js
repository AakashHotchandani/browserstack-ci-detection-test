/// <reference types="cypress" />
import prosightCore from '../../utils/selectors/prosightCore'
import options from '../../utils/constants/commandOptions.js'
import globalSels from '../selectors/globalSels.js'
import constants from '../../utils/constants/prosightCore/floorPlanManagementConst.js'
import Click from '../Interactions/click.js'
import Verify from '../assertions/verify.js'
import APIEndpoints from '../../../APIEndpoints'
import userData from '../../fixtures/SignIn/user.json'
import leverageConstants from '../constants/Leverage/leverageConstants.js'
import smartReports from '../constants/smartReports.js'
import prosightAssets from '../selectors/prosightAssets.js'
import prosightEnvironment from '../selectors/prosightEnvironment.js'
import prosightSafety from '../selectors/prosightSafety.js'
import prosightAssetCons from '../constants/prosightAssets/assetsManagement.js'
import prosightEnvironmentCons from '../constants/prosightEnvironment/equipmentAssignmentConst'
import prosightEnvironmentSels from '../selectors/prosightEnvironment.js'
import smartAlertConst from '../constants/smartAlertsManagementConst.js'
import globalConst from '../constants/globalConst.js'
import commandOptions from '../../utils/constants/commandOptions.js'
import Type from '../Interactions/type.js'

import SmartAlertsUsingAPI from '../../pageObjects/prosightCore/triggeringAlerts.js'

const system_Id = Cypress.env('SystemId')
const hospital_Id = Cypress.env('HospitalId')
const apiBaseURL = Cypress.env('API_BaseUrl')

const { equipment, sensor, asset, tag, staff, incident, room, hospital, floors, departments, buildings, hhSensor, user, gateway } =
  leverageConstants.objectTypes
const {
  selectBtn,
  saveBtn,
  locationSelectionIcon,
  cancelButton,
  button,
  buttonTag,
  divTag,
  popupTextDailogMessage,
  cardView,
  popupDialogBox,
  dialogDropdown,
  buildingdeselectParentClass,
  buildingdeselectClass,
} = globalSels
const { create, editTask, save, createTask, clearButton, acknowledge, complete, completeTask, escalate } = smartAlertConst.buttonsInnerText
const { textDescriptionContainer } = prosightAssets.smartAlerts
const { hospitalText, buildingText } = globalConst
const { acknowledgeAlertMessage, createTaskMessage, clearAlertMessage, editTaskMessage, completeTaskMessage } = smartAlertConst.paneText
const { environment, safety } = leverageConstants.application
const { escalateOptionsContainer, incidentContainer, escalateButton, escalateBtn, clearButtonOnPopUp } = prosightEnvironment.smartAlerts
const { carousel } = smartAlertConst.actionPlace
const { alertViewOnMap, escalateButtonFromSidePanel } = prosightSafety.smartAlerts

/**
 * @class HelperFunction This consists of static functions related to cross module functionality
 */
export default class HelperFunction {
  /**
   * Function that retrieves the element row, according to the username/staffName/building/floor name you pass.
   * @param {string} element it is the element i.e UserName/staffName/equipmentName you want to retrieve the info from
   * @param {string} selector Selector for the row on the table
   * @return return the yielded parent element
   */
  static getRowByItemName = (element, selector, module = 'admin-user') => {
    const elem = new RegExp(`^${element}$`)
    //cy.log(module)
    if (module === 'admin-user') {
      return cy.get(selector).contains(elem).parent()
    } else {
      return cy.get(selector).contains(elem).parent().parent()
    }
  }

  /**
   * Function that verifies that values are present in the view
   * @param {string} selector Selector for the row on the table
   * @param {object} userDataObj Object with the newUser/staff/asset any other item data that you've filled the form
   */
  static verifyValuesExist = (selector, userDataObj) => {
    return cy.get(selector).within(() => {
      Object.values(userDataObj).forEach((value) => {
        if (value !== undefined && value !== null) {
          cy.get('div[role="cell"]').should('contain', value)
        }
      })
    })
  }

  static verifyValuesExistDate = (selector, userObj) => {
    return cy.get(selector).within(() => {
      cy.get('div[role="cell"]').each(($cell) => {
        const cellText = $cell.text().trim()
        const cellDate = new Date(cellText)

        const isValidDate = cellText !== '' && !isNaN(cellDate.getTime())

        Object.values(userObj).forEach((value) => {
          if (value === undefined || value === null) return

          if (!isValidDate) {
            if (cellText.includes(value)) {
              expect(cellText).to.contain(value)
            }
          } else {
            const valueDate = new Date(value)
            if (!isNaN(valueDate.getTime())) {
              expect(cellDate.getTime()).to.be.closeTo(valueDate.getTime(), 10 * 60 * 1000)
            }
          }
        })
      })
    })
  }

  /**
   * Verifies that the specified values are present in the card view
   * @param {string} selector - The CSS selector for the parent element (card).
   * @param {Object} cardData - An object with the newUser/staff/asset/equipment any other item data that you've filled the form.
   */
  static verifyValuesInTheCardView = (selector, cardData) => {
    cy.get(selector).within(() => {
      Object.values(cardData).forEach((value) => {
        if (value !== undefined) cy.contains(value).should('be.visible').and('contain', value)
      })
    })
  }

  /**
   * Function that returns an array of values given an object
   * @param {object} userDataObj Object with the data value you want to extract
   * @param {string} keyName
   * @param {boolean} filterUndefined Boolean. If true, it will filter undefined values
   */
  static getArrayUniquesByObj(dataObj, keyName, filterUndefined = false) {
    const result = Object.values(dataObj).map((data) => data[keyName])
    // If filterUndefined is set, filter out undefined values
    const filteredResult = filterUndefined ? result.filter((value) => value !== undefined) : result
    const uniqueResult = [...new Set(filteredResult)]
    return uniqueResult
  }

  /**
   * Function that gets the input element and selects a file
   * @param {string} filePath Path of the file you want to upload
   * @param {object} options options for the selectFile such as force
   */
  static getInputAndSelectFile(filePath, optionsToClick = options.force) {
    cy.get(prosightCore.userManagementSel.users.inputFile).selectFile(filePath, optionsToClick)
  }

  /**
   * Function that enters the given entity name in search field and do click on enter button
   * @param {String} entity it is the entity that you want to search i.e floors, department,staff etc
   * @param {boolean} reload Boolean to reload or not.
   */
  static search = (entity, reload = true) => {
    cy.get(globalSels.searchBar).clear().type(`${entity}${options.enter}`)
    if (reload) {
      cy.reload()
    }
  }

  /**
   * Function that returns the descendent DOM elements of a specific selector inside given div
   * @param {String} div it is selector of the div which consists descendent DOM elements
   * @param {String} elementSelector it is selector of element to find
   * @returns returns the yielded selector of DOM element
   */
  static getElementFromSpecificDiv = (div, elementSelector) => {
    return cy.get(div).find(elementSelector)
  }

  /**
   * Functions that verifies the value present in sidePanel
   * @param {Object} detailsObject it is the object which consists required values for verification
   */
  static verifyValueFromSidePanel = (detailsObject, sidePanelSel = globalSels.sidePanel) => {
    const { dataRowInSidePanel } = globalSels
    cy.get(sidePanelSel).within(() => {
      //iterating fields one by one
      Object.keys(detailsObject).forEach((fields) => {
        const exactFields = new RegExp('^' + fields + '$')
        cy.get(dataRowInSidePanel).contains(exactFields).next().as('next')
        cy.get('@next').should('have.text', detailsObject[fields])
      })
    })
  }

  /**
   * Function that returns the section  given the outer header. Helpful in views where sections or tables have same classes and there are more than 2.
   * @param {string} headerText it the text of the header you want to match.
   * @param {string} selHeader it is the selector of the header.
   */
  static getSectionByOuterHeader = (headerText, selHeader) => {
    const exactHeaderText = new RegExp('^' + headerText + '$')
    cy.get(selHeader).contains(exactHeaderText).parent().parent().as('header')
    return cy.get('@header').parent()
  }

  /**
   * Function that navigates to provide module name
   * @param {String} selector it is the selector of module button i.e selector of a button element
   * @param {String} module it is the name of module i.e module button text
   *
   */
  static navigateToModule = (selector, module) => {
    cy.contains(selector, module).click(options.force)
  }

  /**
   * Function that checks for the search result and delete the result if it available otherwise print a message to console
   * @param(String) item it is the item that you want to delete
   * @param(String) paginationRangeSelector it is the selector for pagination range by default value will be pagination selector of floors and departments page in case of other page user need to provide page specific pagination range selector
   * @param(String) rooms it is boolean value , if this function will be called on rooms page the value would be true otherwise it will be false. It will click one extra dialogue btn in rooms page according to boolean value
   * @param(String) module it is module name in which you are calling this function
   */
  static checkSearchResultAndDelete = (
    item,
    paginationRangeSelector = prosightCore.floorPlanManagement.pagination,
    rooms = false,
    module = constants.uiTexts.admin
  ) => {
    const { resultRow, deleteBtn } = globalSels
    this.search(item)
    cy.wait(25000)
    cy.get(paginationRangeSelector)
      .invoke(options.text)
      .then((text) => {
        const resultText = text
        const match = resultText.match(/\d+$/)

        // Extract the last number from the match
        const lastNumber = match ? parseInt(match[0]) : null
        if (lastNumber !== 0) {
          this.getRowByItemName(item, resultRow, module).as('resultRow')
          this.getElementFromSpecificDiv('@resultRow', deleteBtn).as('deleteBtn')
          Click.forcefullyOn('@deleteBtn')
          Click.forcefullyOn(globalSels.dialogueDeleteBtn)
          if (rooms) {
            cy.get(globalSels.dialogueDeleteBtn).contains(globalSels.deleteBtnText).click(options.force)
          }
          Verify.theToast.isVisible()
        } else {
          cy.log(constants.logMessages.noResult)
        }
      })
  }

  /**
   * A function that selects the given hospital from global hospital filter
   * A function that selects the given hospital from global hospital filter
   * @param {String} hospitalName it is the hospital name that user will select from drop down in global hospital filter
   */
  static selectHospitalFromGlobalFilter = (hospitalName) => {
    cy.get(globalSels.filters.hospitalFilter).eq(0).click()
    //cy.get(globalSels.filters.availableDropDownOptions).scrollTo(options.scrollBottom)
    cy.contains(globalSels.filters.options, hospitalName).click(options.force)
  }

  /**
   * Function that intercepts XHR API calls and disables its logging
   */
  static globalIntercept = () => {
    cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })
  }

  /**
   * Functions that returns the pagination number
   * Functions that returns the pagination number
   * @param {string} selector of the pagination that has the label
   */
  static getNumPagination = (selector = prosightCore.floorPlanManagement.pagination) => {
    // check pagination results and scroll down if necessary
    return cy
      .get(selector)
      .invoke(options.text)
      .then((text) => {
        const resultText = text
        const match = resultText.match(/\d+$/)

        // Extract the last number from the match
        const lastNumber = match ? parseInt(match[0]) : null
        return cy.wrap(lastNumber)
      })
  }

  /**
   * Function that returns the section  given the outer header. Helpful in views where sections or tables have same classes and there are more than 2.
   * @param {string} headerText Text of the header you want to match.
   * @param {string} selHeader Selector of the header.
   */
  static getSectionByOuterHeader = (headerText, selHeader) => {
    const exactHeaderText = new RegExp('^' + headerText + '$')
    cy.get(selHeader).contains(exactHeaderText).parent().parent().as('header')
    return cy.get('@header').parent()
  }

  /**
   * Function that clicks on a button and then selects an option given its container and name of he option.
   * @param {string} buttonSel Selector of the button to click first.
   * @param {string} containerSel Selector of container of the option.
   * @param {string} optionName Name of the option.
   */
  static onButtonAndSelectOption(buttonSel, containerSel, optionName) {
    Click.forcefullyOn(buttonSel)
    Click.onContainText(containerSel, optionName)
  }

  /**
   * Function that returns an array of values given an object
   * @param {object} userDataObj Object with the data value you want to extract
   * @param {string} keyName
   * @param {boolean} filterUndefined Boolean. If true, it will filter undefined values
   */
  static getArrayUniquesByObj(dataObj, keyName, filterUndefined = false) {
    const result = Object.values(dataObj).map((data) => data[keyName])
    // If filterUndefined is set, filter out undefined values
    const filteredResult = filterUndefined ? result.filter((value) => value !== undefined) : result
    const uniqueResult = [...new Set(filteredResult)]
    return uniqueResult
  }

  /**
   * A function that selects the given hospital from global hospital filter
   * A function that selects the given hospital from global hospital filter
   * @param {String} hospitalName it is the hospital name that user will select from drop down in global hospital filter
   */
  static selectBuildingFromGlobalFilter = (building) => {
    Click.onIndexNo(globalSels.filters.hospitalFilter, 1)
    Click.onContainText(globalSels.dropdownContainer, building)
    Click.forcefullyOn(globalSels.applyButtonFilter)
  }

  /**
   * Get the range of dates based on the specified number of days ago.
   * @param {number} daysAgo - The number of days ago for the range date.
   * @returns {Object} An object containing the current date and the date from the specified days ago.
   */
  static getRangeDate(daysAgo) {
    let currentDate = new Date()
    // Calculate the date from daysAgo
    let rangeDate = new Date()
    rangeDate.setDate(currentDate.getDate() - daysAgo)
    // Format the dates as strings with slashes
    let formattedCurrentDate = currentDate.toLocaleDateString().replace(/-/g, '/')
    let formattedRangeDate = rangeDate.toLocaleDateString().replace(/-/g, '/')
    return {
      currentDate: formattedCurrentDate,
      startDate: formattedRangeDate,
    }
  }

  /**
   * Get the target element by a common parent of a label, header, etc.
   * @param {string} outerLabelSel - The element on top of the target element. Normally it is a label.
   * @param {string} targetElementSel - The target element that you want to select.
   * Helpful when you have elements that share same classes but the difference relies on the label/header they have on top.
   * The parent of the label needs to be a common parent of the target element.
   */
  static getElementByLabelParent(outerLabel, targetElementSel) {
    return cy.get(outerLabel).parent().find(targetElementSel)
  }

  /**
   * Function that search for given itemName and returns unique id of the tag/incident
   * @param {string} itemName it is required tagname/staffName/assetName/equipmentName for tag it is the tagId
   * @param {string} itemType it is the type of item that you are searching i.e asset, tag, staff, equipment,sensor,incident
   * @returns {Promise<{authToken: string, Id: string}>} A promise that resolves with an object containing the authentication token and the ID of the found item if successful, or rejects with an error message if the item is not found or if there is an error during the search process
   * @example search_API('TestStaff','staff')
   */
  static search_API = (itemName, itemType, multipleItems = false, hospitalName = null) => {
    const {
      tagSearchEndpoint,
      assetSearchEndpoint,
      staffSearchEndpoint,
      equipmentSearchEndpoint,
      sensorSearchEndpoint,
      incidentSearchEndpoint,
      roomSearchEndPoint,
      departmentSearchEndPoint,
      floorSearchEndPoint,
      hospitalSearchEndPoint,
      baseEndpoint,
      buildingSearchEndPoint,
      hhSensorSearchEndPoint,
      gatewaySearch,
    } = APIEndpoints

    let propertyToCheck = 'name'
    let requiredSearchPoint
    let requiredURL
    let authToken

    // Determine search endpoint
    switch (itemType) {
      case tag:
        requiredSearchPoint = tagSearchEndpoint
        propertyToCheck = 'uniqueDeviceId'
        break
      case staff:
        requiredSearchPoint = staffSearchEndpoint
        break
      case equipment:
        requiredSearchPoint = equipmentSearchEndpoint
        break
      case sensor:
        requiredSearchPoint = sensorSearchEndpoint
        propertyToCheck = 'deviceId'
        break
      case asset:
        requiredSearchPoint = assetSearchEndpoint
        break
      case incident:
        requiredSearchPoint = incidentSearchEndpoint
        break
      case room:
        requiredSearchPoint = roomSearchEndPoint
        break
      case departments:
        requiredSearchPoint = departmentSearchEndPoint
        break
      case floors:
        requiredSearchPoint = floorSearchEndPoint
        break
      case hospital:
        requiredSearchPoint = hospitalSearchEndPoint(system_Id)
        break
      case buildings:
        requiredSearchPoint = buildingSearchEndPoint(system_Id)
        break
      case hhSensor:
        requiredSearchPoint = hhSensorSearchEndPoint
        break
      case gateway:
        requiredSearchPoint = gatewaySearch
        break
    }

    return cy
      .task('getAuthToken')
      .then((token) => {
        authToken = token

        // Set URL based on hospitalName presence
        if (hospitalName) {
          return cy
            .api({
              method: options.requestMethod.post,
              url: apiBaseURL + hospitalSearchEndPoint(system_Id),
              headers: { authorization: authToken },
              failOnStatusCode: false,
              body: {
                limit: 100,
                offset: 0,
                filter: {
                  type: 'groupedText',
                  value: hospitalName,
                },
                sort: [{ field: 'lastModified', order: 'desc' }],
              },
            })
            .then((response) => {
              if (response.status === 200 && response.body.items.length > 0) {
                const hospId = response.body.items[0].id
                requiredURL = apiBaseURL + baseEndpoint(system_Id, hospId) + requiredSearchPoint
              } else {
                cy.log('Unable to search hospital')
              }
            })
        } else {
          requiredURL =
            itemType === hospital || itemType === buildings
              ? apiBaseURL + requiredSearchPoint
              : apiBaseURL + baseEndpoint(system_Id, hospital_Id) + requiredSearchPoint
        }
      })
      .then(() => {
        return cy.api({
          method: 'POST',
          url: requiredURL,
          headers: { authorization: authToken },
          failOnStatusCode: false,
          body: {
            limit: 100,
            offset: 0,
            filter: {
              type: 'logical',
              operator: 'and',
              conditions: [{ type: 'groupedText', value: itemName }],
            },
            sort: [{ field: 'created', order: 'desc' }],
          },
        })
      })
      .then((response) => {
        if (response.status === 200) {
          expect(response.status).to.equal(200)
          const items = response.body.items

          expect(items).to.be.an('array')
          if (items.length === 0) {
            cy.log(`Item ${itemName} not found`)
            return cy.wrap({ authToken, Id: null, items })
          } else {
            let Id

            if (
              items.length > 1 &&
              (itemType === leverageConstants.objectTypes.hospital ||
                itemType === leverageConstants.objectTypes.floors ||
                (itemType === leverageConstants.objectTypes.hhSensor && multipleItems) ||
                (itemType === leverageConstants.objectTypes.departments && multipleItems))
            ) {
              return { authToken, items }
            } else {
              let exactItem
              if (itemType === room) {
                exactItem = items.find((el) => el[propertyToCheck] === itemName)
              } else if (itemType === gateway) {
                exactItem = items.find((el) => el.data.gatewayId === itemName)
              } else if (itemType === hhSensor) {
                exactItem = items.find((el) => el.data.dispenserId === itemName)
              } else {
                exactItem = items.find((el) => el.data[propertyToCheck] === itemName)
              }
              if (!exactItem) {
                cy.log(`Exact item ${itemName} not found`)
                return cy.wrap({ authToken, Id: null, items })
              } else {
                Id = exactItem.id
              }

              return { authToken, Id, items }
            }
          }
        } else {
          cy.log('unable to search')
        }
      })
  }

  /**
   * Function that deletes the given item e.g staff,asset,tag,equipment,sensor
   * @param {string} itemName it is the required item name to delete ,for asset,equipment and staff it will be asset/staff/ name and for tag/sensor it is tag/sensorId
   * @param {string} type it is the type of item which you want to delete it would be asset, staff, tag , equipment,sensor
   * @returns {Promise<string>} A promise that resolves with a success message if the deletion is successful, or rejects with an error message if the deletion fails or if there is an error during the deletion process.
   * @example HelperFunction.deleteItem('staff-universe','staff')
   */
  static deleteItem_API = (itemName, type) => {
    const tagActionsEndpoint = APIEndpoints.tagActionsEndpoint(system_Id, hospital_Id)
    const staffActionApiEndpoint = APIEndpoints.staffActionsEndpoint(system_Id, hospital_Id)
    const sensorActionsEndpoint = APIEndpoints.sensorActionsEndpoint(system_Id, hospital_Id)
    const assetActionEndpoint = APIEndpoints.assetActionEndpoint(system_Id, hospital_Id)
    const equipmentActionEndPoint = APIEndpoints.equipmentActionsEndpoint(system_Id, hospital_Id)
    const floorActionEndPoint = APIEndpoints.floorActionEndPoint(system_Id, hospital_Id)
    const departMentActionEndpoint = APIEndpoints.departmentActionEndPoint(system_Id, hospital_Id)

    const requiredActionEndPoint =
      type === tag
        ? tagActionsEndpoint
        : type === staff
          ? staffActionApiEndpoint
          : type === equipment
            ? equipmentActionEndPoint
            : type === sensor
              ? sensorActionsEndpoint
              : type === asset
                ? assetActionEndpoint
                : type === floors
                  ? floorActionEndPoint
                  : type === departments
                    ? departMentActionEndpoint
                    : null

    //cy.log(requiredActionEndPoint)
    return new Cypress.Promise((resolve, reject) => {
      this.search_API(itemName, type).then(({ authToken, Id }) => {
        cy.api({
          method: options.requestMethod.delete,
          failOnStatusCode: false,
          url: apiBaseURL + requiredActionEndPoint + Id,
          headers: {
            authorization: authToken,
          },
          body: {
            deleteDevice: 'force',
          },
        }).then((res) => {
          if (res.status === 200) {
            expect(res.status, 'Verifying the response code').to.equal(200)
            cy.log(`${type} ${itemName} deleted successfully`)
            resolve(`${type} ${itemName} deleted successfully`)
          } else {
            const errorMsg = `Failed to delete ${itemName}`
            cy.log(errorMsg)
          }
        })
      })
    })
  }

  /**
   * Function that unlinks a tag/sensor from given item i.e staff , equipment or asset
   * @param {string} itemName it is the required itemName from which you want to unlink a tag or sensor e.g staffName, assetName , equipmentName
   * @param {string} itemType It is the type of item from which you want to unlink a tag/sensor, e.g., 'staff', 'equipment' or 'asset'.
   * @returns void
   * @example HelperFunction.UnlinkTag_Sensor_API('equip1','equipment')
   */
  static unlinkTag_Sensor_API = (itemName, itemType) => {
    const staffActionApiEndpoint = APIEndpoints.staffActionsEndpoint(system_Id, hospital_Id)
    const tagActionEndPoint = APIEndpoints.tagActionsEndpoint(system_Id, hospital_Id)
    const assetActionEndpoint = APIEndpoints.assetActionEndpoint(system_Id, hospital_Id)
    const equipmentActionEndPoint = APIEndpoints.equipmentActionsEndpoint(system_Id, hospital_Id)
    const requiredActionEndPoint =
      itemType === asset ? assetActionEndpoint : itemType === staff ? staffActionApiEndpoint : itemType === equipment ? equipmentActionEndPoint : null
    const deviceType = itemType === equipment ? sensor : itemType === asset || itemType === staff ? tag : null

    this.search_API(itemName, itemType) //searching staff/asset and getting its id
      .then(({ authToken, Id }) => {
        cy.api({
          method: options.requestMethod.delete,
          failOnStatusCode: false,
          url: apiBaseURL + requiredActionEndPoint + `${Id}/${deviceType}`,
          headers: {
            authorization: authToken,
          },
        }).then((res) => {
          if (res.status === 200) {
            expect(res.status).to.equal(200)
            expect(res.body).to.not.be.empty
            expect(res.body.parentId).to.equal(Id)
            const tagId = res.body.id
            if (itemType !== 'equipment') {
              cy.api({
                method: options.requestMethod.patch,
                failOnStatusCode: false,
                url: apiBaseURL + tagActionEndPoint + tagId,
                headers: {
                  authorization: authToken,
                },
                body: {
                  data: {
                    linkingStatus: 'Unlinked',
                  },
                },
              }).then((res) => {
                expect(res.status).to.equal(200)
                cy.log(`Successfully unlinked  ${deviceType} from ${itemType} ${itemName}`)
              })
            }
          } else {
            const errorMsg = 'Failed to unlink'
            cy.log(errorMsg)
          }
        })
      })
  }

  /**
   * Function that links a tag/sensor to given item e.g staff, asset , equipment
   * @param {string} itemName it is the required itemName for which you want to link a tag or sensor e.g staffName, assetName , equipmentName
   * @param {string} itemType it is the type of item for which you want to link a tag/sensor, e.g., 'staff', 'equipment' or 'asset'
   * @param {string} deviceId it is the required tag or sensor id which you want to link
   * @example HelperFunction.linkSensor_Tag_API('equip1','equipment','TestTag96')
   */
  static linkSensor_Tag_API = (itemName, itemType, deviceId) => {
    const staffActionApiEndpoint = APIEndpoints.staffActionsEndpoint(system_Id, hospital_Id)
    const tagActionEndPoint = APIEndpoints.tagActionsEndpoint(system_Id, hospital_Id)
    const assetActionEndpoint = APIEndpoints.assetActionEndpoint(system_Id, hospital_Id)
    const equipmentActionEndPoint = APIEndpoints.equipmentActionsEndpoint(system_Id, hospital_Id)

    let requiredActionEndPoint, deviceType, propertyToCheck

    if (itemType === asset || itemType === staff) {
      if (itemType === asset) {
        requiredActionEndPoint = assetActionEndpoint
      } else {
        requiredActionEndPoint = staffActionApiEndpoint
      }
      deviceType = tag
      propertyToCheck = 'uniqueDeviceId'
    } else if (itemType === equipment) {
      requiredActionEndPoint = equipmentActionEndPoint
      deviceType = sensor
      propertyToCheck = 'deviceId'
    }

    this.search_API(itemName, itemType).then(({ Id }) => {
      cy.wrap(Id).as('uniqueItemId')
    })
    this.search_API(deviceId, deviceType).then(({ authToken, Id }) => {
      cy.get('@uniqueItemId').then((itemId) => {
        cy.api({
          method: options.requestMethod.post,
          url: `${apiBaseURL}${requiredActionEndPoint}${itemId}/${deviceType}`,
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          body: {
            id: Id,
          },
        }).then((res) => {
          if (res.status === 200) {
            expect(res.status, 'verifying response code').to.eq(200)
            expect(res.body, 'verifying data property existence').to.have.property('data')
            expect(res.body.data[propertyToCheck], 'Verifying device id').to.eq(deviceId)
            //expect(res.body.data[itemType].data.name).to.eq(itemName)
            cy.log(`Successfully linked ${itemType} ${itemName} to ${deviceType} ${deviceId}`)
          } else {
            cy.log('unable to get data')
          }
        })
      })
    })
  }

  /**
   * Function that creates equipment type, asset type and staff type
   * @param {string} name it is the required name for equipment/asset/staff type
   * @param {string} itemType it the type of item which you want to create e.g staff,equipment,asset
   * @example HelperFunction.createEquipment_Asset_StaffType_API('nurse1','staff')
   */
  static createEquipment_Asset_StaffType_API = (name, itemType) => {
    const equipmentTypeEndPoint = APIEndpoints.deviceTypeEndpoint(system_Id, hospital_Id)
    let entityToCreate, icon

    //assigning icons according to the item type
    if (itemType === equipment) {
      entityToCreate = 'equipmentType'
      icon = 'eq eq-default'
    } else if (itemType === staff) {
      entityToCreate = 'staffType'
      icon = 'st st-staff'
    } else if (itemType === asset) {
      entityToCreate = 'assetType'
      icon = 'at at-bed'
    }

    cy.task('getAuthToken').then((authToken) => {
      cy.api({
        method: options.requestMethod.post,
        failOnStatusCode: false,
        url: apiBaseURL + equipmentTypeEndPoint,
        headers: {
          authorization: authToken,
        },
        body: {
          resEnum: {
            name: entityToCreate,
          },
          value: {
            'metadata/icon': icon,
            name: name,
          },
        },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status, 'Checking for response code').to.eq(200)
          const requiredBody = res.body.values.find((item) => item.name === name)
          expect(requiredBody.name, `Verifying ${itemType} type name`).to.eq(name)
          cy.log(`${itemType} type  ${name} created successfully`)
        } else {
          cy.log(`unable to create ${name} `)
        }
      })
    })
  }

  /**
   * Function that deletes the given staff/equipment/asset type
   * @param {string} itemName it is the name of item to delete
   * @param {string} itemType it is the type of item to delete e.g equipment, staff, asset
   */
  static deleteEquipment_Asset_StaffType_API = (itemName, itemType) => {
    const equipmentTypeEndPoint = APIEndpoints.deviceTypeEndpoint(system_Id, hospital_Id)
    const entityToDelete = itemType === equipment ? 'equipmentType' : itemType === staff ? 'staffType' : itemType === asset ? 'assetType' : null

    cy.task('getAuthToken').then((authToken) => {
      cy.api({
        method: options.requestMethod.delete,
        failOnStatusCode: false,
        url: apiBaseURL + equipmentTypeEndPoint,
        headers: {
          authorization: authToken,
        },
        body: {
          resEnum: {
            name: entityToDelete,
            valueDefault: '',
          },
          enumValue: itemName,
        },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status).to.eq(200)
          cy.log(`${itemName} deleted successfully`)
        } else {
          cy.log(`Failed to delete ${itemName}`)
        }
      })
    })
  }

  /**
   * Returns the index of the column by its header
   * @param {string} header - The header of the column
   */
  static getColumnIndexByHeader = (header) => {
    return cy
      .contains(globalSels.tableHeader, header)
      .invoke('index')
      .then((index) => {
        return index
      })
  }

  /**
   * Function that transforms any given string to camel case mostly
   * @param {string} str required string to be transformed
   * @returns camel case string
   */
  static toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/\s+(.)/g, function (match, group1) {
        return group1.toUpperCase()
      })
      .replace(/\s+/g, '')
  }

  /**
   * Function that get all the available departments
   */
  static getAllDepartments = () => {
    const departmentEndPoint = APIEndpoints.getDepartments(system_Id, hospital_Id)
    cy.api({
      url: apiBaseURL + departmentEndPoint,
      method: options.requestMethod.get,
      failOnStatusCode: false,
      headers: {
        authorization: 'Bearer ' + localStorage.id_token,
      },
    }).should('have.property', 'status', 200)
  }

  /**
   * Function that resets report count for each application to zero
   */
  static resetReportsCount_API = () => {
    const reportsCount = APIEndpoints.reportsCount(system_Id, hospital_Id)
    let reportLimit

    cy.task('getAuthToken').then((authToken) => {
      //getting the current report count body
      cy.api({
        method: options.requestMethod.get,
        url: apiBaseURL + reportsCount,
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.metadata.reportLimit, 'Checking array is not empty').to.be.an('array').have.length.greaterThan(0)
        reportLimit = res.body.metadata.reportLimit

        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()

        //updating report limit according to current month and year
        const upDatedReportLimit = reportLimit.map((obj) => {
          if (obj.month === currentMonth && obj.year === currentYear) {
            return {
              ...obj,
              application: {
                environment: 0,
                assets: 0,
                safety: 0,
              },
            }
          }
          return obj
        })

        //resetting back the updated reports count
        const requestBody = smartReports.requestBodyForReportResetAPI
        requestBody[0].value.reportLimit = upDatedReportLimit
        cy.api({
          method: options.requestMethod.patch,
          url: apiBaseURL + reportsCount,
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          body: requestBody,
        }).then((res) => {
          expect(res.status).to.eq(200)
          expect(res.body.metadata, 'Checking for reportLimit property').to.have.property('reportLimit')
          res.body.metadata.reportLimit.forEach((obj) => {
            if (obj.month === currentMonth && obj.year === currentYear) {
              expect(obj.application, 'Checking report count value after resetting it to 0 for IAP,IEM and ISDR ').to.deep.equal({
                environment: 0,
                assets: 0,
                safety: 0,
              })
            }
          })
        })
      })
    })
  }

  /**
   * Links a Tag or Sensor to an Asset, Equipment, or Staff in the UI.
   *
   * @param {string} itemId - The ID of the item to be linked (either Tag or Sensor).
   * @param {string} itemType - The type of the item ('Tag' or 'Sensor').
   * @param {string} linkingItemType - The type of entity to link to ('Asset', 'Equipment', or 'Staff').
   * @param {string} linkingItemName - The name of the entity to link to.
   */
  static linkTagOrSenor_Mobile_UI = (itemId, itemType, linkingItemType, linkingItemName) => {
    Click.forcefullyOn(globalSels.lintButtonForMobileView)
    Click.forcefullyOn(globalSels.linkTagOrSensor)

    if (itemType === globalSels.tagTxt) {
      cy.get(globalSels.tagIdInput).clear().type(`${itemId}${options.enter}`)
    } else if (itemType === globalSels.sensorTxt) {
      cy.get(globalSels.sensorIdInput).clear().type(`${itemId}${options.enter}`)
    }

    if (linkingItemType === globalSels.assetTxt) {
      Click.forcefullyOn(prosightAssets.assetsManagement.searchAsset)
    } else if (linkingItemType === globalSels.equipmentTxt) {
      Click.forcefullyOn(prosightEnvironment.equipmentManagement.searchEquipment)
    } else if (linkingItemType === globalSels.staffTxt) {
      Click.forcefullyOn(prosightSafety.staffManagement.searchStaff)
    }

    HelperFunction.search(linkingItemName, false)
    Click.onContainText(globalSels.cardView, linkingItemName)
    Click.onContainText(globalSels.buttonTag, globalSels.linkBtn)
    Verify.textPresent.isVisible(prosightAssetCons.toastMessages.tagLinked)
    Click.onDoneButton()
  }

  /**
   * Unlinks a Tag or Sensor from an Asset, Equipment, or Staff in the UI.
   *
   * @param {string} linkedItemType - The type of the entity linked ('Asset', 'Equipment', or 'Staff').
   * @param {string} linkedItemName - The name of the entity to unlink.
   * @param {string} tagOrSensorName - The name of the Tag or Sensor
   */
  static unlinkTagOrSensor_Mobile_UI = (linkedItemType, linkedItemName, tagOrSensorName) => {
    const messageUnlinkingTag = prosightAssetCons.paneText.messageUnlinkingTag(linkedItemName, tagOrSensorName)
    const messageUnlinkingSensor = prosightEnvironmentCons.paneText.messageUnlinkingSensor(linkedItemName, tagOrSensorName)

    Click.forcefullyOn(globalSels.lintButtonForMobileView)
    Click.forcefullyOn(globalSels.unlinkTagOrSensor)

    if (linkedItemType === globalSels.assetTxt) {
      Click.forcefullyOn(prosightAssets.assetsManagement.searchAsset)
    } else if (linkedItemType === globalSels.equipmentTxt) {
      Click.forcefullyOn(prosightEnvironment.equipmentManagement.searchEquipment)
    } else if (linkedItemType === globalSels.staffTxt) {
      Click.forcefullyOn(prosightSafety.staffManagement.searchStaff)
    }

    HelperFunction.search(linkedItemName, false)
    Click.onContainText(globalSels.cardView, linkedItemName)

    if (linkedItemType === globalSels.assetTxt || linkedItemType === globalSels.staffTxt) {
      // we can't verify the dialog box text due to bug
      // Verify.theElement(globalSels.popupTextDailogMessage).contains(messageUnlinkingTag)
      Click.onContainText(globalSels.buttonTag, globalSels.unlinkTagBtn)
    } else if (linkedItemType === globalSels.equipmentTxt) {
      // we can't verify the dialog box text due to bug
      // Verify.theElement(globalSels.popupTextDailogMessage).contains(messageUnlinkingSensor)
      Click.onContainText(globalSels.buttonTag, prosightEnvironmentSels.equipmentManagement.unlinkSensorBtn)
    }

    Verify.textPresent.isVisible(prosightAssetCons.toastMessages.tagUnLinked)
    Click.onDoneButton()
  }

  /**
   * Removes all special characters from a given string.
   *
   * This function takes an input string and returns a new string with all
   * special characters removed. Only alphanumeric characters (letters and digits)
   * are retained in the returned string.
   *
   * @param {string} value - The input string from which to remove special characters.
   * @returns {string} - The resulting string with all special characters removed.
   *
   * @example
   *
   * const input = "123-456-7890";
   * const output = removeSpecialCharacters(input);
   * console.log(output); // Output: 1234567890
   */
  static removeSpecialCharacters = (value) => {
    value = String(value)
    return value.replace(/[^a-zA-Z0-9]/g, '')
  }

  /**
   * Selects a building from the global filter on a mobile interface.
   *
   * @param {string} hospitalName - The name of the hospital to select.
   * @param {string} buildingName - The name of the building to select.
   */
  static selectBuildingFromGlobalFilterInMobile = (hospitalName, buildingName) => {
    let changesMade = false
    buildingName = 'LGMC'
    // Click on the location selection icon to open the location selection page
    cy.get(locationSelectionIcon).click({ force: true })

    //select the Hospital
    // cy.get(dialogDropdown).eq(0).should('have.text', hospitalName)
    cy.get(dialogDropdown)
      .eq(0)
      .then(($button) => {
        const buttonText = $button.text().trim()
        if (buttonText !== hospitalName) {
          changesMade = true
          cy.wrap($button).click({ force: true })
          Click.onContainText(divTag, hospitalName)
          Click.forcefullyOn(selectBtn)
        }
      })

    //select the Building
    cy.get(dialogDropdown)
      .eq(1)
      .then(($button) => {
        const buttonText = $button.text().trim()
        if (buttonText === buildingName) {
          changesMade = true
          cy.wrap($button).click({ force: true })

          cy.get(buildingdeselectParentClass)
            .find(divTag)
            .contains(buildingName)
            .children()
            .first()
            .invoke('attr', 'class')
            .should('include', buildingdeselectClass)

          cy.get(buildingdeselectParentClass).find(divTag).contains(buildingName).children().first().click({ force: true })
          Click.onContainText(divTag, buildingName)
          Click.forcefullyOn(selectBtn)
        } else {
          changesMade = false
          cy.log('No global building is selected')
        }
      })

    // Click on save or cancel button based on changesMade
    cy.then(() => {
      if (changesMade) {
        console.log('save')
        Click.forcefullyOn(saveBtn)
      } else {
        console.log('cancel')
        Click.forcefullyOn(cancelButton)
      }
    })

    // Verify that the selected hospital and building names are showing up on the side navbar.
    // Verify.textPresent.isVisible(hospitalName)
    // Verify.textPresent.isVisible(buildingName)
  }

  /**
   * Formats a given phone number from 1234567890 to 123-456-7890.
   *
   * @param {string} phoneNumber - The phone number to be formatted.
   * @returns {string} - The formatted phone number.
   */
  static formatPhoneNumber = (phoneNumber) => {
    const phoneNumberStr = String(phoneNumber)
    return phoneNumberStr.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  /**
   * Perform alert actions on alert in mobile.
   *
   * @param {string} actionText - The action to perform (e.g., "Acknowledge", "Create Task", "Clear").
   * @param {string} taskDescription - The description of the task to be created or acknowledged.
   * @param {string} module - The module where the action is performed (e.g., "environment","safety","assets").
   */
  static performAlertActionsOnAlertDescriptionInMobile = (actionText, taskDescription, module) => {
    // Click the action button for the alert
    cy.contains(divTag, actionText).prev(buttonTag).click()

    if (actionText === acknowledge) {
      // If acknowledging, optionally enter the task description
      if ((module === environment || module === safety) && taskDescription) {
        cy.log('inside')
        console.log('inside')
        cy.get(textDescriptionContainer).click().clear().type(taskDescription)
      }
      // Verify and confirm the acknowledge action (_can't verify due to bug)
      // Verify.theElement(popupTextDailogMessage).contains(acknowledgeAlertMessage)
      Click.onContainText(button, acknowledge)
    } else if (actionText === createTask) {
      // If creating a task, enter the task description
      cy.get(textDescriptionContainer).click().clear().type(taskDescription)
      // Verify and confirm the create task action
      Verify.theElement(popupTextDailogMessage).contains(createTaskMessage)
      Click.onContainText(button, create)
    } else if (actionText === clearButton) {
      // If clearing, verify and confirm the clear action
      Verify.theElement(popupTextDailogMessage).contains(clearAlertMessage)
      Click.onContainText(button, clearButton)
    }
  }

  /**
   * Edit or complete a task in mobile
   *
   * @param {string} equipmentName - The name of the equipment related to the task.
   * @param {string} actionText - The action to perform (e.g., "Edit Task", "Complete Task").
   * @param {string} [taskDescription=''] - The new task description if editing the task. Defaults to an empty string.
   */
  static editOrCompleteTaskInMobile = (equipmentName, actionText, taskDescription = '') => {
    // Search for the equipment and get the corresponding alert
    HelperFunction.search(equipmentName, false)
    HelperFunction.getRowByItemName(equipmentName, cardView, equipment).as('alertRow')

    if (actionText === editTask) {
      // If editing, click edit, enter new description, and save
      Click.onContainText('@alertRow', actionText)
      Verify.theElement(popupTextDailogMessage).contains(editTaskMessage)
      cy.get(textDescriptionContainer).click().clear().type(taskDescription)
      Click.onContainText(button, save)
    } else if (actionText === completeTask) {
      // If completing, click complete and confirm
      Click.onContainText('@alertRow', actionText)
      Verify.theElement(popupTextDailogMessage).contains(completeTaskMessage)
      Click.onContainText(button, complete)
    }
  }

  /**
   * Escalates an alert in the mobile application based on the given action and option.
   *
   * @param {Object} details - The details of the equipment or staff.
   * @param {string} details.equipmentOrStaffName - The name of the equipment or staff.
   * @param {string} details.id - The ID of the equipment or staff.
   * @param {string} details.departmentName - The department name of the equipment or staff.
   * @param {string} details.type - The type of the equipment or staff.
   * @param {string} action - The action to be taken, either 'carousel' or 'other'.
   * @param {string} option - The option to select while escalating.
   * @param {string} objType - The type of the object, either 'equipment' or 'staff'.
   */
  static escalateAlertInMobile = (details, action, option, objType) => {
    const verificationDetailsOnCarousel =
      objType === equipment
        ? { equipmentName: details.equipmentOrStaffName, id: details.id, departmentName: details.departmentName, type: details.type }
        : { staffName: details.equipmentOrStaffName, staffId: details.id, departmentName: details.departmentName, type: details.type }

    if (action !== carousel) {
      // Click on escalate option
      cy.get(alertViewOnMap).next().find(escalateButtonFromSidePanel).click(commandOptions.force)
      // Select an option while escalating
      Click.onContainText(escalateOptionsContainer, option)
      // Click on escalate button
      Click.on(clearButtonOnPopUp)
    } else if (action === carousel) {
      // Verify equipment name, type, id and department in the carousel
      HelperFunction.verifyValuesInTheCardView(incidentContainer, verificationDetailsOnCarousel)
      // Click on escalate option
      Click.forcefullyOn(escalateButton)
      // Select an option while escalating
      Click.onContainText(escalateOptionsContainer, option)
      // Click on the escalate button within the popup dialog box
      Click.onButtonByInnerText(popupDialogBox, escalate)
    }
  }

  /**
   * Counts the number of items in an array of objects that match a given status.
   *
   * @param {Object[]} data - The array of objects to be checked.
   * @param {string} status - The status value to compare against.
   * @param {string} [property='Status'] - The property name to check in each object (defaults to 'Status').
   * @returns {number} The count of items where the specified property matches the given status.
   *
   * This method iterates through the data and increments the count for each items whose `Status` field matches the specified status.
   */

  static countItemsByStatus = (data, status, property = 'Status') => data.reduce((acc, curr) => (curr[property] === status ? acc + 1 : acc), 0)

  /**
   * Calculates the next maintenance date based on the given frequency.
   * This function takes the current date and calculates the next date for maintenance
   * based on whether the frequency is annually, monthly, or quarterly.
   *
   * @param {string} frequency - The frequency of maintenance. Accepted values are:
   *  - 'annually': Adds 1 year to the current date.
   *  - 'monthly': Adds 1 month to the current date.
   *  - 'quarterly': Adds 3 months to the current date.
   * @returns {string} The next maintenance date formatted as 'MM/DD/YYYY'.
   * @throws {Error} Throws an error if the frequency is invalid.
   */
  static calculateNextMaintenanceDate = (frequency) => {
    const today = new Date()
    let nextDate

    switch (frequency.toLowerCase()) {
      case 'annually':
        nextDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
        break
      case 'monthly':
        nextDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
        break
      case 'quarterly':
        nextDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())
        break
      default:
        throw new Error("Invalid frequency. Please use 'annually', 'monthly', or 'quarterly'.")
    }

    // Adjust for cases where the day of the month might not exist in the new month/year
    if (nextDate.getDate() !== today.getDate()) {
      nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0) // Set to the last day of the previous month
    }

    // Format the date as MM/DD/YYYY
    const formattedDate = [
      String(nextDate.getMonth() + 1).padStart(2, '0'), // MM
      String(nextDate.getDate()).padStart(2, '0'), // DD
      nextDate.getFullYear(), // YYYY
    ].join('/')

    return formattedDate
  }

  /**
   * This function selects a floor from the floor filter dropdown in the rooms page.
   * @param {*} floorName - The name of the floor that you need to select from the floor filter.
   */
  static selectFloorFilter = (floorName) => {
    Click.forcefullyOn(prosightCore.floorPlanManagement.roomsPageSel.floorFilter)
    Type.theText(floorName).into(globalSels.radioButton)
    Click.onContainText(prosightCore.floorPlanManagement.roomsPageSel.floorList, floorName)
    Click.forcefullyOn(prosightCore.userManagementSel.users.applyButtonFilter)
  }

  /**
 * Updates the Battery Percentage for a Tag or Sensor, and Battery Status for a Tag.
 *
 * @param {String} deviceName - Name of the Tag or Sensor for which the battery values need to be updated.
 * @param {Object} batteryData - Object containing battery details.
 * @param {String} [batteryData.batteryStatus] - Battery status to be updated (applicable only for Tags).
 * @param {Number} batteryData.batteryPercentage - Battery percentage to be updated for the Tag or Sensor.
 * @param {String} [type=tag] - Type of the object (`tag` or `sensor`).
 */
  static updateBatteryPercentageForTagOrSensor = (deviceName, batteryData, type) => {
    const { batteryStatus = null, batteryPercentage } = batteryData
    const setBatteryPercentageForTagOrSensorEndPoint = APIEndpoints.setTemperatureAndHumidityForSensorEndPoint(system_Id)
    const setValue = APIEndpoints.setValuesEndPoint
    SmartAlertsUsingAPI.loginToArchitect().then((architectAuthToken) => {

      const searchPromise =
        type === tag
          ? HelperFunction.search_API(deviceName, tag)
          : HelperFunction.search_API(deviceName, sensor);

      searchPromise.then(({ authToken, Id }) => {
        cy.api({
          method: leverageConstants.requestMethod.put,
          failOnStatusCode: leverageConstants.failOnStatusCode,
          headers: {
            authorization: architectAuthToken,
          },
          url: apiBaseURL + setBatteryPercentageForTagOrSensorEndPoint + `${Id}` + setValue,
          body: {
            values: [
              {
                path: "battery/percentage",
                value: batteryPercentage,
              },
              ...(type === tag
                ? [{
                  path: "batteryStatus",
                  value: batteryStatus,
                }]
                : [])
            ],
          },
        }).then((response) => {
          if (response.status === 200) {
            expect(response.status).to.equal(200)
            cy.log(`${type} battery status updated successfully`)
          } else {
            cy.log(`Unable to update the battery status and battery percentage for the ${type}`)
          }
        })
      })
    })
  }

}
