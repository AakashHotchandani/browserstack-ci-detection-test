/// <reference types="cypress" />
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const testrailAPI = {
  getTestCasesForRun: async (runId) => {
    const testRailUrl = 'https://cognosos.testrail.io'
    const auth = {
      username: 'Chinmayee.s@cognosos.com',
      password: '4Kt8zyQaJDicAJ/Zq9k0-/QlQdDrgv95qxunJegDb',
    }
    let allTestCases = []
    let offset = 0
    const limit = 250
    const delay = 500

    try {
      while (true) {
        const response = await axios.get(`${testRailUrl}/index.php?/api/v2/get_tests/${runId}`, {
          auth,
          timeout: 60000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          params: {
            offset: offset,
            limit: limit,
          },
        })
        console.log(`Fetched ${response}`)
        const tests = response.data.tests || []
        const testCaseIds = tests.map((test) => test.case_id)
        allTestCases.push(...testCaseIds)

        // Check if we've retrieved all tests
        if (tests.length < limit) {
          break
        }

        // Update offset for next iteration
        offset += limit

        // Implement delay before next request
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      return allTestCases
    } catch (error) {
      console.error(`Failed to fetch test cases for run ID ${runId}:`, error)
      throw error
    }
  },

  addTestCasesToRun: async (runId, caseIds) => {
    const testRailUrl = 'https://cognosos.testrail.io'
    const auth = {
      username: 'Chinmayee.s@cognosos.com',
      password: '4Kt8zyQaJDicAJ/Zq9k0-/QlQdDrgv95qxunJegDb',
    }

    try {
      // Step 1: Get the current list of case_ids in this run
      const runResponse = await axios.get(`${testRailUrl}/index.php?/api/v2/get_run/${runId}`, { auth })
      const existingCaseIds = runResponse.data.case_ids || []

      // Step 2: Merge existing + new (unique IDs only)
      const mergedCaseIds = Array.from(new Set([...existingCaseIds, ...caseIds]))

      // Step 3: Update run with merged case IDs
      const requestData = {
        case_ids: mergedCaseIds,
        include_all: false,
      }

      const response = await axios.post(`${testRailUrl}/index.php?/api/v2/update_run/${runId}`, requestData, {
        auth,
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })

      return response.data
    } catch (error) {
      console.error('Error merging and adding test cases:', error?.response?.data || error.message)
    }
  },
  updateTestCaseResult: async (runId, results) => {
    const testRailUrl = 'https://cognosos.testrail.io'
    const auth = {
      username: 'Chinmayee.s@cognosos.com',
      password: '4Kt8zyQaJDicAJ/Zq9k0-/QlQdDrgv95qxunJegDb',
    }

    const requestData = {
      results,
    }

    try {
      const response = await axios.post(`${testRailUrl}/index.php?/api/v2/add_results_for_cases/${runId}`, requestData, {
        auth,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
      return response.data
    } catch (error) {
      console.error(`Failed to update TestRail case ${results}:`, error)
    }
  },

  uploadScreenshotToTestRail: async (runId, caseId, screenshotPath) => {
    const testRailUrl = 'https://cognosos.testrail.io'
    const auth = {
      username: 'Chinmayee.s@cognosos.com',
      password: '4Kt8zyQaJDicAJ/Zq9k0-/QlQdDrgv95qxunJegDb',
    }

    try {
      const existingCases = await testrailAPI.getTestCasesForRun(runId)
      if (!existingCases.includes(Number(caseId))) {
        console.warn(`Case ${caseId} is not part of run ${runId}, skipping screenshot upload.`)
        return
      }

      const screenshotBuffer = fs.readFileSync(screenshotPath)
      const screenshotFileName = path.basename(screenshotPath)
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2)
      const eol = '\r\n'
      const multipartBody = Buffer.concat([
        Buffer.from(`--${boundary}${eol}`),
        Buffer.from(`Content-Disposition: form-data; name="attachment"; filename="${screenshotFileName}"${eol}`),
        Buffer.from(`Content-Type: image/png${eol}${eol}`),
        screenshotBuffer,
        Buffer.from(`${eol}--${boundary}--${eol}`),
      ])
      const headers = {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartBody.length,
      }

      // Only fetch results if case exists
      const response = await axios.get(`${testRailUrl}/index.php?/api/v2/get_results_for_case/${runId}/${caseId}`, { auth })
      const results = response.data.results
      if (!results || results.length === 0) {
        console.warn(`No results found for case ${caseId} in run ${runId}, skipping screenshot upload.`)
        return
      }

      const resultId = results[0].id

      await axios.post(`${testRailUrl}/index.php?/api/v2/add_attachment_to_result/${resultId}`, multipartBody, {
        auth,
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
      console.log(`Uploaded screenshot for case ${caseId}`)
    } catch (error) {
      console.error(`Failed to upload screenshot for case ${caseId}:`, error.message)
    }
  },

  addMissingTestsToRun: async (runId, presentTests) => {
    const existingCaseIds = await testrailAPI.getTestCasesForRun(runId)
    const combinedCaseIds = Array.from(new Set([...existingCaseIds, ...presentTests]))
    await testrailAPI.addTestCasesToRun(runId, combinedCaseIds)
  },

  uploadMultipleScreenShots: async (runId, caseIds, screenshot) => {
    await Promise.all(caseIds.map((id) => testrailAPI.uploadScreenshotToTestRail(runId, id, screenshot)))
  },
}

module.exports = testrailAPI
