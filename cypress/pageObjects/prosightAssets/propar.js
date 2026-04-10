import proparSelectors from '../../utils/selectors/prosightAssets'
const {
  parLevelStatusButton,
  departmentButton,
  roomTypeButton,
  favoritesContainer,
  favoritesContentArea,
  tileCardView,
  showDetails,
  proParassetTypes,
  wrongIcon,
  graphIcon,
  assetTypeInGraph,
} = proparSelectors.proPar
import proparData from '../../fixtures/prosightAssets/propar.json'
import leverageConstants from '../../utils/constants/Leverage/leverageConstants'
import Asset_API from './assetSmartAlerts'
import smartAlertsUsingAPI from '../prosightCore/triggeringAlerts'
import HelperFunction from '../../utils/helpers/crossModuleFunctions'
import SmartRules from '../prosightAssets/smartRule'

let currentTestData = []
export default class Propar {
  static tileViewValidation = (rule, status) => {
    const { roomTypeName, floorName, department, assetType } = rule

    if (status === proparData.status['Critically Below PAR']) {
      cy.get(parLevelStatusButton)
        .click()
        .then(() => {
          cy.contains(proparData.status['Critically Below PAR']).click()
        })
    } else if (status === proparData.status['Under PAR']) {
      cy.get(parLevelStatusButton)
        .click()
        .then(() => {
          cy.contains(proparData.status['Under PAR']).click()
        })
    } else if (status === proparData.status['Within PAR']) {
      cy.get(parLevelStatusButton)
        .click()
        .then(() => {
          cy.contains(proparData.status['Within PAR']).click()
        })
    } else if (status === proparData.status['Over PAR']) {
      cy.get(parLevelStatusButton)
        .click()
        .then(() => {
          cy.contains(proparData.status['Over PAR']).click()
        })
    } else if (status === proparData.status['Soiled Storage - Full Level']) {
      cy.get(parLevelStatusButton)
        .click()
        .then(() => {
          cy.contains(proparData.status['Soiled Storage - Full Level']).click()
        })
    } else if (status === proparData.status['Soiled Storage - Warning Level']) {
      cy.get(parLevelStatusButton)
        .click()
        .then(() => {
          cy.contains(proparData.status['Soiled Storage - Warning Level']).click()
        })
    } else if (status === proparData.status['Soiled Storage - Within PAR']) {
      cy.get(parLevelStatusButton)
        .click()
        .then(() => {
          cy.contains(proparData.status['Soiled Storage - Within PAR']).click()
        })
    }
    cy.get(departmentButton)
      .click()
      .then(() => {
        cy.contains(department).click()
        cy.contains('Apply').click()
      })
    cy.get(roomTypeButton)
      .click()
      .then(() => {
        cy.get('label').contains(roomTypeName).click()
        cy.contains('Apply').click()
      })
    cy.get(favoritesContainer).contains('BRACC').click()
    cy.get(favoritesContentArea).within(() => {
      cy.get(tileCardView).filter(`:contains(${department})`).first().as('selectedTile') // save alias
    })

    cy.get('@selectedTile')
      .invoke('text')
      .then((text) => {
        expect(text).to.contain(floorName)
        expect(text).to.contain(department)
        expect(text).to.contain(roomTypeName)
      })

    cy.get('@selectedTile').find(showDetails).click()

    cy.get(proParassetTypes)
      .invoke('text')
      .then((text) => {
        const normalized = text.replace(/\s+/g, '')
        expect(normalized).to.contain(assetType)

        if (status === proparData.status['Critically Below PAR']) {
          expect(normalized).to.contain(`${rule.verifyDetailsCUnderPAR.replenish}`)
        } else if (status === proparData.status['Under PAR']) {
          expect(normalized).to.contain(`${rule.verifyDetailsUnderPAR.replenish}`)
        } else if (status === proparData.status['Within PAR']) {
          expect(normalized).to.contain(`${rule.verifyDetailsWithinPAR.replenish}`)
        } else if (status === proparData.status['Over PAR']) {
          expect(normalized).to.contain(`${rule.verifyDetailsOverPAR.replenish}`)
        } else if (status === proparData.status['Soiled Storage - Full Level']) {
          expect(normalized).to.contain(`${rule.verifyRuleDataWithStatusFullLevelPAR.Available}`)
        } else if (status === proparData.status['Soiled Storage - Warning Level']) {
          expect(normalized).to.contain(`${rule.verifyRuleDataWithStatusWarningPAR.Available}`)
        } else if (status === proparData.status['withinPAR']) {
          expect(normalized).to.contain(`${rule.verifyRuleDataWithStatusWithinPAR.Available}`)
        }
      })

    cy.get(wrongIcon).click()
  }
  static tileViewGraphValidation = (rule, status) => {
    cy.get(graphIcon).click()
    cy.get(assetTypeInGraph)
      .invoke('text')
      .then((text) => {
        const normalized = text.replace(/\s+/g, '')
        expect(normalized).to.contain(rule.assetType)

        if (status === proparData.status['Critically Below PAR']) {
          expect(normalized).to.contain(`${rule.criticallyUnderParValue}/${rule.parLevelThreshold}`)
        } else if (status === proparData.status['Under PAR']) {
          expect(normalized).to.contain(`${rule.underParValue}/${rule.parLevelThreshold}`)
        } else if (status === proparData.status['Within PAR']) {
          expect(normalized).to.contain(`${rule.parLevelThreshold}/${rule.parLevelThreshold}`)
        } else if (status === proparData.status['Over PAR']) {
          expect(normalized).to.contain(`${rule.overParValue}/${rule.parLevelThreshold}`)
        } else if (status === proparData.status['Soiled Storage - Full Level']) {
          expect(normalized).to.contain(`${rule.overParValue}/${rule.parLevelThreshold}`)
        } else if (status === proparData.status['Soiled Storage - Warning Level']) {
          expect(normalized).to.contain(`${rule.parLevelThreshold}/${rule.parLevelThreshold}`)
        } else if (status === proparData.status['withinPAR']) {
          expect(normalized).to.contain(`${rule.soiledWithinPAR}/${rule.parLevelThreshold}`)
        }
      })
    cy.contains('Alert Notifications').click()
    cy.url().should('include', 'alertSubscriptions')
    cy.go('back')
    cy.contains('Manage Asset Levels').click()
    cy.url().should('include', 'propar')
  }
  static proparValidation = (status) => {
    if (status === proparData.status['Critically Below PAR']) {
      HelperFunction.search(proparData.assetDetails4.assetType)
      HelperFunction.verifyValuesExist(
        `div[role='row']:has(div[role='cell']:contains("${proparData.assetDetails3.assetType}"))`,
        proparData.verifyDetailsCUnderPAR
      )
    } else if (status === proparData.status['Under PAR']) {
      HelperFunction.search(proparData.assetDetails4.assetType)
      HelperFunction.verifyValuesExist(
        `div[role='row']:has(div[role='cell']:contains("${proparData.assetDetails3.assetType}"))`,
        proparData.verifyDetailsUnderPAR
      )
    } else if (status === proparData.status['Within PAR']) {
      HelperFunction.search(proparData.assetDetails4.assetType)
      HelperFunction.verifyValuesExist(
        `div[role='row']:has(div[role='cell']:contains("${proparData.assetDetails3.assetType}"))`,
        proparData.verifyDetailsWithinPAR
      )
    } else if (status === proparData.status['Over PAR']) {
      HelperFunction.search(proparData.assetDetails4.assetType)
      HelperFunction.verifyValuesExist(
        `div[role='row']:has(div[role='cell']:contains("${proparData.assetDetails4.assetType}"))`,
        proparData.verifyDetailsOverPAR
      )
    } else if (status === proparData.status['Stocked Out']) {
      HelperFunction.search(proparData.assetDetails4.assetType)
      HelperFunction.verifyValuesExist(
        `div[role='row']:has(div[role='cell']:contains(${proparData.assetDetails3.assetType}))`,
        proparData.verifyDetailsStockedOut
      )
    } else if (status === proparData.status['Soiled Storage - Full Level']) {
      HelperFunction.search(proparData.soiledStorageDetails.assetDetails1.assetType)
      HelperFunction.verifyValuesExist(
        `div[role='row']:has(div[role='cell']:contains(${proparData.soiledStorageDetails.assetDetails1.assetType}))`,
        proparData.soiledStorageDetails.verifyDetailsfulllevelPAR
      )
    } else if (status === proparData.status['Soiled Storage - Warning Level']) {
      HelperFunction.search(proparData.soiledStorageDetails.assetDetails1.assetType)
      HelperFunction.verifyValuesExist(
        `div[role='row']:has(div[role='cell']:contains(${proparData.soiledStorageDetails.assetDetails1.assetType}))`,
        proparData.soiledStorageDetails.verifyDetailswarningevelPAR
      )
    } else if (status === proparData.status['withinPAR']) {
      HelperFunction.search(proparData.soiledStorageDetails.assetDetails1.assetType)
      HelperFunction.verifyValuesExist(
        `div[role='row']:has(div[role='cell']:contains(${proparData.soiledStorageDetails.assetDetails1.assetType}))`,
        proparData.soiledStorageDetails.verifyDetailsSoiledWithinPAR
      )
    }
  }
  static dataCreationforEachStatus = (loopData) => {
    loopData.forEach(({ assetData, tagData }) => {
      // console.log(assetData, tagData)
      Asset_API.createAsset(assetData)
      smartAlertsUsingAPI.createTags(tagData)
      smartAlertsUsingAPI.updateDateinTag(tagData)
      HelperFunction.linkSensor_Tag_API(assetData.assetName, leverageConstants.objectTypes.asset, tagData.deviceId)
    })
  }
  static dataDeletionforEachStatus = (loopData) => {
    if (loopData.length > 0) {
      loopData.forEach(({ assetData }) => {
        HelperFunction.unlinkTag_Sensor_API(assetData.assetName, leverageConstants.objectTypes.asset)

        //Deleting Tag
        HelperFunction.deleteItem_API(assetData.deviceId, leverageConstants.objectTypes.tag)

        //Deleting staff
        HelperFunction.deleteItem_API(assetData.assetName, leverageConstants.objectTypes.asset)
      })
    }
  }
}
