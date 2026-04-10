
import selectors from '../../utils/selectors/prosightCore'
import commandOptions from '../../utils/constants/commandOptions'
import constants from '../../utils/constants/smartAlertsManagementConst'
import Asset_API from "../../pageObjects/prosightAssets/assetSmartAlerts"
import smartAlertsUsingAPI from "../../pageObjects/prosightCore/triggeringAlerts";
import leverageConstants from "../../utils/constants/Leverage/leverageConstants";
import { Verify } from '../../utils/assertions';
import globalSels from '../../utils/selectors/globalSels';
import APIEndpoints from "../../../APIEndpoints";

/*
    This class contains all the methods to interact with the Admin app - Smart Alerts page

*/

export default class SmartAlertsManagement {

    /*
        This method creates dynamic data from date to create an asset and trigger an alert using triggerTagAlert method
        @param {object} alertData - Object containing all the data to trigger an alert
        @param {number} qty -Number of alerts to be triggered
    */
    static triggerMultipleAlerts = (alertData, qty = 1) => {
        const totalAlerts = []
        let date = Date.now();
        for (let i = 0; i < qty; i++) {
            const alert = {
                ...alertData, deviceId: alertData.deviceId + date,
                assetDetails: { ...alertData.assetDetails, assetName: alertData.assetDetails.assetName + date, assetId: alertData.assetDetails.assetId + date },
            }
            this.triggerTagAlert(alert)
            date = date + 1

            totalAlerts.push(alert)
        }
        return totalAlerts
    }

    /*
        Acknowledge an alert from the table
        @param {object} alert - Object containing all the data to acknowledge an alert
    */
    static convertTriggeredAlertToAcknowledged = (alert) => {
        this.navigateToSmartAlertsPage();
        this.navigateToAlertSubmodule();
        this.searchInTable(alert.deviceId)
        this.openAcknowledgeAlertModalFromDropdown()
        Verify.theElement(selectors.smartAlertsManagementSel.modal).isVisible()
        this.acknowledgeAlertinModal(constants.alertEditInput)
        Verify.theToast.showsUpWithText(constants.toastMessages.messageAfterAlertAcknowledge)
    }

    /*
        Converts a triggered alert to a cleared alert
        @param {object} alert - Object containing all the data to clear an alert
    */
    static convertTriggeredAlertToTask = (alert) => {
        this.navigateToSmartAlertsPage();
        this.navigateToAlertSubmodule();
        cy.reload()
        this.searchInTable(alert.deviceId)
        this.openCreateTaskModalFromDropdown()
        this.createTaskAlert(constants.taskEditInput)
        Verify.theToast.isVisible(constants.toastMessages.messageAfterTaskCompletion)
    }

    /* Navigates to the Smart Alerts page */

    static navigateToSmartAlertsPage = () => {
        cy.get(globalSels.button).contains(constants.buttonsInnerText.smartAlertManagement).click(commandOptions.force)
    }

    /* Navigates to the Smart Alert/Task page */
    static navigateToTaskSubmodule = () => {
        cy.get(globalSels.button).contains(constants.buttonsInnerText.tasks).click(commandOptions.force)
    }

    /* Navigates to the Smart Alert/Event page */
    static navigateToAlertSubmodule = () => {
        cy.get(globalSels.button).contains(constants.buttonsInnerText.alerts).click(commandOptions.force)
    }

    /* Navigates to the Smart Alert/Event page */
    static navigateToEventsSubmodule = () => {
        cy.get(globalSels.button).contains(constants.buttonsInnerText.events).click(commandOptions.force)
    }


    /*
        Changes the sort order of the table by the Device ID column
    */
    static changeDeviceIdSortOrder = () => {
        cy.get(selectors.smartAlertsManagementSel.tableColumnHeader).contains(constants.tableColumnHeaders.deviceId).click(commandOptions.force)
    }

    /*
        Opens the column filter for the specified column
        @param {string} filter - The name of the column to open the filter for    
    */
    static openColumnFilter = (filter) => {
        cy.get(selectors.smartAlertsManagementSel.tableColumnHeader).contains(filter).next().click(commandOptions.force)
    }
    /*
        Types the value to search in the column filter
        @param {string} filter - The value to search in the column filter
    */
    static searchByValueFilter = (filter) => {
        cy.get(selectors.smartAlertsManagementSel.tableHeaderFilterPopupSearchInput).type(filter, commandOptions.force)
    }

    /* 
        Checks the checkbox for the specified value in the column filter list
        @param {string} value - The value to check in the column filter list
    */
    static selectFilterValueFromPopup = (value) => {
        cy.get(selectors.smartAlertsManagementSel.tableHeaderPopupOptionLabel).contains(value).click(commandOptions.force)
    }

    /*
        Types the start and end date to the date range filter
        @param {string} startDate - The start date to apply to the date range filter
        @param {string} endDate - The end date to apply to the date range filter
    */
    static selectDateRangeFilter = (startDate, endDate) => {
        cy.get(selectors.smartAlertsManagementSel.dateRangeStartInput).type(startDate, commandOptions.force).type(commandOptions.enter)
        cy.get(selectors.smartAlertsManagementSel.dateRangeEndInput).type(endDate, commandOptions.force).type(commandOptions.enter)
    }

    /*
        Applies the date range filter
    */
    static applyDateRangeFilter = () => {
        cy.get(globalSels.button).contains(constants.buttonsInnerText.apply).click(commandOptions.force)
        cy.reload()
    }

    /*
        Applies the column filter, clicking in the button
    */
    static applyFilter = () => {
        cy.get(globalSels.button).contains(constants.buttonsInnerText.apply).click(commandOptions.force)
    }

    /*
        Triggers the date range filter modal
    */
    static openDateRangeFilterModal = () => {
        cy.get(selectors.smartAlertsManagementSel.dateRangePickerButton).click(commandOptions.force)
    }

    /* 
        Workaraound used to make far right columns visible in the table
    */
    static makeScrollableColumnsVisible = () => {
        this.scrollTableToRight()
        cy.get(selectors.smartAlertsManagementSel.lastTableCell).first().click(commandOptions.force)
        cy.get(selectors.smartAlertsManagementSel.alertCloseSidePanel).first().click(commandOptions.force)
        this.scrollTableToRight()

    }

    /* 
        Opens the edit alert modal for the first row in the table
    */
    static openEditAlertModal = () => {
        this.makeScrollableColumnsVisible()
        this.scrollTableToRight()
        cy.get(selectors.smartAlertsManagementSel.tableEditButton).first().scrollIntoView().click(commandOptions.force)
    }

    /*
        Opens the alert action dropdown for the first row in the table
    */
    static openAlertActionDropdown = () => {
        this.makeScrollableColumnsVisible()
        this.scrollTableToRight()
        cy.get(selectors.smartAlertsManagementSel.tableAlertActionDropdown).first().click(commandOptions.force)
    }

    /*
        Clicks cancel button to edit the alert from the modal
    */
    static cancelEditAlertModal = () => {
        cy.get(globalSels.button).contains(constants.buttonsInnerText.cancel).click(commandOptions.force)

    }


    /*
      Types the new text to edit the alert from the modal and clicks save button
  */
    static createTaskAlert(newText) {
        cy.get(selectors.smartAlertsManagementSel.modalTaskInput).clear(commandOptions.force).type(newText, commandOptions.force)
        cy.get(globalSels.button).contains(constants.buttonsInnerText.create).click(commandOptions.force)
    }

    /*
        Types the new text to edit the alert from the modal and clicks save button
    */
    static editTaskAlert(newText) {
        cy.get(selectors.smartAlertsManagementSel.modalTaskInput).clear(commandOptions.force).type(newText, commandOptions.force)
        cy.get(globalSels.button).contains(constants.buttonsInnerText.save).click(commandOptions.force)
    }

    /*
        Opens the complete task modal for the first row in the table
    */
    static openCompleteTaskModal = () => {
        this.makeScrollableColumnsVisible()
        this.scrollTableToRight()
        cy.get(selectors.smartAlertsManagementSel.tableCompletedButton).first().click(commandOptions.force)
    }

    /*
        Fills the detail and acknowledge an alert from the acknowledge alert modal
        @param {string} details - The details to fill in the acknowledge alert modal
    */
    static acknowledgeAlertinModal = (details) => {
        cy.get(selectors.smartAlertsManagementSel.modalAlertInput).clear(commandOptions.force).type(details, commandOptions.force)
        cy.get(globalSels.button).contains(constants.buttonsInnerText.acknowledge).click(commandOptions.force)
    }

    /*
        Opens the acknoeledge alert modal for the first row in the table from the dropdown column
    */
    static openAcknowledgeAlertModalFromDropdown = () => {
        this.openAlertActionDropdown()
        cy.get(selectors.smartAlertsManagementSel.tableAlertActionDropdownOptions).first().contains(constants.alertDropdown.options[0]).click(commandOptions.force)
    }


    /*
        Opens the clear alert modal for the first row in the table from the dropdown column
    */
    static openClearAlertModalFromDropdown = () => {
        this.openAlertActionDropdown()
        cy.get(selectors.smartAlertsManagementSel.tableAlertActionDropdownOptions).first().contains(constants.alertDropdown.options[1]).click(commandOptions.force)
    }

    /*
        Opens the create task modal for the first row in the table from the dropdown column
    */
    static openCreateTaskModalFromDropdown = () => {
        this.openAlertActionDropdown()
        cy.get(selectors.smartAlertsManagementSel.tableAlertActionDropdownOptions).first().contains(constants.alertDropdown.options[2]).click(commandOptions.force)
    }

    /*
        Confirms the complete alert task action from the modal
    */
    static completeTaskInModal = () => {
        cy.get(selectors.smartAlertsManagementSel.modal).find(globalSels.button).contains(constants.buttonsInnerText.complete).click(commandOptions.force)
    }

    /*
        Cancels the complete alert task action from the modal
    */
    static cancelCompleteTask = () => {
        cy.get(selectors.smartAlertsManagementSel.modal).find(globalSels.button).contains(constants.buttonsInnerText.cancel).click(commandOptions.force)

    }

    /*
        Types in the table search bar the value to search and presses enter
        @param {string} value - The value to search in the table
        @param {boolean} reload - If true, the page is reloaded after the search so DOM is updated
    */
    static searchInTable = (value, reload = true) => {
        cy.get(selectors.smartAlertsManagementSel.searchInput).clear(commandOptions.force).
            type(commandOptions.enter, commandOptions.force)
        cy.get(selectors.smartAlertsManagementSel.searchInput).type(value, commandOptions.force).type(commandOptions.enter, commandOptions.force)
        if (reload) {
            cy.reload()
        }
    }

    /*
        Clears all the filters pill of the table
    */
    static clearTableFilters() {
        cy.get(selectors.smartAlertsManagementSel.tableClearAllFiltersButton).click(commandOptions.force)
        this.clearSearchInput()
    }

    /*
        Clears the search input of the table
    */
    static clearSearchInput = () => {
        cy.get(selectors.smartAlertsManagementSel.searchInput).clear(commandOptions.force)
    }

    /*
        Activates the bulk edit mode of the table
    */
    static activateBulkEdit = () => {
        cy.get(selectors.smartAlertsManagementSel.bulkAction).click(commandOptions.force)
    }

    /*
        Selects the first two rows of the table
    */
    static checkTwoRows = () => {
        cy.get(selectors.smartAlertsManagementSel.tableBulkCheckbox).first().parent().click(commandOptions.force)
        cy.get(selectors.smartAlertsManagementSel.tableBulkCheckbox).eq(1).parent().click(commandOptions.force)
    }

    /*
        Clicks the bulk complete button of the table
    */
    static clickBulkComplete = () => {
        cy.get(selectors.smartAlertsManagementSel.userActions +' '+globalSels.button).contains(constants.buttonsInnerText.complete).click(commandOptions.force)
    }

    /*
        Clicks the bulk clear button of the table
    */
    static clickBulkClear = () => {
        cy.get(globalSels.button).contains(new RegExp(constants.buttonsInnerText.clear)).click(commandOptions.force)
    }

    /*
        Clicks the bulk acknowledge button of the table
    */
    static clickBulkAcknowledge = () => {
        cy.get(globalSels.button).contains(constants.buttonsInnerText.acknowledge).click(commandOptions.force)
    }

    /*
        Confirms clear alter from the modal
    */
    static confirmClearAlert = () => {
        cy.get(selectors.smartAlertsManagementSel.modal).find(globalSels.button).contains(new RegExp(constants.buttonsInnerText.clear)).click(commandOptions.force)
    }

    /*
        Cancels clear alert from the modal
    */
    static cancelClearAlert = () => {
        cy.get(selectors.smartAlertsManagementSel.modal).find(globalSels.button).contains(constants.buttonsInnerText.cancel).click(commandOptions.force)
    }

    /*
        Confirms acknowledge alert from the modal
    */
    static confirmAcknowledgeAlert = () => {
        cy.get(selectors.smartAlertsManagementSel.modal).find(globalSels.button).contains(constants.buttonsInnerText.acknowledge).click(commandOptions.force)
    }

    /*
        Confirms complete alert from the modal
    */
    static confirmComplete = () => {
        cy.get(selectors.smartAlertsManagementSel.modal).find(globalSels.button).contains(constants.buttonsInnerText.complete).click(commandOptions.force)
    }

    static scrollTableToRight = () => {
        cy.get(selectors.smartAlertsManagementSel.tableBody).scrollTo('right', { ensureScrollable: false })
    }

    /**
     * Scrolls the table to the left
     */
    static scrollTableToLeft = () => {
        cy.get(selectors.smartAlertsManagementSel.tableBody).scrollTo('left')
    }

    static unacknowledgeFromTable = () => {
        this.scrollTableToRight()
        cy.get(selectors.smartAlertsManagementSel.lastTableCell).first().click(commandOptions.force)
        cy.get(selectors.smartAlertsManagementSel.alertCloseSidePanel).first().click(commandOptions.force)
        cy.get(selectors.smartAlertsManagementSel.tableUnacknowledgeButton).first().click(commandOptions.force)
    }

    /*
        Unacknowledge the first row alert from the side panel
    */
    static unacknowledgeFromSidePanel = () => {
        cy.reload()
        cy.get(selectors.smartAlertsManagementSel.tableRow).first().click(commandOptions.force)
        Verify.theElement(selectors.smartAlertsManagementSel.unacknowledgeSidePanelButton).isVisible()
        Verify.theElement(selectors.smartAlertsManagementSel.unacknowledgeSidePanelButton).isNotDisabled()
        cy.get(selectors.smartAlertsManagementSel.unacknowledgeSidePanelButton).click(commandOptions.force).click(commandOptions.force)
    }

    /*
        Confirms the unacknowledge action from the modal
    */
    static confirmUnacknowledge = () => {
        cy.get(selectors.smartAlertsManagementSel.modal).find(globalSels.button).contains(constants.buttonsInnerText.unacknowledge).click(commandOptions.force)
    }

    /* 
        Cancels the unacknowledge action from the modal
    */
    static cancelUnacknowledge = () => {
        cy.get(selectors.smartAlertsManagementSel.modal).find(globalSels.button).contains(constants.buttonsInnerText.cancel).click(commandOptions.force)
    }

    /**
     * Calls smartAlertsUsingAPI.createTags to create the asset and tag details, Asset_API.createAsset to create the asset and smartAlertsUsingAPI.loginToArchitectAndTriggerAlerts to trigger the alert
     * @param {object} alertData - Object containing all the data to trigger an alert
     */
    static triggerTagAlert = (alertData) => {
        smartAlertsUsingAPI.createTags(alertData.deviceId, alertData.assetTagDetails,)
        Asset_API.createAsset(alertData.assetDetails, alertData.deviceId)
        // this.deleteAllTriggeredAlerts(alertData)
        smartAlertsUsingAPI.loginToArchitectAndTriggerAlerts(APIEndpoints.assetSearchEndpoint, undefined, undefined, alertData.assetDetails.assetName, undefined, leverageConstants.alertTypes.assetAlerts.assetTagOfflineAlert)
        cy.reload()
    }

    /**
     * Calls smartAlertsUsingAPI.deleteDeviceAndTagDetails to delete the asset and tag details and smartAlertsUsingAPI.deleteTimer to delete the timer.
     * @param {object} alertData - Object containing all the data to trigger an alert
     */
    static deleteTriggeredTagAlert = (alertData) => {
        smartAlertsUsingAPI.deleteTimer()

        smartAlertsUsingAPI.deleteAllAlerts(alertData.assetDetails.assetName)
        smartAlertsUsingAPI.deleteDeviceAndTagDetails(alertData.ApiEndpoints.assetSearchEndpoint, alertData.assetDetails.assetName,
            alertData.ApiEndpoints.assetActionEndpoint, alertData.assetDetails.assetTypeName, alertData.assetDetails.assetType,
            alertData.assetDetails.valueDefault)
    }

    /**
     * Uses the API to delete all the triggered alerts
     * @param {object} alertData - Object containing all the data to trigger an alert
     */
    static deleteAllTriggeredAlerts = (alertData) => {
        smartAlertsUsingAPI.deleteAllAlerts(alertData.assetDetails.assetName)

    }

    /* Verifying functions 
      @param {string} sel - The selector to verify
      @param {string} num - The alias to use for the selector    
    */
    static elements = (sel, num) => {
        return {
            /** Checks if the text in the element is a date between two given dates
             * @param {Date} min 
             * @param {Date} max 
             */
            betweenDates: (min, max) => {
                cy.get(sel).eq(num).invoke('text').then((text) => {
                    const onlyDate = text.split(' ')[0];
                    const parsedDate = Date.parse(onlyDate);
                    const date = new Date(parsedDate);
                    expect(date).to.be.gte(min);
                    expect(date).to.be.lte(max);
                })
            },
            /*
                Checks if the text in the element is a number
            */
            innerTextIsNumber: () =>
                cy
                    .get(sel)
                    .eq(num).invoke('text')
                    .then((text) => {
                        const numericValue = parseFloat(text);
                        expect(numericValue).to.not.be.NaN;
                    }),
            /* 
                Checks if the text in the element is a string
            */
            innerTextIsString: () =>
                cy
                    .get(sel)
                    .eq(num)
                    .invoke('text')
                    .then((text) => {
                        const actualType = typeof text;
                        expect(actualType).to.equal('string');
                    }),
            /* 
                Checks if the text in the element is a date
            */
            innerTextIsDate: () =>
                cy
                    .get(sel)
                    .eq(num)
                    .invoke('text')
                    .then((text) => {
                        const date = new Date(text);
                        expect(date.toString()).to.not.equal('Invalid Date');
                    }),
         /* 
            Checks if the given vh
         */
            checkboxesAreNotChecked: () => {
                cy.get(sel).invoke('attr', 'data-value').should('equal', 'false')
            },
        }
    }

    /*Asserts a single element */
    static element = (sel) => {
        return {
            /* 
                Checks if checkbox is not checked
            */
            checkboxIsNotChecked: () => {
                cy.get(sel).eq(0).invoke('attr', 'data-value').should('equal', 'false')
            }
        }
    }

    /*
        Wraps all calls to HelperFunctions.getColumnIndexByHeader to avoid race conditions
    */
    static assertColumnValueTypeWrapper = (columns)=>{
        return Cypress.Promise.all(columns)
    }

}

