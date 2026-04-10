/**
 * This file consists of all constant related to UI/URL/ConfirmationMessages/ToastMessages checks for equipment management module
 */
export default {
  urlText: {
    smartMonitoring: 'smartMonitoring',
    equipment_Assignment: 'equipmentAssignment',
    link: 'link',
    admin: 'Admin',
    environment: 'environment',
    sensor_management: 'sensorManagement',
    equipment_Type: 'equipmentType',
  },
  uiText: {
    loadingLocations: 'Loading Locations',
    environment: 'environment',
    linked: 'Linked',
    unLinked: 'Unlinked',
    equipment: 'equipment',
    equipmentType: 'Equipment Type',
    linkedEquipmentType: 'linkedEquipmentType',
    sensor: 'sensor',
    loadingAssignedOwner: 'Loading Assigned Owner',
  },
  toastMessages: {
    messageAfterCreatingEquipment: 'Equipment Created Successfully',
    messageAfterLinkingSensor: 'Linked Successfully',
    messageAfterUpdatingEquipmentDetails: 'Equipment Details Updated Successfully',
    messageAfterUnlinkingSensor: 'Unlinked Successfully',
    messageAfterDeletingEquipment: 'Equipment Deleted Successfully',
    messageAfterCreatingEquipmentType: 'Equipment Type Created Successfully',
    messageAfterUpdatingEquipmentTypeDetails: 'Equipment Type Updated Successfully',
    messageAfterDeletingSensor: 'Sensor Deleted Successfully',
    messageAfterDeletingEquipmentType: 'Equipment Type Deleted Successfully',
    messageAfterCreatingEquipmentTypeWithSameName: 'Equipment Type Already Exists',
    messageAfterCreatingEquipmentWithSameName: 'Equipment name already exists',
    messageAfterCreatingEquipmentWithSameID: 'Equipment ID already exists',
    messageAfterMinTempExceedsMaxTemp: 'Min. Temperature should be less than Max. Temperature',
    messageAfterMaxTempExceedRange: 'Value outside of range',
    messageAfterBulkUpload: 'Equipment Created Successfully',
  },
  paneText: {
    messageUnlinkingSensor: (equipmentName, sensorName) =>
      `Unlinking Sensor ${sensorName} from ${equipmentName} will stop monitoring of the Equipment. How do you wish to proceed?`,
  },
  confirmationMessages: {
    confirmationMessagesBeforeSensorLink: 'Equipment was successfully created. Do you want to link a sensor to the added equipment?',
    confirmationMessagesBeforeUnlinkingAlertAssociatedEquipment: (equipmentName, id, sensorId) =>
      `${equipmentName} ${id} currently has 1 or more active alerts associated with Sensor ${sensorId}. Please resolve the issues in the Smart Alerts module to proceed with unlinking this tag.`,
    confirmationMessagesBeforeUnlinkingSensor: (sensorId, equipmentName) =>
      `Unlinking Sensor ${sensorId} from ${equipmentName} will stop monitoring of the Equipment. How do you wish to proceed?`,
    confirmationMessageBeforeDeletingSensorLinkedEquipment:
      'This equipment cannot be deleted as it is linked to a sensor and may have rules associated to it. Please unlink the equipment before deleting it.',
    confirmationMessageBeforeDeletingEquipment:
      'Deleting an Equipment will permanently remove all associated data from the System. This action cannot be undone.',
    confirmationMessageBeforeDeletingEquipmentType:
      'Deleting an equipment type will permanently remove it from the System. This action cannot be undone.',
    confirmationMessageBeforeDeletingALinkedEquipmentType:
      'This equipment type cannot be deleted as there are multiple equipment and/or rules associated with this equipment type.',
    confirmationMessageBeforeDeletingALinkedEquipmentType_Mobile:
      'This equipment type cannot be deleted as there are multiple equipment associated with this equipment type.',
    confirmationMessageBeforeDeletingSensor:
      'Deleting a Sensor will permanently remove all associated data from the System. This action cannot be undone.',
  },
  headerText: {
    equipment: 'Equipment',
    sensor: 'Sensors',
    environment: 'Environment',
  },
  actions: {
    link: 'link',
    unlink: 'unlink',
    create: 'create',
    edit: 'edit',
  },
  aliasText: {
    checkbox: 'checkbox',
    result_Row: 'resultRow',
    unlinkBtn: 'unlinkBtn',
    editButton: 'editBtn',
    delButton: 'delBtn',
    linkedTagRow: 'linkedTagRow',
  },
  deleteActions: {
    tableBtn: 'table',
    editMenu: 'editMenu',
    sidePanel: 'sidePanel',
  },
  fieldErrorMessage: {
    equipmentFieldErrorMessage: 'Enter a valid equipment type',
  },
  inputFieldError: {
    nameFieldErrorMessage: 'Enter a valid Equipment Name',
    EquipmentIDFieldErrorMessage: 'Enter a valid Equipment ID',
    minTempFieldErrorMessage: 'Min. Temperature should be less than Max. Temperature',
    maxTempFieldErrorMessage: 'Temperature value outside the allowed range.',
  },
  bulkImportConstants: {
    bulkImportTitle: 'Bulk Import Assets',
    equipmentBulkCsvPath: 'cypress/fixtures/prosightEnvironment/bulkUploadEquipment.csv',
    csvFileName: 'bulkUploadEquipment.csv',
  },
}
