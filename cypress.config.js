const { defineConfig } = require('cypress')
const { verifyDownloadTasks } = require('cy-verify-downloads')
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const axios = require('axios')
let allresults = []
module.exports = defineConfig({
  projectId: 'x8us8p',
  viewportWidth: 1880,
  viewportHeight: 1000,
  defaultCommandTimeout: 150000,
  includeShadowDom: true,
  watchForFileChanges: true,
  reporter: 'cypress-mochawesome-reporter',
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 0,
  video: true,
  retries: 0,
  reporterOptions: {
    charts: true,
    reportDir: 'cypress/report',
    reportPageTitle: 'Regression Tests',
    videoOnFailOnly: false,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  e2e: {
    screenshotOnRunFailure: true,
    pageLoadTimeout: 120000,
    experimentalRunAllSpecs: false,
    experimentalWebKitSupport: false,
    baseUrl: 'https://stg-cognosos.web.app/',
    setupNodeEvents(on, config) {
      let authToken

      // Generic tasks for auth token
      on('task', {
        setAuthToken(token) {
          authToken = token
          return null
        },
        getAuthToken() {
          return authToken || null
        },
      })

      // Verify downloads task
      on('task', verifyDownloadTasks)

      // // Mochawesome reporter plugin
      // require('cypress-mochawesome-reporter/plugin')(on)

      // Cypress grep plugin
      require('@cypress/grep/src/plugin')(config)

      return config
    },
  },
  env: {
    grepFilterSpecs: true,
    snapshotOnly: true,
    API_BaseUrl: 'https://stg-cox-health-imagine-api.leverege.com/v1/',
    ProjectId: process.env.PROJECT_ID_STAGE,
    SystemId: process.env.SYSTEM_ID_STAGE,
    HospitalName: process.env.HOSPITAL_NAME_STAGE,
    HospitalId: process.env.HOSPITAL_ID_STAGE,
    BuildingName: process.env.BUILDING_NAME_STAGE,
    BuildingId: process.env.BUILDING_ID_STAGE,
    AssetBlueprintId: process.env.ASSET_BLUEPRINT_ID_STAGE,
    StaffBlueprintId: process.env.STAFF_BLUEPRINT_ID_STAGE,
    EnvironmentBlueprintId: process.env.ENVIRONMENT_BLUEPRINT_ID_STAGE,
    API_Key: process.env.API_KEY_STAGE,
    Secret: process.env.SECRET_STAGE,
    MAILOSAUR_API_KEY: process.env.MAILOSAUR_API_KEY,
    MAILOSAUR_SERVER_ID: process.env.MAILOSAUR_SERVER_ID,
    EmailAddress: 'automation@9pjxckqc.mailosaur.net',
    userRoleDeviceID: process.env.Safety_Technician_Device_ID,
  },
})
