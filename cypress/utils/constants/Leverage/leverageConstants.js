export default {
  alertTypeIds: {
    staffTagOffline: 'staffTagOffline',
    assetsTagOffline: 'assetTagOffline',
    assetShrinkage: 'shrinkageMsg',
    maintenanceDue: 'Maintenance Due',
    rentalDue: 'Rental Due',
    parAlert: 'parLevelStatusTransition',
    sensorLowBattery: 'equipmentSensorBattery',
    sensorOffline: 'Sensor Offline',
    sensorReportOverdue: 'sensorReportOverdue',
  },
  failOnStatusCode: false,
  requestMethod: {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    delete: 'Delete',
    patch: 'PATCH',
  },
  type: 'publishTopic',
  sonicuTopic: 'cognosos-ingestor',
  topic: 'prosightRulesActions',
  triggerScript: 'Trigger Script',
  scriptIds: {
    sensorReportOverdue: '2vqU4B86H0YZN5FehmGQf5',
  },
  targetFunction: 'run',
  moveTagToLocationType: 'hid-ingestion',
  delay: 1,
  timerType: 'once',
  timerName: 'Automation Timer test',
  staffSearchConstants: {
    limit: 100,
    offset: 0,
    type: 'logical',
    operator: 'and',
    conditionType: 'equals',
    field: 'data/name',
    empty: false,
    fieldType: 'string',
    sortField: 'created',
    order: 'desc',
    nextToken: null,
  },
  alertMessage: 'simpleAlertMsg',

  alertTypes: {
    assetAlertTypes: {
      tagAlerts: {
        tagOffline: 'Tag Offline',
        tagLowBattery: 'Tag Low Battery'
      },
      assetAlerts: {
        maintenanceDue: 'Maintenance Due',
        shrinkage: 'Asset Exited Building',
        rentalDue: 'Rental Due',
      },
      parAlerts: {
        criticallyUnderPAR: 'Critically Under PAR',
        underPar: 'Under PAR',
        stockedOut: 'Stocked Out',
      },
    },
    staffAlertTypes: {
      nonEmergencyAlert: {
        staffTagOffline: 'Tag Offline',
        tagLowBattery: 'Tag Low Battery'
      },
      emergencyAlert: {
        staffEmergency: 'Staff Emergency',
      },
    },
    environmentalAlerts: {
      sensorLowBattery: 'Sensor Low Battery',
      sensorOffline: 'Sensor Offline',
      inspectionOverdue: 'Inspection Overdue',
      calibrationDue: {
        calibrationDueIn5Days: 'Calibration Due in 5 days',
        calibrationDueIn10Days: 'Calibration Due in 10 days',
        calibrationDueIn30Days: 'Calibration Due in 30 days',
        calibrationDueIn60Days: 'Calibration Due in 60 days',
      },
      equipmentRentalDue: 'Rental Due',
      humidityOutOfRange: 'Humidity Out of Range',
      temperatureOutOfRange: 'Temperature Out of Range',
      temperatureWarning: 'Temperature Warning',
    },
  },

  messageType: 'simpleAlertMsg',
  templateId: {
    maintenanceDue: '@assetMaintenanceDueDate',
    rentalDue: '@assetRentalDueDate',
    sensorLowBattery: '@equipmentSensorLowBattery',
    calibrationDue: '@equipmentCalibrationDueDate',
    equipmentRentalDue: '@equipmentRentalDueDate',
    sensorOffline: '@sensorOfflineAlert',
  },
  objectTypes: {
    asset: 'asset',
    equipment: 'equipment',
    sensor: 'sensor',
    tag: 'tag',
    staff: 'staff',
    incident: 'incident',
    room: 'room',
    departments: 'department',
    buildings: 'building',
    floors: 'floor',
    hospital: 'hospital',
    user: 'user',
    hhSensor: 'hhSensor',
    user: 'user',
    gateway: 'gateway',
  },
  application: {
    asset: 'assets',
    environment: 'environment',
    safety: 'safety',
  },
  deviceLocation: {
    building: {
      id: '0EFlqEU049bQWxOnfcNPAj',
      name: 'LGMC',
    },
    department: {
      id: '3LkHxSkKhYebE96hXh6JIk',
      name: '10th Floor Main Tower',
    },
    floor: {
      id: '3SmoPlg0WthScqmnGqcUmz',
      name: '10',
    },
    room: {
      id: '2jP0vDHKfe1ZxgFCwMUdF1',
      name: 'Soiled Holding 125',
    },
  },
  parValues: {
    originalCountForCriticalUnderParAlert: 4,
    originalCountForUnderParAlert: 6,
    originalCountForStockedOutAlert: 0,
  },
  timestamps: {
    twoDaysAgo: 'beforeTwoDays',
    currentTime: 'timeNow',
  },
}
