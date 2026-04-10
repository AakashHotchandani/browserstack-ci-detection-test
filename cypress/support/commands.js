// cypress/support/commands.js
let testResults = []
let runId = null

Cypress.Commands.add('getRunID', () => {
  cy.task('getrunID').then((id) => {
    runId = id ?? 479
    return runId
  })
})

Cypress.Commands.add('addingTestCases', function () {
  const test = this.currentTest
  if (!test) {
    console.warn('No current test found')
    return
  }

  const isFinalState = test.currentRetry() === test.retries() || test.state === 'passed'

  if (isFinalState) {
    try {
      const statusID = test.state === 'passed' ? 1 : 5
      const comment = statusID === 1 ? `Test ${test.state}` : `${test.err?.message || ''}`

      test.title
        .split(',')
        .map((id) => id.trim())
        .forEach((caseID) => {
          if (caseID) {
            testResults.push({ caseID, statusID, comment })
          }
        })
      cy.task('saveresults', testResults)
    } catch (err) {
      console.error('Failed to update the status', err)
    }
  }
})
