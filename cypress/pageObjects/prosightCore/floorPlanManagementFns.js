/// <reference types="cypress" />
import options from '../../utils/constants/commandOptions.js'
import globalSels from '../../utils/selectors/globalSels.js'
import prosightCore from '../../utils/selectors/prosightCore.js'
import Click from '../../utils/Interactions/click.js'
import constants from '../../utils/constants/prosightCore/floorPlanManagementConst.js'
import Verify from '../../utils/assertions/verify.js'
import HelperFunction from '../../utils/helpers/crossModuleFunctions.js'
import globalConst from '../../utils/constants/globalConst.js'
import APIEndpoints from '../../../APIEndpoints.js'
import prosightAssetsSels from '../../utils/selectors/prosightAssets'
import LoginPage from '../signIn/siginPage.js'
import hospitalData from '../../fixtures/prosightCore/hospitalDetails.json'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants.js'
import Type from '../../utils/Interactions/type.js'

const { floors, departments, room, hospital } = leverageConstants.objectTypes
const hospitalNames = globalConst.hospitalAndBuilding.hospitalName
const { rooms, departmentBoundary } = constants.page
const {
  buildingInputField,
  floorNameInputField,
  floorNumberInputField,
  hospitalNameInputField,
  addFloorBtn,
  buildingNameDropDownBtn,
  selectedFloorPlanFileName,
} = prosightCore.floorPlanManagement.floors
const { addRoomTypesBtn, roomTypeNameInput, roomTypeColorOptions } = prosightCore.floorPlanManagement.roomTypePageSel
const { listTag, spanTag, createBtn, labelTag, radioTypeInput } = globalSels
const { baseEndpoint, deviceTypeEndpoint, departmentByBuildingEndpoint, deleteRoomEndpoint } = APIEndpoints
const { utilizationFactor, shrinkageWindow } = prosightAssetsSels.smartRules
const system_ID = Cypress.env('SystemId')
const baseUrl = Cypress.env('API_BaseUrl')
const hospital_ID = Cypress.env('HospitalId')
const project_ID = Cypress.env('ProjectId')
const { departmentBoundarySearch } = APIEndpoints

/**
 * Class floorPlanManagement consists static functions related to floor plan management module
 * @class FloorPlanManagement
 */
export default class FloorPlanManagement {
  /**
   * A function that enters the given details related to hospital floor in add floor page
   * @param {String} buildingName,it is the building name which user will select from drop down in form
   * @param {String} floorName,it is the required floorName which user will enter in the form
   * @param {Number} floorNumber, it is the floor number that user will enter in the form
   */
  static addNewFloorDetails = (buildingName, floorName, floorNumber) => {
    cy.get(addFloorBtn).click(options.force)
    cy.get(hospitalNameInputField).should('be.disabled').and('have.value', hospitalNames)
    cy.get(hospitalNameInputField).should('be.disabled').and('have.value', hospitalNames)
    cy.get(buildingNameDropDownBtn).click(options.force)
    cy.contains(spanTag, buildingName).click(options.force)
    cy.get(floorNameInputField).clear(options.force).type(floorName, options.force)
    cy.get(floorNumberInputField).clear(options.force).type(floorNumber, options.force)
  }

  /**
   * A function that uploads the provided geojson file in add floor page
   * @param {geojson} geojsonFile , it is the required geojson file i.e floor plan which user will upload in add floor page
   */
  static uploadGeoJsonFile = (geojsonFile) => {
    cy.get(prosightCore.floorPlanManagement.floors.uploadFloorPlanBtn).click(options.force)
    cy.get(prosightCore.floorPlanManagement.floors.floorPlanUploadField).selectFile(geojsonFile, options.force)
  }

  /**
   * Function that creates a new floor by entering necessary details
   * @param {String} buildingName,it is the building name which user will select from drop down in form
   * @param {String} floorName ,it is the required floorName which user will enter in the form
   * @param {String} floorNumber ,it is the floor number that user will enter in the form
   * @param {String} geojsonFile ,it is the required geojson file i.e floor plan which user will upload in add floor page
   */
  static createNewFloor = (buildingName, floorName, floorNumber, geojsonFile) => {
    this.addNewFloorDetails(buildingName, floorName, floorNumber)
    this.uploadGeoJsonFile(geojsonFile)
    cy.contains(prosightCore.floorPlanManagement.saveBtn, prosightCore.floorPlanManagement.save).should(options.enabled).click()
    cy.get(selectedFloorPlanFileName).eq(0).contains(constants.uiTexts.geoJSONFile)
    Click.forcefullyOn(globalSels.createBtn)
  }

  /**
   * Function that enters boundary name and selects the given department from drop down
   * @param {String} boundaryName it is the boundary name that user want to give
   * @param {String} department it is the department name that user want to select
   */
  static enterBoundaryNameAndDepartment = (boundaryName, departmentName) => {
    cy.get(prosightCore.floorPlanManagement.departmentBoundariesSel.boundaryNameInput).clear().type(`${boundaryName}${options.enter}`)
    cy.contains(prosightCore.floorPlanManagement.departmentBoundariesSel.departmentDropDownBtn).click()
    Type.theText(departmentName).into(prosightCore.floorPlanManagement.searchBarInFilter)
    cy.contains(globalSels.filters.options, departmentName).click(options.force)
  }

  /**
   * Function that draws and edit a polygon on given canvas element shape i.e department boundaries or floor boundaries
   * @param {Boolean} edit it is the boolean value i.e if user has to edit the polygon then true otherwise false
   */
  static draw_EditPolygon = (edit = false, page) => {
    cy.wait(45000)
    Click.forcefullyOn(prosightCore.floorPlanManagement.departmentBoundariesSel.cancelbtn)
    Click.forcefullyOn(prosightCore.floorPlanManagement.centerOnItemBtn)
    Click.forcefullyOn(prosightCore.floorPlanManagement.zoomOutBtn)
    Click.forcefullyOn(prosightCore.floorPlanManagement.zoomOutBtn)
    Click.forcefullyOn(prosightCore.floorPlanManagement.zoomOutBtn)
    if (page === departmentBoundary) {
      Click.on(prosightCore.floorPlanManagement.departmentBoundariesSel.addDepartmentBoundaryBtn)
    } else if (page === rooms) {
      Click.on(prosightCore.floorPlanManagement.roomsPageSel.createRoom)
    }
    cy.get(prosightCore.floorPlanManagement.departmentBoundariesSel.canvasElem).then(($canvas) => {
      const canvasWidth = $canvas.width()
      const canvasHeight = $canvas.height()

      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2
      const startingPointX = centerX + 50
      const startingPointY = centerY + 30

      if (!edit) {
        cy.wrap($canvas)
          .scrollIntoView()
          .click(startingPointX, startingPointY)
          .click(startingPointX + 30, startingPointY)
          .click(startingPointX + 30, startingPointY - 30)
          .dblclick(startingPointX, startingPointY - 30)
          .wait(2000)
      } else {
        // Ending point for dragging (e.g., move 20 units to the right and 20 units up)
        const endX = startingPointX + 20
        const endY = startingPointY

        // Trigger mousedown at the starting point
        cy.wrap($canvas)
          .trigger(options.mouseDown, startingPointX, startingPointY)
          .wait(10000)
          .trigger(options.mousemove, endX, endY)
          .wait(10000)
          .trigger(options.mouseup)
      }
    })
  }

  // /**
  //  * Function that enters boundary name and selects the given department from drop down
  //  * @param {String} boundaryName it is the boundary name that user want to give
  //  * @param {String} department it is the department name that user want to select
  //  */
  // static enterBoundaryNameAndDepartment = (boundaryName, department) => {
  //   cy.get(prosightCore.floorPlanManagement.departmentBoundariesSel.boundaryNameInput).clear().type(`${boundaryName}${options.enter}`)
  //   cy.contains(prosightCore.floorPlanManagement.departmentBoundariesSel.departmentDropDownBtn).click()
  //   cy.contains(globalSels.filters.options, department).click(options.force)
  // }

  /**
   * Function that enters the provided room type name in room type name input and selects room color
   * @param {Object} roomTypeDetails - Object that contains the room type name and default ordering rule details
   * @param {String} roomTypeDetails.roomTypeName  - Type of the asset for which rules needs to be created
   * @param {String} roomTypeDetails.utilizationState - utilization state value
   * @param {String} roomTypeDetails.assetStatus - asset status value
   * @param {String} roomTypeDetails.shrinkageState - state of the shrinkage
   * @param {String} roomTypeDetails.shrinkageWindowValue - value of the shrinkage window
   * @param {String} roomTypeDetails.utilizationValue - value of utilization factor
   */
  static addNewRoomType = (roomTypeDetails) => {
    const {
      roomTypeName,
      assetStatus,
      utilizationState,
      monitorCompliance,
      shrinkageState = null,
      utilizationValue = null,
      shrinkageWindowValue = null,
    } = roomTypeDetails

    Click.on(addRoomTypesBtn)
    Verify.theElement(createBtn).isDisabled()
    cy.get(roomTypeNameInput).clear(options.force).type(roomTypeName, options.force)
    cy.get(roomTypeColorOptions).first().click(options.force)

    //entering default rule config
    if (assetStatus === 'Missing') {
      cy.contains(labelTag, assetStatus).click(options.force)
      if (utilizationState === 'Utilized') {
        cy.contains(labelTag, utilizationState).click(options.force)
        Type.theText(utilizationValue).into(utilizationFactor)
      } else {
        cy.contains(labelTag, utilizationState)
      }
      if (shrinkageState === 'Lost') {
        cy.contains(labelTag, shrinkageState).click(options.force)
        Click.forcefullyOn(shrinkageWindow)
        cy.contains(shrinkageWindowValue).click(commandOptions.force)
      } else {
        cy.contains(labelTag, shrinkageState)
      }
    } else {
      cy.contains(labelTag, assetStatus).click(options.force)
      if (utilizationState === 'Utilized') {
        cy.contains(labelTag, utilizationState).click(options.force)
        Type.theText(utilizationValue).into(utilizationFactor)
      } else {
        cy.contains(labelTag, utilizationState)
      }
    }

    cy.contains(labelTag, monitorCompliance).click(options.force)
    Verify.theElement(createBtn).isEnabled()
    Click.forcefullyOn(createBtn)
  }

  static deleteRoomType_API = (roomTypeName) => {
    cy.task('getAuthToken').then((authToken) => {
      cy.api({
        url: baseUrl + deviceTypeEndpoint(system_ID, hospital_ID),
        method: 'DELETE',
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
        body: {
          resEnum: {
            name: 'roomType',
            valueDefault: 'at at-default',
          },
          enumValue: roomTypeName,
        },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status, 'Verifying the response code').to.equal(200)
          cy.log(` ${roomTypeName} deleted successfully`)
        } else {
          const errorMsg = `Failed to delete ${roomTypeName}`
          cy.log(errorMsg)
        }
      })
    })
  }

  static createRoomType_API = (roomTypeDetails) => {
    const { roomTypeName, assetStatus, utilizationState, monitorCompliance, shrinkageState, utilizationValue, metaColor } = roomTypeDetails

    cy.task('getAuthToken').then((authToken) => {
      cy.api({
        url: baseUrl + deviceTypeEndpoint(system_ID, hospital_ID),
        method: 'POST',
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
        body: {
          resEnum: {
            name: 'roomType',
          },
          value: {
            'metadata/isCompliant': monitorCompliance === 'No' ? false : true,
            name: roomTypeName,
            'metadata/shrinkage': shrinkageState ?? 'N/A',
            'metadata/color': metaColor ?? '^#CFD2FG',
            'metadata/defaultColor': metaColor ?? '^#CFD2FG',
            'metadata/status': assetStatus.toLowerCase(),
            'metadata/utilized': utilizationState ?? null,
            'metadata/utilizationFactor': utilizationValue ?? null,
          },
        },
      }).then((res) => {
        if (res.status === 200) {
          cy.log(`room type created`)
        } else {
          cy.log('unable to create room type')
        }
      })
    })
  }

  static verifyRadioBtnsAreDisabled = () => {
    cy.get(radioTypeInput).each(($btn) => {
      cy.wrap($btn).parent().next().should('have.attr', 'data-disabled', 'disabled')
    })
  }
  /**
   * Function that creates a new department boundary
   * @param {String} departmentBoundaryName it is the required department boundary name
   * @param {String} department it is required department
   */
  static addNewDepartmentBoundary = (departmentBoundaryName, departmentName) => {
    Click.on(prosightCore.floorPlanManagement.departmentBoundariesSel.dualViewBtn)
    Verify.textPresent.isVisible(prosightCore.floorPlanManagement.departmentBoundariesSel.boundaryNameColumnHeading)
    Verify.theCanvas(prosightCore.floorPlanManagement.departmentBoundariesSel.canvasElem).isVisibleAndProperlyLoaded()
    Click.on(prosightCore.floorPlanManagement.departmentBoundariesSel.addDepartmentBoundaryBtn)
    this.draw_EditPolygon(false, departmentBoundary)
    Click.on(prosightCore.floorPlanManagement.saveBtn)
    Click.on(prosightCore.floorPlanManagement.departmentBoundariesSel.confirmBtn)
    this.enterBoundaryNameAndDepartment(departmentBoundaryName, departmentName)
    Click.on(prosightCore.floorPlanManagement.saveBtn)
  }

  /**
   * Function that deletes the given room type name from from given option
   * @param {String} roomTypeName it is the required room type to delete
   * @param {String} actionType it is the required action type i.e edit menu/table del btn
   */
  static deleteRoomType = (roomTypeName, actionType, deletable = true) => {
    HelperFunction.search(roomTypeName)
    HelperFunction.getRowByItemName(roomTypeName, globalSels.resultRow, constants.uiTexts.admin).as('resultRow')

    if (actionType === 'editMenu') {
      HelperFunction.getElementFromSpecificDiv('@resultRow', globalSels.editBtn).as('editBtn')
      Click.forcefullyOn('@editBtn')
      Click.forcefullyOn(globalSels.deleteBtn)
    } else {
      HelperFunction.getElementFromSpecificDiv('@resultRow', globalSels.deleteBtn).as('delBtn')
      Click.forcefullyOn('@delBtn')
    }

    if (deletable) {
      Verify.theElement(globalSels.confirmationPopup).contains(constants.confirmationMessages.deleteRoomTypeConfirmation) //bug failure
      Click.forcefullyOn(globalSels.dialogueDeleteBtn)
    }
  }

  /**
   * Function that creates a new department.
   * @param {String} departmentName it is the required department name
   *
   */
  static addNewDepartment = (departmentName) => {
    cy.get(prosightCore.floorPlanManagement.departmentsSel.addDepartmentBtn).click(options.force)
    cy.get(prosightCore.floorPlanManagement.departmentsSel.departmentNameInput).clear().type(departmentName)
    cy.get(globalSels.createBtn).should(options.enabled).click(options.force)
  }

  /**
   * Function that creates a new department using API call
   * @param {String} departmentName - it is the required department name
   *  @param {string} buildingName - The name of the building to which the department belongs.
   */
  static createDepartment_API = (departmentName, buildingName) => {
    let deptId, buildingId
    cy.task('getAuthToken').then((authToken) => {
      HelperFunction.search_API(buildingName, 'building').then(({ authToken, Id }) => {
        buildingId = Id
        cy.api({
          url: baseUrl + baseEndpoint(system_ID, hospital_ID) + 'departments',
          method: 'POST',
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          body: {
            data: [
              {
                path: 'name',
                value: departmentName,
              },
            ],
            name: departmentName,
          },
        }).then((res) => {
          if (res.status === 200) {
            deptId = res.body.id
            cy.api({
              url: baseUrl + departmentByBuildingEndpoint(system_ID, hospital_ID, buildingId),
              method: 'POST',
              failOnStatusCode: false,
              headers: {
                authorization: authToken,
              },
              body: {
                id: deptId,
                force: true,
              },
            }).then((res) => {
              if (res.status === 200) {
                cy.log(`department ${res.body.name} created successfully`)
                expect(res.status).to.equal(200)
                expect(res.body.name, 'verifying department name').to.equal(departmentName)
              } else {
                cy.log('unable to create a department')
              }
            })
          } else {
            cy.log('unable to create a department')
          }
        })
      })
    })
  }
  /**
   * Function which enters map label name  and map location input in rooms page
   * @param {String} mapLabel it is the name for map label input field
   * @param {String} location it is the name for location input field
   */
  static enterMapLabelAndLocation = (mapLabel, location) => {
    cy.get(prosightCore.floorPlanManagement.roomsPageSel.mapLabelInput).clear().type(mapLabel)
    cy.get(prosightCore.floorPlanManagement.roomsPageSel.mapLocationInput).clear().type(location)
  }

  /**
   * Function that selects room type and department from dropdown menu
   * @param {String} roomType it is the roomType option that user has to select from drop down
   * @param {String} department it is the department option that user has to select from drop down
   */
  static selectRoomTypeAndDepartment = (roomType, department) => {
    cy.get(globalSels.button).contains(prosightCore.floorPlanManagement.roomsPageSel.selectRoomType).click()
    Type.theText(roomType).into(prosightCore.floorPlanManagement.searchBarInFilter)
    cy.contains(prosightCore.floorPlanManagement.roomsPageSel.popUp, roomType).click(options.force)
    cy.get(globalSels.button).contains(prosightCore.floorPlanManagement.roomsPageSel.selectAssignedDepartMent).click()
    Type.theText(department).into(prosightCore.floorPlanManagement.searchBarInFilter)
    cy.contains(prosightCore.floorPlanManagement.roomsPageSel.popUp, department).click(options.force)
  }

  /**
   * Function that creates a new room boundary and enter boundary details in one flow
   * @param {String} mapLabel it is the input for map label input
   * @param {String} location it is the input of location filed
   * @param {String} roomTypeName it the required option for room type drop down
   * @param {String} departmentName it the required option for department drop down
   */
  static createNewRoomBoundary = (mapLabel, location, roomTypeName, departmentName) => {
    Click.on(prosightCore.floorPlanManagement.departmentBoundariesSel.dualViewBtn)
    Verify.textPresent.isVisible(prosightCore.floorPlanManagement.roomsPageSel.mapNameColumnHeading)
    Verify.theCanvas(prosightCore.floorPlanManagement.departmentBoundariesSel.canvasElem).isVisibleAndProperlyLoaded()
    Click.on(prosightCore.floorPlanManagement.roomsPageSel.createRoom)
    this.draw_EditPolygon(false, rooms)
    Click.on(prosightCore.floorPlanManagement.saveBtn)
    this.enterMapLabelAndLocation(mapLabel, location)
    this.selectRoomTypeAndDepartment(roomTypeName, departmentName)
    Click.on(globalSels.createBtn)
    Verify.theToast.showsToastMessage(constants.toastMessages.messageAfterCreatingRoom)
  }

  /**
   * This function is using to create floors and rooms using API
   * @param {Object} floorDetails - It is an object that helps in creating floor
   * @param {String} floorDetails.floorNumber - It is a number for which floor is created
   * @param {String} floorDetails.floorName - It is a name for which floor is created
   * @param {String} hospitalName - It is a string which consists of name of the hospital where floor needs to be created
   * @param {String} buildingName - It is a string which consists of name of the building where floor needs to be created
   */
  static createFloor_API = (floorDetails, roomDetails, hospitalName, buildingName, departmentName) => {
    const { floorNumber, floorName } = floorDetails
    const { roomName_1, roomName_2, roomType } = roomDetails
    let FloorId, hospitalId, buildingId, roomId, departmentId
    LoginPage.loginToApplication().then(({ authToken }) => {
      HelperFunction.search_API(hospitalName, 'hospital').then(({ authToken, Id }) => {
        hospitalId = Id
        HelperFunction.search_API(buildingName, 'building').then(({ authToken, Id }) => {
          buildingId = Id
          cy.api({
            method: 'POST',
            failOnStatusCode: false,
            url: baseUrl + baseEndpoint(system_ID, hospital_ID) + `buildings/${buildingId}/floors`,
            headers: {
              authorization: authToken,
            },
            body: {
              name: floorName,
              data: {
                name: floorName,
                floorNumber: floorNumber,
                abbreviation: floorNumber,
                location: {
                  building: {
                    id: buildingId,
                    name: buildingName,
                  },
                  hospital: {
                    id: hospitalId,
                    name: hospitalName,
                  },
                },
                floorPlan: 'SANTA_FE_CHRISTION_SCHOOLS_838_ACADEMY_DRIVE_LEVEL1_Rooms.geojson',
                geoJson: `{"type":"Feature","bbox":[-117.2573850339,32.9919326446,-117.2567672814,32.9924188269],"properties":{},"geometry":{"type":"Polygon","coordinates":[[[-117.2573850339,32.9919326446],[-117.2567672814,32.9919326446],[-117.2567672814,32.9924188269],[-117.2573850339,32.9924188269],[-117.2573850339,32.9919326446]]]},"floorPlan":{"type":"FeatureCollection","name":"Rooms","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-117.2567801716,32.9919700738],[-117.2567802873,32.9919700442],[-117.2567802676,32.9919699897],[-117.256790479,32.9919673747],[-117.2568391117,32.9919670862],[-117.2568391158,32.9919672568],[-117.256845524,32.9919672188],[-117.2568455283,32.9919677307],[-117.2568557858,32.9919676698],[-117.2568557815,32.991967158],[-117.2568563888,32.9919671544],[-117.2568563874,32.9919669838],[-117.2568569273,32.9919669806],[-117.2568569248,32.9919670375],[-117.2568636761,32.9919669974],[-117.2568634008,32.9919340414],[-117.2568431926,32.9919342181],[-117.2568432165,32.9919370774],[-117.2568370755,32.9919371139],[-117.2568370512,32.9919341976],[-117.2568371187,32.9919341972],[-117.2568371163,32.9919339129],[-117.2567672814,32.9919343271],[-117.2567801716,32.9919700738]]]},"properties":{"RoomNumber":"${roomName_1}","RoomName":"${roomName_1}","RoomType":"${roomType}"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-117.2568203856,32.9919698135],[-117.2568197782,32.9919698171],[-117.2568197744,32.9919693621],[-117.2567908688,32.9919695336],[-117.2567828024,32.9919715993],[-117.2567840587,32.9919750832],[-117.2567797971,32.9919761745],[-117.256791613,32.9920089419],[-117.2568200361,32.9920087733],[-117.2568198281,32.9919838643],[-117.2568198956,32.9919838639],[-117.2568198504,32.9919784613],[-117.2568204578,32.9919784577],[-117.2568203856,32.9919698135]]]},"properties":{"RoomNumber":"${roomName_2}","RoomName":"${roomName_2}","RoomType":"${roomType}"}}]}}`,
              },
            },
          }).then((response) => {
            if (response.status === 200) {
              FloorId = response.body.id
              console.log(response.body.data.geoJson)
              const data = JSON.parse(response.body.data.geoJson)
              const geoJsonData = data.floorPlan
              cy.api({
                method: 'PATCH',
                failOnStatusCode: false,
                url: baseUrl + baseEndpoint(system_ID, hospital_ID) + `/floors/${FloorId}?test=true`,
                headers: {
                  authorization: authToken,
                },
              })
              geoJsonData.features.forEach((feature) => {
                cy.api({
                  method: 'POST',
                  failOnStatusCode: false,
                  url: baseUrl + baseEndpoint(system_ID, hospital_ID) + `buildings/${buildingId}/floors/${FloorId}/rooms`,
                  headers: {
                    authorization: authToken,
                  },
                  body: {
                    name: feature.properties.RoomNumber, // Set name from RoomNumber
                    data: {
                      geoshape: JSON.stringify(feature), // Set geoshape to the entire feature object as a JSON string
                      roomNumber: feature.properties.RoomNumber,
                      roomType: feature.properties.RoomType,
                      mapLabel: feature.properties.RoomName,
                    },
                  },
                }).then((response) => {
                  roomId = response.body.id
                  HelperFunction.search_API(departmentName, 'department').then(({ authToken, Id }) => {
                    departmentId = Id
                    cy.api({
                      method: 'POST',
                      failOnStatusCode: false,
                      url: baseUrl + baseEndpoint(system_ID, hospital_ID) + `departments/${departmentId}/rooms`,
                      headers: {
                        authorization: authToken,
                      },
                      body: {
                        id: roomId,
                        force: true,
                      },
                    })
                  })
                })
              })
            } else {
              cy.log('Unable to create floor')
            }
          })
        })
      })
    })
  }

  /**
   * This function is used to create department boundaries through API
   * @param {String} departmentBoundaryName  - Name of the department boundary
   * @param {String} departmentName  -  Name of the department for which boundary needs to be created
   * @param {String} floorName - Name of the floor for which boundary needs to be created
   */
  static createDepartmentBoundary_API = (departmentBoundaryName, departmentName, floorName) => {
    let departmentId, floorId, departmentBoundaryId
    LoginPage.loginToApplication().then(({ authToken }) => {
      HelperFunction.search_API(departmentName, departments).then(({ authToken, Id }) => {
        departmentId = Id
        HelperFunction.search_API(floorName, floors).then(({ authToken, Id }) => {
          floorId = Id
          cy.api({
            method: 'POST',
            url: baseUrl + baseEndpoint(system_ID, hospital_ID) + `departmentBoundaries`,
            failOnStatusCode: false,
            headers: {
              authorization: authToken,
            },
            body: {
              data: {
                name: departmentBoundaryName,
                department: departmentId,
                geoJson:
                  '{"id":"a2dd22503517ebc198b2269e5e9d85f8","type":"Feature","properties":{},"geometry":{"coordinates":[[[-117.25647114811176,32.991763406312586],[-117.25676101003815,32.99226541524463],[-117.25721916658418,32.99173009673808],[-117.25647114811176,32.991763406312586]]],"type":"Polygon"}}',
              },
              name: departmentBoundaryName,
            },
          }).then((response) => {
            if (response.status === 200) {
              expect(response.body.name, 'verifying department boundary name').to.equal(departmentBoundaryName)
              departmentBoundaryId = response.body.id
              cy.api({
                method: 'POST',
                url: baseUrl + baseEndpoint(system_ID, hospital_ID) + `departments/${departmentId}/departmentBoundaries`,
                failOnStatusCode: false,
                headers: {
                  authorization: authToken,
                },
                body: {
                  id: departmentBoundaryId,
                },
              })
              cy.api({
                method: 'POST',
                url: baseUrl + baseEndpoint(system_ID, hospital_ID) + `floors/${floorId}/departmentBoundaries`,
                failOnStatusCode: false,
                headers: {
                  authorization: authToken,
                },
                body: {
                  id: departmentBoundaryId,
                },
              })
            } else {
              cy.log('unable to create department Boundaries')
            }
          })
        })
      })
    })
  }

  /**
   * This function is used to delete floor using API
   * @param {String} floorName  - Name of the floor that needs to be deleted
   */
  static deleteFloor_API = (floorName, hospitalName) => {
    HelperFunction.search_API(hospitalName, hospital).then(({ authToken, Id }) => {
      let hospId = Id
      HelperFunction.search_API(floorName, floors, true, hospitalName).then(({ authToken, items, Id }) => {
        if (!items || items.length === 0) {
          cy.log(`No floor found with name: ${floorName},response is ${items}`)
          return
        }

        cy.log(`Deleting ${items.length} floor(s) named: "${floorName}"`)

        items.forEach((ele) => {
          let floorId = ele.id
          cy.api({
            method: 'DELETE',
            url: baseUrl + baseEndpoint(system_ID, hospId) + `floors/${floorId}`,
            failOnStatusCode: false,
            headers: {
              authorization: authToken,
            },
            body: {
              deleteDevice: 'force',
            },
          }).then((response) => {
            if (response.status === 200) {
              cy.log('Floor deleted successfully')
            } else {
              cy.log('Unable to delete floor')
            }
          })
        })
      })
    })
  }

  /**
   * This function is used to delete department using API
   * @param {String} departmentName  - Name of the floor that needs to be deleted
   */
  static deleteDepartment_API = (departmentName) => {
    HelperFunction.search_API(departmentName, departments, true).then(({ authToken, Id, items }) => {
      if (!items || items.length === 0) {
        cy.log(`No departments found with name: ${departmentName},response is ${items}`)
        return
      }

      cy.log(`Deleting ${items.length} department(s) named: "${departmentName}"`)

      items.forEach((ele) => {
        let departmentId = ele.id
        const deleteUrl = baseUrl + baseEndpoint(system_ID, hospital_ID) + `departments/${departmentId}`

        cy.api({
          method: 'DELETE',
          url: deleteUrl,
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
          body: {
            deleteDevice: 'force',
          },
        }).then((response) => {
          if (response.status === 200) {
            expect(response.status, `Deleting department ID ${departmentId}`).to.equal(200)
            cy.log(`Deleted department ID: ${departmentId}`)
          } else {
            cy.log('Unable to delete department')
          }
        })
      })
    })
  }

  /**
   * This function is used to delete the department boundary
   * @param {String} boundaryName - The String where boundary name is given
   */
  static deleteDepartmentBoundary_API = (boundaryName) => {
    let boundaryId
    const searchUrl = baseUrl + baseEndpoint(system_ID, hospital_ID) + departmentBoundarySearch
    const deleteUrl = baseUrl + baseEndpoint(system_ID, hospital_ID)
    LoginPage.loginToApplication().then(({ authToken }) => {
      cy.api({
        method: 'POST',
        url: searchUrl,
        failOnStatusCode: false,
        headers: {
          authorization: authToken,
        },
        body: {
          limit: 100,
          offset: 0,
          filter: {
            type: 'logical',
            operator: 'and',
            conditions: [
              {
                type: 'groupedText',
                fields: [
                  {
                    type: 'interfixFinalToken',
                    field: 'data/building/name',
                  },
                  {
                    type: 'interfixFinalToken',
                    field: 'data/floor/name',
                    value: [null],
                  },
                  {
                    type: 'interfixFinalToken',
                    field: 'data/department/name',
                  },
                  {
                    type: 'interfixFinalToken',
                    field: 'data/name',
                  },
                  {
                    type: 'interfixFinalToken',
                    field: 'data/name',
                  },
                  {
                    type: 'interfixFinalToken',
                    field: 'name.keyword',
                  },
                ],
                value: `${boundaryName}`,
              },
            ],
          },
          sort: [
            {
              field: 'lastModified',
              order: 'desc',
            },
          ],
        },
      }).then((response) => {
        if (response.status === 200) {
          boundaryId = response.body.items.filter((i) => i.name === `${boundaryName}`).map((i) => i.id)
          // let boundaries = response.body.items
          // boundaryId = boundaries.map((item) => item.id)
          boundaryId.forEach((id) => {
            cy.api({
              method: 'DELETE',
              url: deleteUrl + `departmentBoundaries/${id}`,
              failOnStatusCode: false,
              headers: {
                authorization: authToken,
              },
              body: {
                deleteDevice: 'force',
              },
            }).then((response) => {
              if (response.status === 200) {
                cy.log('Department boundary deleted sucessfully')
              } else {
                cy.log('Unable to delete Department boundary')
              }
            })
          })
        } else {
          cy.log('Department Boundary Not Found')
        }
      })
    })
  }

  /**
   * Function that creates a new department using API call
   * @param {String} location - Name requried to delete the room
   */
  static deleteRoom_API = (location) => {
    let roomId
    cy.task('getAuthToken').then((authToken) => {
      HelperFunction.search_API(location, room, true).then(({ authToken, Id }) => {
        roomId = Id
        cy.api({
          url: baseUrl + deleteRoomEndpoint(project_ID, system_ID) + `${roomId}`,
          method: 'DELETE',
          failOnStatusCode: false,
          headers: {
            authorization: authToken,
          },
        }).then((res) => {
          if (res.status === 204) {
            cy.log('Room Deleted Sucessfully')
          } else {
            cy.log('unable to Delete Room ')
          }
        })
      })
    })
  }
}
