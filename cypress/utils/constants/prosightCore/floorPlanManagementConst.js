/**
 * This file consists of all constant related to UI/URL/ConfirmationMessages/ToastMessages checks
 */

export default {
  uiTexts: {
    geoJSONFile: 'floorPlan.geojson',
    updatedGeoJsonFile: 'floorPlanUpdated',
    drawBoundary: 'Draw Boundary',
    editBoundary: 'Edit Boundary',
    confirmLocation: 'Confirm Locations',
    drawOutline: 'Draw Outline',
    editOutline: 'Edit Outline',
    admin: 'admin',
    roomTypes: 'Room Types',
    rooms: 'Rooms',
  },
  urlText: {
    floorManagement: 'floorManagement',
    departmentManagement: 'departmentManagement',
    departmentBoundaryManagement: 'departmentBoundaryManagement',
    roomManagement: 'roomManagement',
    overviewDashboard: 'overviewDashboard',
    roomType: 'roomType',
    create: 'create',
    smartAlerts: 'smartAlerts',
    zoomSettings: 'zoomSettings',
    admin: 'Admin',
  },
  toastMessages: {
    messageAfterFloorCreation: 'Floor creation is being started. You will receive an email with the result.',
    messageAfterDeletingFloor: 'Floor Deleted Successfully',
    messageAfterEditingGeoJSONFile: 'File uploaded',
    messageAfterEditingFloorData: 'Floor update is being started. You will receive an email with the result.',
    messageAfterFloorCreationRoomNumber: 'Successfully Created 35 Room(s)',
    messageAfterDepartmentCreation: ' Department Created Successfully',
    messageAfterDeletingDepartMent: 'Department Deleted Successfully',
    messageAfterEditingDepartmentName: ' Department Details Updated Successfully',
    messageAfterCreatingDepartmentBoundary: ' Department Boundary Created Successfully',
    messageAfterDeletingDepartmentBoundary: 'Department Boundary Deleted',
    messageAfterCreatingDepartmentBoundary: ' Department Boundary Created Successfully',
    messageAfterEditingDepartmentBoundaryDetails: ' Department Boundary Details Updated Successfully',
    messageAfterRoomTypeCreation: 'Room Type Created Successfully',
    messageAfterEditingRoomTypeName: 'Room Type Details Updated Successfully',
    messageAfterDeletingRoomTypes: 'Room Type Deleted Successfully',
    messageAfterCreatingRoom: ' Room Created Successfully',
    messageAfterEditingRoomDetails: ' Room Details Updated Successfully',
    messageAfterDeletingRoomBoundary: 'Room Deleted Successfully',
  },
  confirmationMessages: {
    floorPlanReUploadConfirmation:
      'Uploading a new floorplan will erase an existing floorplan, including all Rooms and potential Department associations. This action cannot be undone.',
    deleteFloorConfirmation:
      'Deleting a Floor will permanently remove it from the System, along with all associated Rooms and potential Department Boundaries. This action cannot be undone.',
    deleteDepartmentBoundaryConfirmation:
      'Are you sure you wish to delete this department boundary? Related rooms will lose their department affiliations. This action cannot be undone.',
    deleteRoomTypeConfirmation: 'Deleting a room type will permanently remove all associated data from the System. This action cannot be undone.',
    deleteRoomBoundaryConfirmation: 'Deleting a room will remove it from the floorplan permanently. This action cannot be undone.',
    deleteRoomBoundaryConfirmation2:
      'Deleting a room may affect any associated Department Boundaries. Please check the Department Boundaries tab to ensure that any associations are up-to-date',
    deleteDepartmentConfirmation: 'Deleting a Department will permanently remove it from the System. This action cannot be undone.',
    deleteRulesLinkedRoomTypeConfirmation:
      'This room type cannot be deleted as there are multiple rooms and/or rules associated with this room type.',
  },
  logMessages: {
    noResult: 'Search result not found',
  },
  geoJSONFilePath: 'cypress/fixtures/prosightCore/floorPlan.geojson',
  updatedJSONFilePath: 'cypress/fixtures/prosightCore/floorPlanUpdated.geojson',
  deleteAction: {
    editMenu: 'editMenu',
    tableDel: 'tableDel',
  },
  page:{
    rooms : "Rooms",
    departmentBoundary:"Department Boundary"
  }
}
