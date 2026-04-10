export default {
  urlText: {
    overviewDashboard: 'overviewDashboard',
    userManagement: 'userManagement',
    subModules: {
      permissioning: 'permissioning',
      users: 'users',
      oidc: 'oidc'
    },
    create: 'create',
    edit: 'users/edit'
  },
  toastMessages: {
    messageAfterUserCreation: 'User Created Successfully',
    messageAfterEditingUser: 'User Details Updated Successfully',
    messageAfterDeletingUser: 'User Deleted Successfully',
    invitationSent: 'Invitation Sent'
  },
  confirmationMessages: {
    confirmPermissioningChange: 'This user access to Applications and Modules may change in accordance with the rules outlined in the Permissioning page of this module.',
    deleteUserConfirmation: 'Deleting a user will permanently remove all associated data from the System, and the user will lose access to all the applications. This action cannot be undone.'
  },
  buttonsInnerText: {
    createUser: 'Create User',
    userManagement: 'User Management',
    permissioning: 'Permissioning',
    users: 'Users',
    oidc: 'OIDC',
    apply: 'Apply',
    clearAll: 'Clear All',
    userRole: 'User Role',
    department: 'Department',
    applications: 'Applications',
    lastLogin: 'Last Login',
    userStatus: 'User Status',
    previewButton: 'Preview',
    completeCreation: 'Complete Creation',
    sendEmailInvite: 'Send Email Invite',
    uploadButton: 'Upload',
    completeCreation: 'Complete Creation'
  },
  endpoints: {
    users: '/v1/system/*/device/*/srv/prosightBypass/users'
  },
  submodules: {
    permissioning: 'permissioning',
    users: 'users'
  },
  deleteActionType: {
    sidePanel: 'sidePanel',
    default: 'default'
  },
  editActionType: {
    sidePanel: 'sidePanel',
    default: 'default'
  },
  keyNameOfTestData: {
    role: 'role',
    dep: 'department',
    app: 'app',
    uStatus: 'uStatus',
    lastLog: 'lastlog'
  },
  removeActionType: {
    mainFilterPill: 'mainFilterPill',
    secondaryFilterPill: 'secondaryFilterPill'
  },
  paths: {
    usersBulkCsv: 'cypress/fixtures/prosightCore/usersBulk.csv'
  },
  textInRows: {
    successBulk: 'Upload Successful',
    totalUsersInBulk: 'Successfully Created (1)',
  },
  apps: {
    assets: 'assets',
    core: 'core',
    environment: 'environment',
    safety: 'safety'
  },
  pageTitle: {
    OIDCConnection: 'OIDC Connection',
  }

}
