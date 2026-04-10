const { defineConfig } = require('cypress')
const baseConfig = require('./cypress.config')

const e2eOverride = {
  //enter your own feature branch URL here
  baseUrl: process.env.FIREBASE_URL,
}
const envOverride = {
  API_BaseUrl: 'https://dev-cox-health-imagine-api.leverege.com/v1/',
  ProjectId: process.env.PROJECT_ID_DEV,
  SystemId: process.env.SYSTEM_ID_DEV,
  HospitalName: process.env.HOSPITAL_NAME_DEV,
  HospitalId: process.env.HOSPITAL_ID_DEV,
  BuildingName: process.env.BUILDING_NAME_DEV,
  BuildingId: process.env.BUILDING_ID_DEV,
  AssetBlueprintId: process.env.ASSET_BLUEPRINT_ID_DEV,
  StaffBlueprintId: process.env.STAFF_BLUEPRINT_ID_DEV,
}

module.exports = defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    ...e2eOverride,
  },
  env: {
    ...baseConfig.env,
    ...envOverride,
  },
})
