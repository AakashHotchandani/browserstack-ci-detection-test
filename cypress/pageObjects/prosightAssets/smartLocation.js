import selectors from '../../utils/selectors/prosightAssets'
import constants from '../../utils/constants/prosightAssets/smartLocation'
import Type from '../../utils/Interactions/type'
import Click from '../../utils/Interactions/click'
import { Verify } from '../../utils/assertions'
import commandOptions from '../../utils/constants/commandOptions'
import globals from '../../utils/selectors/globalSels'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import prosightCore from '../../utils/selectors/prosightCore'

/**
 * Class SmartLocation consists static functions related to Smart location Module from IAP
 * @class SmartLocation
 */

export default class SmartLocation {
  /**
   * Function that verifies the row's info matches the card on map.
   * @param {string} assetName Name of the asset how appears in the card map.
   *
   */
  static verifyRowMatchCard = (assetName) => {
    HelperFunction.getNumPagination().then((pagNum) => {
      if (pagNum > 0) {
        let i = 0
        // Alias the row once and reuse it in the subsequent calls
        cy.get(globals.rowInTable).as('assetRows')
        while (i < pagNum) {
          cy.get('@assetRows').eq(i).as('currentRow').click(commandOptions.force)
          // first position represents location in row table
          cy.get('@currentRow')
            .children()
            .eq(0)
            .invoke('text')
            .then((textInRow) => {
              Verify.theElement(selectors.smartLocation.cardOnMapInHistory).contains(textInRow)
              Verify.theElement(selectors.smartLocation.cardOnMapInHistory).contains(assetName)
            })
          i++
        }
      } else {
        cy.log(constants.logMessages.noResult)
      }
    })
  }

  /**
   * Function that applies date filters available in the dropdown and verifies the table rows
   * @param {string} filterName Name of the filter within the dropdown
   * @param {string} dateRange Date range according to the name of the filter
   */
  static applyDateFilterInDropdownAndVerify = (filterName, dateRange) => {
    const { dateFilterButton, dropdownDateButton, listOfFilterDate, parentOfDropdownDateButton } = selectors.smartLocation

    Click.forcefullyOn(dateFilterButton)
    HelperFunction.getElementFromSpecificDiv(parentOfDropdownDateButton, dropdownDateButton).click(commandOptions.force)
    Verify.theElement(listOfFilterDate).isVisible()
    Click.onContainText(listOfFilterDate, filterName)
    Click.forcefullyOn(globals.applyBtn)
    const dateObj = HelperFunction.getRangeDate(dateRange)
    this.verifyAppliedDateFilter(dateObj.startDate, dateObj.currentDate)
  }

  /**
   * Function that applies the specified date in calendar.
   * @param {string} startDate Start date for the range.
   * @param {string} endDate End date for the range.
   */
  static applyAndVerifyDateFilterInCalendar = (startDate, endDate) => {
    const { endDateInput, startDateInput, dateFilterButton } = selectors.smartLocation
    Click.forcefullyOn(dateFilterButton)
    Type.theText(startDate).into(startDateInput)
    Type.theText(endDate).into(endDateInput)
    Click.forcefullyOn(globals.applyBtn)
    this.verifyAppliedDateFilter(startDate, endDate)
  }

  /**
   * Function that verifies that dates that appear on the table
   * matches with the range of the applied date filter
   * @param {string} startDate Start date for the range.
   * @param {string} endDate End date for the range.
   */
  static verifyAppliedDateFilter = (startDate, endDate) => {
    HelperFunction.getNumPagination().then((pagNum) => {
      // Verify pagNum is not null or undefined
      expect(pagNum).to.not.be.null.and.not.be.undefined

      if (pagNum > 0) {
        let i = 0
        const startDateObj = new Date(startDate)
        const endDateObj = new Date(endDate)
        // Alias the button once and reuse it in the subsequent calls
        cy.get(globals.rowInTable).as('assetRows')
        while (i < pagNum) {
          cy.get('@assetRows').eq(i).as('currentRow')
          cy.get('@currentRow')
            .invoke('text')
            .then((rowText) => {
              // Extract date from table row
              const dateParts = rowText.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\s+[APMapmapapm]{2})/g)
              // Check that it's returning two dates
              if (dateParts && dateParts.length >= 2) {
                const [startDateTime, endDateTime] = dateParts
                // Extract date portion ans set hours to 0
                const startDateFromCell = new Date(startDateTime)
                startDateFromCell.setHours(0, 0, 0, 0)
                const endDateFromCell = new Date(endDateTime)
                endDateFromCell.setHours(0, 0, 0, 0)

                // Perform assertions on date strings
                expect(startDateFromCell).to.be.gte(startDateObj)
                expect(endDateFromCell).to.be.lte(endDateObj)
              } else {
                console.error('Invalid date-time format in rowText:', rowText)
              }
            })
          i++
        }
      } else {
        cy.log(constants.logMessages.noResult)
      }
    })
  }

  /**
   * Function that nav to historical log from button or side panel
   * @param {string} row Resulting row that contains user's data
   * @param {string} actionType Type of nav to historicalLog, options are: sidePanel or button
   * @param {string} view Type of view in the table. Options are: table view, dual view or map view.
   */
  static navToHistorical = (row, actionType, view = constants.actionType.tableView) => {
    const { historicalLogButton, assetPaneHistory } = selectors.smartLocation
    if (actionType === constants.actionType.sidePanel) {
      Click.forcefullyOn(row)
      Verify.theElement(globals.sidePanel).isVisible()
      Click.onButton(globals.sidePanel, historicalLogButton)
    } else {
      //   if (view === constants.actionType.dualView) cy.get(globals.scrollBar).scrollTo(commandOptions.scrollRight, { duration: 15000 })
      // Click.onButton( row, historicalLogButton) -- Not working, can't find the button
      Click.forcefullyOn(historicalLogButton)
    }
    Click.onContainText(assetPaneHistory, constants.buttonInnerTxt.locationHistory)
  }
}
