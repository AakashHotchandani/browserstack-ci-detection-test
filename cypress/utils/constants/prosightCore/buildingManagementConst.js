export default {
  urlText: {
    overviewDashboard: 'overviewDashboard',
    hospitalManagementUrl: 'hospitals',
    subModules: {
      buildings: 'buildings',
    },
    create: 'create',
    edit: 'edit',
  },
  toastMessages: {
    messageAfterBuildingCreation: 'Building Created Successfully',
    messageAfterEditingBuilding: 'Building Details Updated Successfully',
    messageAfterDeletingBuilding: 'Building Deleted Successfully',
    messageAfterBuildingExisted: ' Building cannot be created',
  },
  feedbackMessages: {
    buildingNameAlreadyExists: 'Building Name Already Exists',
  },
  confirmationMessages: {
    buildingCannotBeDeleted:
      'The Building cannot be deleted as there are one or more floors and/or rules associated with it. In order to delete this building, remove all floors associated with it.',
    buildingDelete: 'Deleting a building will permanently remove it and all associated data from the System. This action cannot be undone.',
  },
  buildingWithFloors: 'LGMC',
  formsText: {
    hospitalDropdown: 'Select Facility',
    selectedHospital: 'Oschner Lafayette General',
    stateDropdown: 'Select State',
    stateTxt: 'State',
  },
  buttonsInnerText: {
    hospitalManagement: 'Facility Management',
    buildingsTab: 'Buildings',
    cancel: 'Cancel',
    delete: 'Delete',
    continue: 'Continue',
  },
}
