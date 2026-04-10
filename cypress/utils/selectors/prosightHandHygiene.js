/**
 * This consists of Hand hygiene selectors
 */
export default {
  resultRowCell: 'div[class*="lev-sc-bodyCell cell"]',
  confirmationPopupText: 'div[class*="lev-sc-text-dialogMessage"]',
  sidePanel: 'div[class*="lev-sc-pane-detailCardContent"]',

  staffAssignment: {
    addNewStaffBtn: 'button[title="Create Staff Member"]',
    confirmationPopup: 'div[class*="lev-sc-text-dialogMessage"]',
    resultRowInMobile: "div[class*='listItemContent']",
  },

  smartReports: {
    labelComplianceLevel: 'label:contains("Compliance Level")',
    labelPerformanceLevel: 'label:contains("Performance Level")',
    labelAssignedDepartment: 'label:contains("Assigned Department")',
    labelStaffType: 'label:contains("Staff Type")',
    addReportsButton: 'button[class*="cypress-compliance.smartreports"]',
    reportTypeDropDownContainer: 'div[class*="cypress-compliance.smartreports"]',
  },

  smartAlerts: {
    createTaskButtonOnSidePanel: 'button[class *= createTaskCompliance]',
  },
}
