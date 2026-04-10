/// <reference types="cypress" />
import assetsSelectors from '../../utils/selectors/prosightAssets'
import prosightSafetySel from '../../utils/selectors/prosightSafety'
import Type from '../../utils/Interactions/type'
import Click from '../../utils/Interactions/click'
import { Verify } from '../../utils/assertions'
import commandOptions from '../../utils/constants/commandOptions'
import globals from '../../utils/selectors/globalSels'
import smartReportsConst from '../../utils/constants/smartReports'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import environmentSelectors from '../../utils/selectors/prosightEnvironment'
import APIEndpoints from '../../../APIEndpoints'
import userData from '../../fixtures/SignIn/user.json'
import prosightHandHygieneSels from '../../utils/selectors/prosightHandHygiene'
import globalConst from '../../utils/constants/globalConst'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'

const systemId = Cypress.env('SystemId')
const hospitalId = Cypress.env('HospitalId')
const apiBaseURL = Cypress.env('API_BaseUrl')

const currentDate = new Date()
const options = { year: 'numeric', month: 'long', day: 'numeric' }
const formattedDate = currentDate.toLocaleDateString('en-US', options) // Format the current date

// Calculate the date 4 days from today
const laterDate = new Date(currentDate) // Create a new Date object based on the current date
laterDate.setDate(laterDate.getDate() + 2) // Add 2 days to the new date
const formattedLaterDate = laterDate.toLocaleDateString('en-US', options) // Format the later date
const {
  reportNameInput,
  emailInput,
  addButtonInEmail,
  assetTypeLabel,
  titleInReport,
  previewReportBtn,
  downloadPreviewBtn,
  sendLaterLabel,
  sendReportAtLabel,
  sendReportOnLabel,
  timeOptionToClick,
  dropdownContainer,
  openDropdownButton,
  startDateLabel,
  stopDateLabel,
  timeLabel,
  frequencyLabel,
  calendarButton,
  clockButton,
  reportScheduleLabel,
  editButtonOnSidePanel,
  editButtonOnTableView,
  deleteButton,
  sidePanelDeleteBtn,
  assignedOwnerLabel,
  assignedDepartmentLabel,
  assetNameLabel,
  buldingLabel,
  locationLabel,
} = assetsSelectors.smartReports

const { labelComplianceLevel, labelPerformanceLevel, labelStaffType, addReportsButton, reportTypeDropDownContainer, labelAssignedDepartment } =
  prosightHandHygieneSels.smartReports
const {
  inputTag,
  createBtn,
  closeButton,
  listTag,
  resultRow,
  buttonTag,
  saveBtn,
  sidePanel,
  cancelButton,
  deleteBtn,
  dialogueDeleteBtn,
  confirmationPopup,
  clearButton,
} = globals
const { selectAll } = smartReportsConst.actionType
const { scheduledReports } = smartReportsConst.buttonInnerTxt
const { editMenu, tableBtn, sidePanelBtn } = globalConst.delete_EditActions
const { reportOptions, reportDropDownInReportForm, radioButtonsContainer, reportScheduleListOptions, reportScheduleList } =
  environmentSelectors.smartReports
const { scheduledEmailName } = prosightSafetySel.smartReports
const { departments, equipment } = leverageConstants.objectTypes
/**
 * @class IEMSmartReports consists of static function related to smart reports module
 */
export default class IEMSmartReports {
  /**
   * Function which fills the basic info of report
   * @param {object} reportDetails it is the required object which consists of necessary report details
   * @param {string} reportDetails.reportName Name to assign to the report
   * @param {string} reportDetails.department required department for report
   * @param {string} reportDetails.email Email to assign to the report
   * @param {string} reportDetails.equipmentType equipment type/asset type for the the report
   * @param {string} reportDetails.equipmentName required equipment name/ asset name for the report
   * @param {string} reportDetails.department required department name for the report
   * @param {string} reportDetails.date required date for the report
   */
  static fillReportBasicInfo = (reportDetails) => {
    const { reportName, reportType, department, email, date = null, complianceLevel = null } = reportDetails
    let requiredDepartmentLabel
    if (reportType === 'Processing Time Report (At Asset Type Level)' || reportType === 'Processing Time Report (At Asset Level)') {
      cy.get(reportNameInput).clear().type(reportName)
      cy.get(assetTypeLabel).next().click(commandOptions.force)
      cy.get(clearButton).click()
      cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
      if (reportDetails.hasOwnProperty('assetName')) {
        cy.get(assetNameLabel).next().click(commandOptions.force)
        cy.get(clearButton).click()
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
      }
      if (reportDetails.hasOwnProperty('building') && reportDetails.hasOwnProperty('department') && reportDetails.hasOwnProperty('location')) {
        cy.get(buldingLabel).next().click(commandOptions.force)
        cy.get(clearButton).click()
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
        cy.get(assignedDepartmentLabel).next().click(commandOptions.force)
        cy.get(clearButton).click()
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
        cy.get(locationLabel).next().click(commandOptions.force)
        cy.get(clearButton).click()
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
      }
    } else {
      //department label name is different in IEM and IAP so assigning label according to application type
      if (reportDetails.hasOwnProperty('assetType') || reportDetails.hasOwnProperty('equipmentType')) {
        if (reportType === 'PAR Level Frequency Report' || reportType === 'PAR Level Variance Report') {
          requiredDepartmentLabel = assignedDepartmentLabel
        } else {
          requiredDepartmentLabel = assignedOwnerLabel
        }
      } else requiredDepartmentLabel = labelAssignedDepartment

      cy.get(reportNameInput).clear().type(reportName)
      if (reportType !== 'Facility Compliance Report') {
        cy.get(requiredDepartmentLabel).next().click(commandOptions.force)
        cy.get(clearButton).click(commandOptions.force)
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
      }

      //entering fields according to different HH reports
      if (reportType === 'Compliance Report' && !reportDetails.hasOwnProperty('equipmentType')) {
        cy.get(labelComplianceLevel).next().click(commandOptions.force)
        cy.contains(listTag, complianceLevel).click(commandOptions.force)

        cy.get(labelPerformanceLevel).next().click(commandOptions.force)
        cy.get(clearButton).click()
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
      }

      //entering details according to application
      //for asset type, equipment type and equipment name selecting 'Select All' option from drop down

      if (reportDetails.hasOwnProperty('assetType')) {
        cy.get(assetTypeLabel).next().click(commandOptions.force)
        cy.get(clearButton).click()
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
      } else if (reportDetails.hasOwnProperty('equipmentType')) {
        cy.get(environmentSelectors.smartReports.equipmentTypeLabel).next().click(commandOptions.force)
        cy.get(clearButton).click()
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)

        cy.get(environmentSelectors.smartReports.equipmentNameLabel).next().click(commandOptions.force)
        cy.get(clearButton).click()
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
      } else if (reportDetails.hasOwnProperty('staffType')) {
        cy.get(labelStaffType).next().click(commandOptions.force)
        cy.get(clearButton).click()
        cy.contains(selectAll).prev().find(inputTag).should('not.be.checked').check(commandOptions.force).should(commandOptions.checked)
      }
    }

    Type.theText(email).into(emailInput)
    Click.forcefullyOn(addButtonInEmail)
  }

  /**
   * Function that selects report schedule type option from drop down
   * @param {string} scheduleType required schedule type i.e one time or recurring
   */
  static selectReportScheduleType = (scheduleType) => {
    //locating drop down button and clicking on it
    HelperFunction.getElementByLabelParent(reportScheduleLabel, openDropdownButton).click(commandOptions.force)
    //verifying there should be two options for schedule type
    cy.get(reportScheduleList)
      .find(reportScheduleListOptions)
      .should(commandOptions.haveLength, 2)
      .each(($elem, index) => {
        const text = $elem.text()
        expect(text, 'Verifying report schedule type drop down options text').to.eql(smartReportsConst.reportScheduleType[index])
      })

    //clicking on the required option
    Click.onContainText(reportScheduleListOptions, scheduleType)
  }

  /**
   * Function that verifies report title in preview report section
   * @param {string} reportName it is the required report name
   */
  static verifyPreviewReport = (reportName) => {
    cy.get(previewReportBtn).click(commandOptions.force)
    Verify.theElement(titleInReport).contains(reportName)
    cy.get(downloadPreviewBtn).should(commandOptions.enabled)
    cy.get(closeButton).should(commandOptions.enabled).click(commandOptions.force)
    //we can add assertion for downloading the report
  }

  /**
   * Function that enters details for send later section
   */
  static fillSendLaterOption = () => {
    HelperFunction.getElementByLabelParent(sendLaterLabel, inputTag).check(commandOptions.force)
    Verify.theElement(createBtn).contains(smartReportsConst.buttonInnerTxt.scheduleReport)
    HelperFunction.getElementByLabelParent(sendReportOnLabel, calendarButton).click(commandOptions.force) //click on date input drop down button
    HelperFunction.getElementByLabelParent(sendReportOnLabel, `td[title="${formattedLaterDate}"]`).click(commandOptions.force)
    HelperFunction.getElementByLabelParent(sendReportAtLabel, clockButton).click(commandOptions.force) //click on time input dropdown btn
    HelperFunction.getElementByLabelParent(sendReportAtLabel, timeOptionToClick).click(commandOptions.force) //clicking on first time option from dropdown
  }

  /**
   * Formats a given date as "MM/DD/YYYY".
   *
   * @param {Date} date - The date to format.
   * @returns {string} The formatted date as "MM/DD/YYYY".
   */
  static formatDateAsMMDDYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  /**
   * Function that verifies report details from table and side panel
   * @param {object} reportDetails it is the required which consists of necessary report details
   * @param {string} reportDetails.reportName Name to assign to the report
   * @param {string} reportDetails.email Email to assign to the report
   * @param {string} reportDetails.equipmentType equipment type for the the report
   * @param {string} reportDetails.equipmentName required equipment name for the report
   * @param {string} reportDetails.department required department name for the report
   * @param {string} reportDetails.date required date for the report
   */
  static verifyScheduledReports = (reportDetails) => {
    const { reportName, reportType, scheduleType, email, frequency = null, reportDelivery } = reportDetails
    let exactReportType, exactScheduleType
    if (reportType === 'Environmental Report') {
      exactReportType = 'Environment Reports'
    } else if (reportType === 'Leadership Board') {
      exactReportType = 'Leaderboard Report'
    } else exactReportType = reportType

    cy.log(scheduleType)
    // handling report type
    if (scheduleType.includes('One Time') || scheduleType.includes('One-Time')) {
      exactScheduleType = 'One Time'
    } else if (scheduleType.includes('Recurring')) {
      exactScheduleType = 'Recurring'
    }

    //creating test data objects that need to verify from side panel and table row
    const valuesToVerifyFromTable = { exactReportType, exactScheduleType, reportName }

    const valuesToVerifyFromSidePanel = {
      'Report Type': exactReportType,
      'Report Schedule': exactScheduleType,
      Recipients: email,
      'Created By': userData.name,
    }

    //adding extra test data for date and frequency check
    if (frequency) (valuesToVerifyFromTable.frequency = frequency), (valuesToVerifyFromSidePanel['Frequency'] = frequency)
    if (reportDelivery === 'Send Now') {
      valuesToVerifyFromTable.date = '-'
      valuesToVerifyFromSidePanel['Start Date'] = '-'
    } else {
      if (exactScheduleType === 'One Time' || exactScheduleType === 'Recurring') {
        valuesToVerifyFromTable.date = this.formatDateAsMMDDYYYY(laterDate)
        valuesToVerifyFromSidePanel['Start Date'] = this.formatDateAsMMDDYYYY(laterDate)
        //in case of recurring report adding stop date value
        if (exactScheduleType === 'Recurring') {
          valuesToVerifyFromTable.date = this.formatDateAsMMDDYYYY(currentDate)
          valuesToVerifyFromSidePanel['Start Date'] = this.formatDateAsMMDDYYYY(currentDate)
          valuesToVerifyFromTable.stopDate = this.formatDateAsMMDDYYYY(laterDate)
          valuesToVerifyFromSidePanel['Stop Date'] = this.formatDateAsMMDDYYYY(laterDate)
        }
      }
    }

    //navigating to schedule report page and verifying the reports detail
    cy.contains(buttonTag, scheduledReports).click(commandOptions.force)
    HelperFunction.search(reportName, false)
    HelperFunction.getRowByItemName(reportName, resultRow).as('resultRow')
    HelperFunction.verifyValuesExist('@resultRow', valuesToVerifyFromTable)
    //edit button should be disabled for one-time and scheduled reports
    if (exactScheduleType === 'One Time') {
      cy.get(`${buttonTag}[title="Edit Scheduled Report"]`).should('be.disabled')
    }
    //opening side panel and verifying data from side panel
    cy.get('@resultRow').click(commandOptions.force)
    //edit button should be disabled for one-time and scheduled reports
    if (exactScheduleType === 'One Time') {
      cy.get(`${buttonTag}[title="Edit Report Schedule"]`).should('be.disabled')
    }
    HelperFunction.verifyValueFromSidePanel(valuesToVerifyFromSidePanel)
  }

  /**
   * Function that enters required delivery info for recurring reports
   * @param {string} frequency Frequency to send the report
   */
  static fillReportDeliveryDetails = (frequency) => {
    //entering start and stop date
    HelperFunction.getElementByLabelParent(startDateLabel, calendarButton).click(commandOptions.force)
    HelperFunction.getElementByLabelParent(startDateLabel, `td[title="${formattedDate}"]`).click(commandOptions.force)
    HelperFunction.getElementByLabelParent(stopDateLabel, calendarButton).click(commandOptions.force)
    HelperFunction.getElementByLabelParent(stopDateLabel, `td[title="${formattedLaterDate}"]`).click(commandOptions.force)

    //entering time and frequency
    HelperFunction.getElementByLabelParent(timeLabel, clockButton).click(commandOptions.force)
    HelperFunction.getElementByLabelParent(timeLabel, timeOptionToClick).click(commandOptions.force)
    HelperFunction.getElementByLabelParent(frequencyLabel, openDropdownButton).click(commandOptions.force) //clicking on first time option from dropdown
    Click.onContainText(dropdownContainer, frequency)
  }

  /**
   * Function that selects type of report from drop down on schedule reports page
   * @param {string} reportType it is the required report type
   * @param {string} application it is the required application i.e. iap, iem, isdr
   */
  static selectReportType = (reportType, application = 'iem') => {
    const { reportOptions, reportTypeDropDown, plusIconButton } = environmentSelectors.smartReports
    const exactReportTypeText = new RegExp(`^${reportType}$`)

    //here selectors are different across the applications so assigning selectors according to the application
    if (application === 'iem') {
      cy.get(plusIconButton).click(commandOptions.force)
      cy.get(reportTypeDropDown).find(reportOptions).should(commandOptions.haveLength, 4)
    } else if (application === 'iap') {
      cy.get(assetsSelectors.smartReports.plusIconButton).click(commandOptions.force)
      cy.get(assetsSelectors.smartReports.reportTypeOptions).find(reportOptions).should(commandOptions.haveLength, 17)
    } else if (application === 'isdr') {
      cy.get(prosightSafetySel.smartReports.addReportButtonInScheduledReports).click(commandOptions.force)
      cy.get(prosightSafetySel.smartReports.reportTypeDropDown).find(reportOptions).should(commandOptions.haveLength, 2)
    } else if (application === 'HH') {
      cy.get(addReportsButton).click(commandOptions.force)
      cy.get(reportTypeDropDownContainer).find(reportOptions).should(commandOptions.haveLength, 4)
    }
    cy.contains(reportOptions, exactReportTypeText).click(commandOptions.force)
  }
  /**
   * Function that creates a report using api calls
   * @param {object} reportDetails it is the object that consists of required details for scheduling reports
   * @param {string} reportDetails.reportType required report type
   * @param {string} reportDetails.reportName required report name
   * @param {string} reportDetails.scheduleType required report delivery type
   * @param {string} reportDetails.email required email for sending the report
   * @param {string} reportDetails.departmentId required report department id
   * @param {string} reportDetails.equipmentType required equipment type
   * @param {string} reportDetails.equipmentId required equipment id
   */
  static scheduleReport_API = (reportDetails) => {
    const reportsEndpoint = APIEndpoints.reportsEndPoint(systemId, hospitalId)
    const { reportType, reportName, scheduleType, email, departmentId, equipmentType, equipmentId, department, equipmentName } = reportDetails
    let exactReportType, schedule
    const [type] = reportType.split(' ')
    const reportTypeRequired = type.toLowerCase()

    if (scheduleType === 'One-Time Report') {
      schedule = 'oneTime'
    } else if (scheduleType === 'Recurring Report') {
      schedule = 'recurring'
    }
    // Create a new Date object for the current date
    const currentDate = new Date()

    // Add two days to the current date
    currentDate.setDate(currentDate.getDate() + 2)

    // Convert the date to ISO 8601 format
    const isoStringDate = currentDate.toISOString()
    //add 10am time to current date
    currentDate.setHours(10, 0, 0, 0, 0)

    const isoStringTime = currentDate.toISOString()

    let deptId, eqpId
    HelperFunction.search_API(department, departments).then(({ authToken, Id }) => {
      deptId = Id
      HelperFunction.search_API(equipmentName, equipment).then(({ authToken, Id }) => {
        eqpId = Id
        cy.task('getAuthToken').then((authToken) => {
          cy.api({
            method: commandOptions.requestMethod.post,
            url: apiBaseURL + reportsEndpoint,
            failOnStatusCode: false,
            headers: {
              authorization: authToken,
            },
            body: {
              form: {
                basicInformation: {
                  type: `environment.smartReports.${reportTypeRequired}`,
                  name: reportName,
                  schedule: schedule,
                },
                filters: {
                  application: 'environment',
                  dateRange: 'last7Days',
                  department: [deptId],
                  itemType: [equipmentType],
                  showCalendar: true,
                  itemName: [eqpId],
                  itemNamesList: [],
                  dateRangeType: 'RANGE_TYPES_BACKWARD',
                  departmentLabel: 'Assigned Owner',
                },
                delivery: {
                  application: 'environment',
                  sendWhen: 'later',
                  sendReportOn: isoStringDate,
                  sendReportAt: isoStringTime,
                  sendReportStartingOn: null,
                  sendReportStartingAt: null,
                  sendReportEndingOn: null,
                  sendReportFrequency: null,
                  sendReportEndingOnMax: null,
                  dateTimeSelectMin: null,
                  enableSendReportEndingOn: false,
                  type: `environment.smartReports.${reportTypeRequired}`,
                  originalSendWhen: null,
                },
                recipients: [email],
              },
              config: {
                title: (exactReportType = type === 'Environmental' ? 'Environment Report' : reportType),
                type: `environment.smartReports.${reportTypeRequired}`,
                dataType: 'multiplePowerBI',
                forwardDateDisable: true,
                previewInterface: [
                  {
                    path: [
                      ['interface', '{systemId}', 'hospital'],
                      ['obj', '{hospitalId}'],
                      ['srv', 'prosightAnalytics'],
                      ['get', 'embed/{type}'],
                    ],
                  },
                ],
                interface: [
                  {
                    path: [
                      ['interface', '{systemId}', 'hospital'],
                      ['obj', '{hospitalId}'],
                      ['srv', 'prosightAnalytics'],
                      [
                        'post',
                        'scheduledReports/{type}/data',
                        {
                          context: '{}',
                        },
                      ],
                    ],
                  },
                ],
                accessors: [
                  {
                    type: 'value',
                    label: 'Date/Time',
                    path: 'time',
                    modifier: ['formatDate', 'MM/dd/yyyy hh:mm a'],
                  },
                  {
                    type: 'value',
                    label: 'Temp.',
                    path: 'temperature',
                    modifier: ['environment.temperatureAccessor'],
                  },
                  {
                    type: 'value',
                    label: 'Humidity',
                    path: 'humidity',
                  },
                  {
                    type: 'value',
                    label: 'Temp. Status',
                    path: 'temperatureStatus',
                  },
                  {
                    type: 'value',
                    label: 'Equip. Name',
                    path: 'equipmentName',
                    dontDisplay: true,
                  },
                  {
                    type: 'value',
                    label: 'Equip. ID',
                    path: 'equipmentId',
                    dontDisplay: true,
                  },
                  {
                    type: 'value',
                    label: 'Equi. Type',
                    path: 'equipmentType',
                    dontDisplay: true,
                  },
                  {
                    type: 'value',
                    label: 'Department',
                    path: 'department',
                    dontDisplay: true,
                  },
                  {
                    type: 'value',
                    label: 'Sensor ID',
                    path: 'sensorId',
                    dontDisplay: true,
                  },
                ],
                form: {
                  defaults: {
                    basicInformation: {
                      type: `environment.smartReports.${reportTypeRequired}`,
                      schedule: schedule,
                    },
                    filters: {
                      dateRange: 'last7Days',
                    },
                  },
                  useDateRangeDirection: 'backward',
                  useItemTypeFilter: true,
                  useItemFilter: true,
                },
              },
              context: {
                systemId: systemId,
                hospitalId: hospitalId,
                type: `environment.smartReports.${reportTypeRequired}`,
                filters: {
                  hospitalId: hospitalId,
                  departmentIds: [deptId],
                  itemTypeValues: [equipmentType],
                  itemNameValues: [eqpId],
                  dateRange: 'last7Days',
                },
                offset: 0,
                limit: 9999,
              },
              updatedBy: userData.username,
              createdBy: userData.username,
            },
          }).then((res) => {
            expect(res.status, 'Verifying status code').to.eq(200)
            expect(res.body, 'Verifying form property should exist in response body').to.have.property('form')
            const { name } = res.body.form.basicInformation
            expect(name, 'Verifying report name').to.eq(reportName)
            cy.log(`Report ${reportName} created successfully`)
          })
        })
      })
    })
  }

  /**
   * Function that deletes a given report
   * @param {object} dataObj Object with the report data to be deleted
   * @param {string} dataObj.reportType it is the required report type
   * @param {string} dataObj.reportName it is the required report name
   * @param {string} deleteActionType Type of deletion. It can be from sidePanel and from edit button.
   */
  static deleteReport = (dataObj, deleteActionType = tableBtn) => {
    const { reportType, reportName } = dataObj
    const exactReportType = reportType === 'Environmental Report' ? 'Environment Reports' : reportType
    const valuesToVerify = { reportName, exactReportType }

    HelperFunction.search(reportName, false)
    HelperFunction.getRowByItemName(reportName, assetsSelectors.assetsManagement.assetRow).as('currentRow')
    HelperFunction.verifyValuesExist('@currentRow', valuesToVerify)

    // deleting from sidePanel
    if (deleteActionType === sidePanelBtn) {
      cy.get('@currentRow').click(commandOptions.force)
      cy.get(sidePanel).should(commandOptions.visible)
      Click.onButton(sidePanel, sidePanelDeleteBtn)
    }
    // delete from Edit view
    else if (deleteActionType === editMenu) {
      Click.onButton('@currentRow', editButtonOnTableView)

      //verifying the default state of the buttons
      Verify.theElement(cancelButton).isEnabled()
      Verify.theElement(deleteBtn).isEnabled()
      Click.onDeleteButton()
    } else {
      Click.onButton('@currentRow', deleteButton)
    }

    Verify.theElement(confirmationPopup).contains(smartReportsConst.paneText.deleteReport)
    Click.forcefullyOn(dialogueDeleteBtn)
  }

  /**
   * Function that edits the f=given field for a report
   * @param {Object} newDataObject a object which consists of values which need to edited foa existing report
   * @param {object} prevDataObject object consists of present details of the report to be edited
   * @param {string} actionType required action type for edit operation by default it will be table del btn
   */
  static editReport = (newDataObject, prevDataObject, actionType = tableBtn) => {
    const {
      reportName = null,
      type = null,
      scheduleType = null,
      department = null,
      equipmentType = null,
      equipmentName = null,
      email = null,
    } = newDataObject
    //searching the report and navigating to edit menu
    HelperFunction.search(prevDataObject.reportName, true)
    HelperFunction.getRowByItemName(prevDataObject.reportName, globals.resultRow).as('result_row')
    if (scheduleType === 'One-Time Report') {
      HelperFunction.getElementFromSpecificDiv('@result_row', editButtonOnTableView).should('be.disabled')
      cy.get('@result_row').click(commandOptions.force)
      cy.get(sidePanel).should(commandOptions.visible)
      HelperFunction.getElementFromSpecificDiv(sidePanel, editButtonOnSidePanel).should('be.disabled')
    } else if (scheduleType === 'Recurring Report') {
      if (actionType === tableBtn) {
        //clicking on edit button according to action type
        HelperFunction.getElementFromSpecificDiv('@result_row', editButtonOnTableView).click(commandOptions.force)
      } else if (actionType === sidePanelBtn) {
        cy.get('@result_row').click(commandOptions.force)
        cy.get(sidePanel).should(commandOptions.visible)
        HelperFunction.getElementFromSpecificDiv(sidePanel, editButtonOnSidePanel).click(commandOptions.force)
      }

      //verifying that buttons should be disabled
      Verify.theElement(cancelButton).isEnabled()
      Verify.theElement(deleteBtn).isEnabled()
      //Verify.theElement(saveBtn).isDisabled() - Bug reported

      //editing the fields based on input data
      if (reportName) {
        cy.get(reportNameInput).clear().type(reportName)
      }
      if (type) {
        cy.get(reportDropDownInReportForm).find(reportOptions).should(commandOptions.haveLength, 4)
        cy.contains(reportOptions, type).click(commandOptions.force)
      }

      if (scheduleType) {
        this.selectReportScheduleType(scheduleType)
      }

      if (department) {
        cy.get(assetsSelectors.smartReports.assignedOwnerLabel).next().click(commandOptions.force)
        cy.contains(department).prev().click(commandOptions.force)
      }

      if (equipmentType) {
        cy.get(environmentSelectors.smartReports.equipmentTypeLabel).next().click(commandOptions.force)
        cy.contains(equipmentType).prev().click(commandOptions.force)
      }

      if (equipmentName) {
        cy.get(environmentSelectors.smartReports.equipmentNameLabel).next().click(commandOptions.force)
        cy.contains(equipmentName).prev().click(commandOptions.force)
      }

      if (email) {
        cy.get(scheduledEmailName).click(commandOptions.force)
        Type.theText(email).into(emailInput)
        Click.forcefullyOn(addButtonInEmail)
      }
    }
  }
}
