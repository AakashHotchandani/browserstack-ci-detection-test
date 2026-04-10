//<reference types="cypress" />
import globalSels from '../../utils/selectors/globalSels'
import loginPage from '../../utils/selectors/loginPage'
import APIEndpoints from '../../../APIEndpoints'
import signIn from '../../fixtures/SignIn/user.json'
import options from '../../utils/constants/commandOptions'
const project_Id = Cypress.env('ProjectId')
const apiBaseURL = Cypress.env('API_BaseUrl')

/**
 * This class consists of different methods related to login page
 * @class LoginPage
 */
export default class LoginPage {
  /**
   * Static function used to visit any provided URL
   * @param {String} page it is the required page URL
   */
  static toVisit = (page) => {
    cy.visit(page)
  }

  /**
   * Function which do a user login by entering user details
   * @param {string} username it is the required username for login
   * @param {string} password it is the required password for login
   */
  static doUserLogin = (username, password) => {
    cy.get(loginPage.loginForm.usernameInput).clear().type(username)
    cy.get(loginPage.loginForm.passwordInput).clear().type(password)
    cy.contains(globalSels.buttonTag, 'Sign In').click()
  }

  /**
   * This function logs into the application.
   * It makes a POST request to the login endpoint with the provided username and password.
   * Upon successful login, it retrieves the user ID and authentication token.
   *
   * @param {string} [userName=signIn.username] - The username for login. Defaults to the username defined in signIn.
   * @param {string} [password=signIn.password] - The password for login. Defaults to the password defined in signIn.
   * @returns {Promise<string>} A promise that resolves with an object consists of authentication token and user id if the login is successful, or rejects with an error message if the login fails or if there is an error during the login process.
   */
  static loginToApplication = (userName = signIn.username, password = signIn.password) => {
    const loginEndPoint = APIEndpoints.loginEndpoint

    return new Cypress.Promise((resolve, reject) => {
      cy.api({
        method: options.requestMethod.post,
        failOnStatusCode: false,
        url: apiBaseURL + loginEndPoint,
        body: {
          username: userName,
          password: password,
          projectId: project_Id,
        },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.status, 'Verifying response code').equal(200)
          expect(res.body, 'Verifying response should have property idToken').to.have.property('idToken')
          expect(res.body.profile, 'Verifying response should have property id').to.have.property('id')
          const authData = {
            userId: res.body.profile.id,
            authToken: 'Bearer ' + res.body.idToken,
          }
          resolve(authData)
        } else {
          cy.log('unable to login')
        }
      })
    })
  }
}
