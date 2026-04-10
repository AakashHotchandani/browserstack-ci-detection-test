// cypress/support/createTestRail.js

const fetch = require('node-fetch') // make sure node-fetch is installed
const testRailUrl = 'https://cognosos.testrail.io'
const username = 'Chinmayee.s@cognosos.com'
const password = '4Kt8zyQaJDicAJ/Zq9k0-/QlQdDrgv95qxunJegDb'
const projectId = 9
const suiteId = 9

/**
 * Creates a new TestRail run and returns the run ID
 */
async function createRun() {
  const runName = `Cypress Automated Test Run - ${new Date().toLocaleString()}`
  const encodedAuth = Buffer.from(`${username}:${password}`).toString('base64')

  const runData = {
    suite_id: suiteId,
    name: runName,
    include_all: false,
  }

  try {
    const response = await fetch(`${testRailUrl}/index.php?/api/v2/add_run/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedAuth}`,
      },
      body: JSON.stringify(runData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create TestRail run: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log(`Created TestRail Run: ${result.id}`)
    return result.id
  } catch (err) {
    console.error('Error creating TestRail run:', err)
    throw err
  }
}
createRun()
