import { parse } from 'csv-parse/sync'
import LoginPage from '../../../../pageObjects/signIn/siginPage'
import { Verify } from '../../../../utils/assertions'
import globals from '../../../../utils/selectors/globalSels'
import constants from '../../../../utils/constants/prosightCore/hospitalManagementConst'
import HelperFunction from '../../../../utils/helpers/crossModuleFunctions'
import userData from "../../../../fixtures/userRoles/userCred.json"
import OverviewDashboard from '../../../../pageObjects/overViewDashboardFns'
import ISDR_OverviewDashboard from '../../../../pageObjects/prosightSafety/ISDR_dashboard'
import Click from '../../../../utils/Interactions/click'

const { name, username, password } = userData
const { buttonTag, overViewDashBoard } = globals

describe('It should verify information on ISDR Overview Dashboard report content', () => {
  beforeEach('Should login to the application', () => {
    HelperFunction.globalIntercept()
    LoginPage.toVisit('/safety')
    LoginPage.doUserLogin(username, password)
    Verify.theElement(globals.profileSection.userProfileBtn).hasText(name)
    Click.onContainText(buttonTag, overViewDashBoard)
    Verify.theUrl().includes(constants.urlText.overviewDashboard)
  })

  it('verifying total staff count from overview dashboard', () => {
    //making an api request to get total number staff in linked state
    ISDR_OverviewDashboard.getStaffCount().then((count) => {
      cy.contains('Total Staff').next().should('have.text', count)
    })
  })

  it('verifying total staff emergency count from overview dashboard', () => {
    //making an api request to get total number staff emergency alerts
    ISDR_OverviewDashboard.getStaffAlertsCount('Staff Emergency Alert').then((count) => {
      cy.contains('Staff Emergency').next().should('have.text', count)
    })
  })

  it('verifying total Escalated alerts count from overview dashboard', () => {
    //making an api request to get total number staff emergency alerts
    ISDR_OverviewDashboard.getStaffAlertsCount(undefined, true).then((data) => {
      //filtering out escalated alerts
      const escalatedAlerts = data.filter((prop) => prop.data?.['escalated'] === true)

      cy.contains('Escalated Alerts').next().should('have.text', escalatedAlerts.length)
    })
  })

  it('verifying total Active alerts count from overview dashboard', () => {
    //making an api request to get total number staff emergency alerts
    ISDR_OverviewDashboard.getStaffAlertsCount().then((count) => {
      cy.contains('Active Alerts').next().should('have.text', count)
    })
  })
})
