/// <reference types="cypress" />
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import Click from '../../../../utils/Interactions/click'
import { Verify } from '../../../../utils/assertions'
import globals from '../../../../utils/selectors/globalSels'
import iapSmartLocationConstants from '../../../../utils/constants/prosightAssets/smartLocation'
import assetsConstants from '../../../../utils/constants/prosightAssets/assetsManagement'
import prosightAssetsSel from '../../../../utils/selectors/prosightAssets'
import SmartAlertsUsingAPI from '../../../../pageObjects/prosightCore/triggeringAlerts'
import alertData from '../../../../fixtures/leverage/dataForTriggeringAlerts'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import leverageConstants from '../../../../utils/constants/Leverage/leverageConstants'
import SmartLocation from '../../../../pageObjects/prosightAssets/smartLocation'
import Safety_API from '../../../../pageObjects/prosightSafety/safetySmartAlerts'
import staffData from '../../../../fixtures/prosightSafety/staffForSmartLocation.json'
import constants from '../../../../utils/constants/prosightSafety/smartLocation'
import SmartLocationSafety from '../../../../pageObjects/prosightSafety/smartLocation'
import safetySmartAlerts from '../../../../utils/constants/prosightSafety/safetySmartAlerts'
import APIEndpoints from '../../../../../APIEndpoints'
const system_Id = Cypress.env('SystemId')
const hospital_Id = Cypress.env('HospitalId')
const staffSearchEndpoint = APIEndpoints.staffSearchEndpoint
const staffActionEndpoint = APIEndpoints.staffActionsEndpoint(system_Id, hospital_Id)

// Current staff
let currStaffObj
// General selectors
const {
  tableViewButton,
  viewOnMapButton,
  historicalLogButton,
  backAssetHistoryButton,
  assetPaneHistory,
  mapBox,
  tableInHistory,
  acknowledgeButton,
  dualViewButton,
} = prosightAssetsSel.smartLocation
const { currentRoom, departmentName, floorName, buildingName } = alertData.assetTagDetails
const staffRow = prosightAssetsSel.assetsManagement.assetRow
const isdrApp = constants.dataOptions.isdr
const { last24Hours, last30Days, last7Days, today } = iapSmartLocationConstants.buttonInnerTxt
const { last24Number, last30DaysNumber, last7DaysNumber, todayNumber } = iapSmartLocationConstants.dates
const dateObj = HelperFunction.getRangeDate(7)


describe('Should execute functions within the Smart Location -  Table View - No Alerts related test cases', () => {
  
  beforeEach('Login to safety and navigate to smart location sub-module', () => {
    HelperFunction.globalIntercept()
    cy.fixture('userRoles/userCred').then((userData) => {
      LoginPage.toVisit('/safety')
      LoginPage.doUserLogin(userData.username, userData.password)
      Verify.theElement(globals.profileSection.userProfileBtn).hasText(userData.name)
      Verify.theUrl().includes(assetsConstants.urlText.smartLocation)
    })
  })
  it('Table View -  User should not be able to track Staff',()=>{
    Click.forcefullyOn(tableViewButton)
    cy.contains("There are no active Staff Emergency Alerts");
  })
  it('Dual View -  User should not be able to track Staff',()=>{
    Click.forcefullyOn(dualViewButton)
    cy.contains("There are no active Staff Emergency Alerts");
  })
  })
