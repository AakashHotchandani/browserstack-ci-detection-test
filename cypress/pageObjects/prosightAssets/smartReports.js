/// <reference types="cypress" />
import selectors from '../../utils/selectors/prosightAssets'
import constants from '../../utils/constants/smartReports'
import Type from '../../utils/Interactions/type'
import Click from '../../utils/Interactions/click'
import { Verify } from '../../utils/assertions'
import commandOptions from '../../utils/constants/commandOptions'
import globals from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import prosightCore from '../../utils/selectors/prosightCore'
import globalSels from '../../utils/selectors/globalSels'
import APIEndpoints from '../../../APIEndpoints'
import LoginPage from '../signIn/siginPage'
import userData from '../../fixtures/SignIn/user.json'

const systemId = Cypress.env('SystemId')
const hospitalId = Cypress.env('HospitalId')
const apiBaseURL = Cypress.env('API_BaseUrl')

/**
 * Class SmartReports consists static functions related to Smart Reports Module from IAP
 * @class SmartReports
 */

export default class SmartReports {
  /**
   * Function that deletes a report.
   * @param {object} dataObj Object with the report data
   * @param {string} dataObj.reportType it is the required report type
   * @param {string} dataObj.reportName it is the required report name
   * @param {string} deleteActionType Type of deletion. It can be from sidePanel and from edit button.
   * @param {boolean} testCancelButton Option to test the cancel button
   */
  static deleteReport = (dataObj, deleteActionType = constants.actionType.default, testCancelButton = false) => {
    const { reportType, reportName } = dataObj
    const valuesToVerify = { reportName, reportType }
    const deleteButton = selectors.smartReports.deleteButton

    Click.onContainText(globalSels.button, constants.buttonInnerTxt.scheduledReports)
    Verify.theUrl().includes(constants.urlTxt.scheduledReports)
    HelperFunction.search(reportName)
    HelperFunction.getRowByItemName(reportName, selectors.assetsManagement.assetRow).as('currentRow')
    HelperFunction.verifyValuesExist('@currentRow', valuesToVerify)

    // deleting from sidePanel
    if (deleteActionType === constants.actionType.sidePanel) {
      cy.get('@currentRow').click(commandOptions.force)
      Click.onButton(globals.sidePanel, deleteButton)
    }
    // delete from Edit view
    else if (deleteActionType === constants.actionType.fromEdit) {
      cy.get('@currentRow').click(commandOptions.force)
      Click.onButton(globals.sidePanel, selectors.smartReports.editButton)
      if (testCancelButton) {
        Click.onCancelButton()
        return
      }
      Click.onDeleteButton()
    } else {
      Click.onButton('@currentRow', deleteButton)
    }
    Verify.theElement(globals.confirmationPopup).contains(constants.paneText.deleteReport)
    Click.forcefullyOn(globals.dialogueDeleteBtn)
    Verify.theToast.isVisible()
  }

  /**
   * Function that edits a report.
   * @param {object} dataObj Object with the current report data.
   * @param {string} dataObj.reportType it is required report type
   * @param {string} dataObj.reportName it is required name for the report
   * @param {string} dataObj.department it is required department for the report
   * @param {string} dataObj.assetType it is required assetType for report
   * @param {string} dataObj.lastNDays it is required lastDay value
   * @param {string} dataObj.email it is required email id fo report delivery
   * @param {string} dataObj.reportDelivery it is required report delivery type
   * @param {string} dataObj.dateRange it is required date range type
   * @param {string} dataObj.reportScheduleType it is required reportSchedule type
   * @param {string} dataObj.frequency it is required report frequency
   * @param {object} newDataObj Object with the updated data.
   * @param {string} newDataObj.reportType it is required report type
   * @param {string} newDataObj.reportName it is required name for the report
   * @param {string} newDataObj.department it is required department for the report
   * @param {string} newDataObj.assetType it is required assetType for report
   * @param {string} newDataObj.lastNDays it is required lastDay value
   * @param {string} newDataObj.email it is required email id fo report delivery
   * @param {string} newDataObj.reportDelivery it is required report delivery type
   * @param {string} newDataObj.dateRange it is required date range type
   * @param {string} newDataObj.reportScheduleType it is required reportSchedule type
   * @param {string} newDataObj.frequency it is required report frequency
   * @param {string} editType Type of edit. From side panel or default.
   */
  static editReport = (dataObj, newDataObj, editType = constants.actionType.default) => {
    const {
      reportTypeLabel,
      reportNameInput,
      emailInput,
      reportScheduleLabel,
      addButtonInEmail,
      previewButton,
      calendarButton,
      departmentButton,
      assetTypeButton,
      sendNowLabel,
      titleInReport,
      dateToSchedule,
      defaultDropdownClass,
      sendLaterLabel,
      sendReportAtLabel,
      sendReportOnLabel,
      timeToSchedule,
      openDropdownButton,
      dateRangeLabel,
      startDateLabel,
      timeLabel,
      stopDateLabel,
      frequencyLabel,
      dropdownContainer,
      stopDate,
      editButton,
    } = selectors.smartReports

    const { reportName, department, assetType, email, reportScheduleType, dateRange, frequency, reportDelivery, reportType } = newDataObj
    let clickInConfirm = false

    // Click on edit button in the according row
    HelperFunction.search(dataObj.reportName, false)
    HelperFunction.getRowByItemName(dataObj.reportName, selectors.assetsManagement.assetRow).as('currRow')
    if (editType === constants.actionType.sidePanel) {
      cy.get('@currRow').click(commandOptions.force)
      Click.onButton(globals.sidePanel, editButton)
    } else {
      Click.onButton('@currRow', editButton)
    }
    Verify.theUrl().includes(constants.urlTxt.edit)

    // verify the current data match
    Verify.theElement(reportNameInput).hasValue(dataObj.reportName)
    Verify.theElement(prosightCore.userManagementSel.users.buttonPillFilter).contains(dataObj.email)
    Verify.theElement(departmentButton).contains(dataObj.department)
    Verify.theElement(assetTypeButton).contains(dataObj.assetType)
    HelperFunction.getElementByLabelParent(reportTypeLabel, defaultDropdownClass).as('currentType')
    Verify.theElement('@currentType').hasValue(dataObj.reportType)
    HelperFunction.getElementByLabelParent(reportScheduleLabel, defaultDropdownClass).as('currentSchedule')
    Verify.theElement('@currentSchedule').hasValue(dataObj.reportScheduleType)
    Click.forcefullyOn(previewButton)
    Verify.theElement(titleInReport).contains(dataObj.reportName)
    Click.forcefullyOn(globals.closeButton)

    if (reportName) Type.theText(reportName).into(reportNameInput)
    if (reportScheduleType !== dataObj.reportScheduleType) {
      HelperFunction.getElementByLabelParent(reportScheduleLabel, openDropdownButton).click(commandOptions.force)
      Click.onContainText(dropdownContainer, reportScheduleType)
    }
    if (email) {
      Type.theText(email).into(emailInput)
      Click.forcefullyOn(addButtonInEmail)
    }
    if (dateRange) {
      HelperFunction.getElementByLabelParent(dateRangeLabel, openDropdownButton).click(commandOptions)
      Click.onContainText(dropdownContainer, dateRange)
    }
    if (department && department !== dataObj.department) {
      Click.forcefullyOn(departmentButton)
      Click.forcefullyOn(globals.clearFilterButton)
      Click.onContainText(globals.dropdownContainer, department)
    }
    if (assetType && assetType !== dataObj.assetType) {
      Click.forcefullyOn(assetTypeButton)
      Click.forcefullyOn(globals.clearFilterButton)
      Click.onContainText(globals.dropdownContainer, assetType)
    }
    if (reportScheduleType === constants.actionType.recurringReport) {
      // Report Delivery section
      HelperFunction.getElementByLabelParent(startDateLabel, openDropdownButton).click(commandOptions.force)
      Click.forcefullyOn(dateToSchedule)
      HelperFunction.getElementByLabelParent(stopDateLabel, openDropdownButton).click(commandOptions.force)
      Click.onIndexNo(stopDate, 1)
      HelperFunction.getElementByLabelParent(timeLabel, openDropdownButton).click(commandOptions.force)
      HelperFunction.getElementByLabelParent(timeLabel, timeToSchedule).click(commandOptions.force)
      HelperFunction.getElementByLabelParent(frequencyLabel, openDropdownButton).click(commandOptions.force)
      Click.onContainText(dropdownContainer, frequency)
    }

    if (reportDelivery === constants.actionType.sendLater) {
      HelperFunction.getElementByLabelParent(sendLaterLabel, 'input').check(commandOptions.force)
      Verify.theElement(globals.createBtn).contains(constants.buttonInnerTxt.scheduleReport)
      HelperFunction.getElementByLabelParent(sendReportOnLabel, openDropdownButton).click(commandOptions.force)
      Click.forcefullyOn(dateToSchedule)
      HelperFunction.getElementByLabelParent(sendReportAtLabel, openDropdownButton).click(commandOptions.force)
      Click.forcefullyOn(timeToSchedule)
    }
    if (reportDelivery === constants.actionType.sendNow) {
      HelperFunction.getElementByLabelParent(sendNowLabel, 'input').check(commandOptions.force)
      clickInConfirm = true
    }

    Verify.theElement(globals.createBtn).isEnabled()
    Click.forcefullyOn(globals.createBtn)
    if (clickInConfirm) {
      Click.forcefullyOn(globals.confirmationBtnInConfirmationDialogue)
      return
    }
  }

  /**
   * Function that creates a report using api calls
   * @param {object} reportDetails it is the object that consists of required details for scheduling reports
   * @param {string} reportDetails.reportType required report type
   * @param {string} reportDetails.reportName required report name
   * @param {string} reportDetails.scheduleType required report delivery type i.e one time or recurring
   * @param {string} reportDetails.email required email for sending the report
   * @param {string} reportDetails.departmentId required report department id
   * @param {string} reportDetails.assetType required asset type
   */
  static scheduleAssetReport_API = (reportDetails) => {
    const reportsEndpoint = APIEndpoints.reportsEndPoint(systemId, hospitalId)
    const { reportType, reportName, scheduleType, email, departmentId, assetType } = reportDetails
    let reportTypeRequired

    if (reportType.includes('Status')) {
      reportTypeRequired = 'inventory'
    } else if (reportType.includes('Utilization')) {
      reportTypeRequired = 'utilization'
    } else if (reportType.includes('Missing')) {
      reportTypeRequired = 'shrinkage'
    } else if (reportType.includes('Rentals')) {
      reportTypeRequired = 'rentals'
    }

    const schedule = HelperFunction.toCamelCase(scheduleType)
    // Create a new Date object for the current date
    const currentDate = new Date()

    // Add two days to the current date
    currentDate.setDate(currentDate.getDate() + 2)

    // Convert the date to ISO 8601 format
    const isoStringDate = currentDate.toISOString()
    //add 10am time to current date
    currentDate.setHours(10, 0, 0, 0, 0)

    const isoStringTime = currentDate.toISOString()

    LoginPage.loginToApplication().then(({ authToken }) => {
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
              type: `assets.smartReports.${reportTypeRequired}`,
              name: reportName,
              schedule: schedule,
            },
            filters: {
              application: 'assets',
              dateRange: 'last7Days',
              department: [departmentId],
              itemType: [assetType],
              showCalendar: true,
              itemName: null,
              itemNamesList: [],
              dateRangeType: 'RANGE_TYPES_BACKWARD',
              departmentLabel: 'Assigned Owner',
            },
            delivery: {
              application: 'assets',
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
              type: `assets.smartReports.${reportTypeRequired}`,
              originalSendWhen: null,
            },
            recipients: [email],
          },
          config: {
            title: reportType,
            type: 'assets.smartReports.inventory',
            dataType: 'powerBI',
            interface: [
              {
                path: [
                  ['interface', '{systemId}', 'hospital'],
                  ['obj', '{hospitalId}'],
                  ['srv', 'prosightAnalytics'],
                  ['get', 'embed/{type}'],
                ],
              },
            ],
            form: {
              defaults: {
                basicInformation: {
                  type: 'assets.smartReports.inventory',
                  schedule: schedule,
                },
                filters: {
                  dateRange: 'last7Days',
                },
              },
              useDateRangeDirection: 'backward',
              useItemTypeFilter: true,
            },
          },
          context: {
            systemId: systemId,
            hospitalId: hospitalId,
            type: `assets.smartReports.${reportTypeRequired}`,
            filters: {
              hospitalId: hospitalId,
              departmentIds: [departmentId],
              itemTypeValues: [assetType],
              itemNameValues: [],
              dateRange: 'last7Days',
            },
            offset: 0,
            limit: 9999,
          },
          updatedBy: userData.username,
          createdBy: userData.username,
        },
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('form')
        const { name } = res.body.form.basicInformation
        expect(name).to.eq(reportName)
        cy.log(`Report ${reportName} created successfully`)
      })
    })
  }
}
