/**
 * This file consists of all constant related Smart Location - ISDR
 */

export default {
    dataOptions: {
        isdr: 'isdr',
        other: 'Other',
        generalAlert: 'general',
        emergencyAlert: 'emergency'
    },
    paneTxt: {
        acknowledge: 'Acknowledging an Alert transitions it into an Event. Events log can be viewed in Events table.', // Needed to change when bug is fixed
        clear: 'Clearing an Alert will permanently remove it from the System. This action cannot be undone.',
        escalate: 'Escalating an alert notifies additional personnel.',
        otherOption: 'Other',
        helpOption: 'I need additional help',
        awayOption: 'I am away from the facility',
        acknowledgeMessageInStaffAlert: 'Acknowledging an Alert transitions it into an Event. You can view them in Events table.'
    },
    buttonInnerTxt: {
        acknowledge: 'Acknowledge',
        smartAlerts: 'Smart Alerts',
        events: 'Events',
        smartLocation: 'Smart Location'
    },
    toastMessages: {
        escalated: 'Alert Escalated Successfully',
        acknowledged: 'Alert Acknowledged Successfully',
        cleared: 'Alert Cleared Successfully'
    },
    comment: 'Testing acknowledge function',
    urlText: {
        smartLocation: "smartLocation"
    }

}