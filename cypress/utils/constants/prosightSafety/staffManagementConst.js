/**
 * This file consists of all constant related to UI/URL/ConfirmationMessages/ToastMessages checks
 */

export default {
  urlText: {
    smartLocation: 'smartLocation',
    smartCompliance: 'smartCompliance',
    staffManagement: 'staffManagement',
    staff_Assignment: 'staffAssignment',
    link: 'link',
    edit: 'edit',
    staff_Type: 'staffType',
    unlink: 'unlink',
    deviceMange: 'deviceManagement',
    admin: 'Admin',
    tag_Management: 'tagManagement',
    smartCompliance: 'smartCompliance',
  },
  toastMessages: {
    messageAfterStaffCreation: 'Staff Created Successfully',
    messageAfterLinkingTag: 'Linked Successfully',
    messageAfterUpdatingStaffDetails: 'Staff Information Updated Successfully',
    messageAfterUnlinkingTag: 'Unlinked Successfully',
    messageAfterDeletingStaff: 'Staff Deleted Successfully',
    messageAFterCreatingStaffType: 'Staff Type Created Successfully',
    messageAfterUpdatingStaffTypeDetails: 'Staff Type Updated Successfully',
    messageAfterDeletingStaffType: 'Staff Type Deleted Successfully',
    messageAFterDeletingTag: 'Tag Deleted Successfully',
    messageAfterBulkUpload: 'Staff Member(s) Created Successfully',
  },
  confirmationMessages: {
    confirmationBeforeLinkingTag: 'Staff was successfully created. Do you want to link a tag to the added staff?',
    confirmationMessageBeforeDeletingStaff:
      'Deleting a Staff Member will permanently remove all associated data from the System. This action cannot be undone.',
    confirmationMessageBeforeDeletingTagLinkedStaff:
      'This staff cannot be deleted as it is linked to a tag. Please unlink the staff before deleting it.',
    confirmationMessageBeforeDeletingStaffType:
      'Deleting a staff type will permanently remove all associated data from the System. This action cannot be undone',
    confirmationMessageBeforeDeletingTag: 'Deleting a Tag will permanently remove all associated data from the System. This action cannot be undone.',
    confirmationMessagesBeforeUnlinkingTag: (tagId, StaffName) =>
      `Unlinking Tag ${tagId} from ${StaffName} will stop tracking of the Staff. How do you wish to proceed?`,
    confirmationMessageBeforeDeletingStaffLinkedTag:
      'This tag cannot be deleted as it is linked to a staff. Please unlink the tag before deleting it.',
    confirmationMessageBeforeDeletingStaffAssociatedStaffType:
      'This staff type cannot be deleted as there are multiple staff associated with this staff type.',
  },
  uiText: {
    safety: 'safety',
    linked: 'Linked',
    unLinked: 'Unlinked',
    tags: 'Tags',
    staffType: 'staffType',
    staffManagement: 'Staff Management',
    tagManagement: 'Tag Management',
    staffTypes: 'Staff Type',
    staffs: 'Staff',
    handHygiene: 'handHygiene',
    hhStaff: 'hhStaff',
  },

  headerText: {
    staff: 'Staff',
    tags: 'Tags',
  },

  buttonInnerText: {
    staffManagementText: 'Staff Management',
    tagManagement: 'Tag Management',
    staffTypePage: 'Staff Type',
    staffAssignment: 'Staff Assignment',
    unlinkBtn: 'Unlink Tag',
    smartComplianceText: 'Smart Compliance',
  },
  errorMessagesForStaffAssignmentPage: {
    staffNameExistsErrMsg: 'Staff name already exists',
    staffIDExistsErrMsg: 'Staff ID already exists',
    invalidStaffNameErrMsg: 'Enter a valid Staff name',
    invalidStaffIDErrMsg: 'Enter a valid Staff ID',
    invalidEmailErrMsg: 'Enter a valid email address',
    invalidPhoneNumberErrMsg: 'Enter a valid 10-digit phone number',
  },
  errorMessagesForStaffTypePage: {
    staffTypeExistsErrMsg: 'Staff Type Already Exists',
    invalidStaffTypeNameErrMsg: 'Enter a valid staff type',
  },
  bulkImportConstants: {
    bulkImportTitle: 'Bulk Import Staff',
    staffBulkCsvPath: 'cypress/fixtures/prosightSafety/bulkUploadStaff.csv',
    csvFileName: 'prosightSafety/bulkUploadStaff.csv',
    bulkUploadTableTitleTxt: 'Bulk Create Staff',
    bulkUploadCsvTemplateTxt: 'Bulk Upload CSV Template',
  },
}
