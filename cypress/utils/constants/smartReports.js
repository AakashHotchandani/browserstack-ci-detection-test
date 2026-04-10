/**
 * This file consists of all constant related to smart report module
 */

export default {
  buttonInnerTxt: {
    smartReports: 'Reports',
    reports: 'Reports',
    sendReport: 'Send Report',
    scheduleReport: 'Schedule Report',
    scheduledReports: 'Scheduled Reports',
    selectAssignedDepartment: 'Select Assigned Department',
    previewReport: 'Preview Report',
    last7Days: 'Last 7 Days',
    next7days: 'Next 7 Days',
    last30Days: 'Last 30 Days',
  },

  reportScheduleType: ['One-Time Report', 'Recurring Report'],

  urlTxt: {
    smartReports: 'smartReports',
    reports: 'reports',
    create: 'create',
    edit: 'edit',
    scheduledReports: 'scheduledReports',
    assets: 'assets',
    safety: 'safety',
    smartLocation: 'smartLocation',
  },

  toastMessages: {
    reportCreated: 'Report Sent Successfully',
    reportScheduled: 'Report Scheduled Successfully',
    reportEdited: 'Report Schedule Updated Successfully',
    reportDeleted: 'Report Schedule Deleted Successfully',
  },

  headers: {
    sendReportAt: 'Send Report At',
    sendReportOn: 'Send Report On',
  },

  actionType: {
    sidePanel: 'sidePanel',
    default: 'table',
    fromEdit: 'fromEdit',
    sendNow: 'Send Now',
    sendLater: 'Send Later',
    edit: 'edit',
    oneTimeReport: 'One-Time Report',
    recurringReport: 'Recurring Report',
    fromScheduledReports: 'fromSchedulePage',
    semiDelete: 'semiDelete',
    selectAll: 'Select All',
  },

  paneText: {
    deleteReport:
      'Deleting a schedule will permanently remove all associated data from the System and no future reports will be sent out related to this schedule. This action cannot be undone.',
  },

  dataOptions: {
    assets: 'iap',
    safety: 'ISDR',
    environment: 'IEM',
    handHygiene: 'HH',
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

  emailTemplates: {
    reportTypes: 'Report Type',
    department: 'Department(s)',
    date: 'Date Range',
  },
}
