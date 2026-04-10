/**
 * This file consists of all constant related to smart report module
 */

export default {
  urlTxt: {
    smartReports: 'smartReports',
    scheduledReports: 'scheduledReports',
    safety: 'safety',
    smartLocation: 'smartLocation',
    reports: 'reports',
  },
  buttonInnerTxt: {
    emergencyReport: 'Staff Emergency Alerts Report',
    nonEmergencyReport: 'Non-Emergency Alerts Report',
    multiple: 'Multiple',
    selectAll: 'Select All',
    selectAssignedDepartment: 'Select Assigned Department',
    last7Days: 'Last 7 Days',
    smartReports: 'Reports',
    scheduledReports: 'Scheduled Reports',
  },

  requestBodyForReportResetAPI: [
    {
      op: 'replace',
      path: 'metadata',
      value: {
        allowedApplications: ['core', 'assets', 'environment', 'safety'],
        timeZone: 'America/Los_Angeles',
      },
    },
  ],
}
