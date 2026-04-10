/**
 *This object consists of different constant data related to ISDR smart rules
 */
export default {
  staffRuleTypes: {
    tagButton: 'Tag Button Programming'
  },

  staffAlertTypes: {
    emergencyHelp: 'Staff Emergency Alert',
    nurseCall: 'Nurse Call',
    generalHelp: 'General Help',
  },
  toastMessages: {
    messageAfterRuleDeleted: 'Rule Deleted Successfully',
    messageAfterRuleUpdated: 'Rule Updated Successfully',
    messageAfterRuleCreated: 'Rule Created Successfully',
    messageAfterSavingEscalationsSetup: 'Escalation Setup Updated Successfully',
  },

  confirmationMessages: {
    confirmationMessageBeforeDelete: 'Deleting a rule will permanently remove it from the System. This action cannot be undone.',
  },

  warningText: 'You need to select at least one State within Rule Criteria to proceed with creating this rule',

  orderingRuleCriteria: {
    assetStatus: 'Asset Status',
    assetUtilizationState: 'Asset Utilization State',
    assetShrinkageState: 'Asset Shrinkage State',
    shrinkageState: 'Shrinkage State',
    shrinkageWindow: 'Shrinkage Window',
    orderingLocation: 'Location (Optional)',
  },

  buttonsInnerText: {
    smartRules: 'Rules',
    escalations: 'Escalations',
    alertRules: 'Alert Rules',
    ordering: 'Ordering',
    operations: 'ProPAR Rules',
    assetType: 'Asset Type',
  },

  urls: {
    smartLocation: 'smartLocation',
    smartRules: 'smartRules',
    alerts: 'alerts',
    escalations: 'escalations',
    operations: 'operations',
    ordering: 'ordering',
  },

  escalationTypes: {
    primary: 'Primary Escalation',
    secondary: 'Secondary Escalation',
    tertiary: 'Tertiary Escalation',
  },

  deleteActions: {
    tableBtn: 'table',
    editMenu: 'editMenu',
    sidePanel: 'sidePanel',
  },

  titles: {
    environment: 'Environment Rules',
  },
  verificationData: {
    verifyCreatedValue: 'Verify Created Value',
    verifyEditedValue: 'Verify Edited Value',
  },
  defaultTimeStamp: '5 mins',
}
