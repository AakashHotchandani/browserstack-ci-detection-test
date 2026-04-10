// For UserManagement / Permissioning module
import globalSels from "./globalSels"
export const checkboxSelector = globalSels.checkbox

/**
 * Represents a submodule (smartAlerts,accountSettings...) selector.
 * @class
 */
class SubModuleSelector {
  /**
   * Creates a new SubModuleSelector instance.
   * @static
   * @param {number} index - The index of the submodule checkbox.
   * @returns {SubModuleSelector} - A new instance of SubModuleSelector.
   */
  static create(index) {
    return new SubModuleSelector(index, checkboxSelector);
  }
  /**
   * Initializes a new instance of the SubModuleSelector class.
   * @constructor
   * @param {number} index - The index of the submodule checkbox.
   * @param {string} selector - The general selector for the submodules (checkboxSelector).
   */
  constructor(index, selector) {
    this.index = index;
    this.selector = selector;
  }
}

export const prosightModules = {
  assets: {
    index: 0,
    accountSettings: SubModuleSelector.create(0),
    assetManagement: SubModuleSelector.create(1),
    overviewDashboard: SubModuleSelector.create(2),
    smartAlerts: SubModuleSelector.create(3),
    smartLocation: SubModuleSelector.create(4),
    smartOperations: SubModuleSelector.create(5),
    smartOrdering: SubModuleSelector.create(6),
    smartReports: SubModuleSelector.create(7),
    smartRules: SubModuleSelector.create(8),
  },
  core: {
    index: 1,
    accountSettings: SubModuleSelector.create(0),
    overviewDashboard: SubModuleSelector.create(1),
    smartAlerts: SubModuleSelector.create(2),
    hospitalManagement: SubModuleSelector.create(3),
    floorPlanManagement: SubModuleSelector.create(4),
    userManagement: SubModuleSelector.create(5),
    deviceManagement: SubModuleSelector.create(6),
    setupWizard: SubModuleSelector.create(7),
  },
  environment: {
    index: 2,
    accountSettings: SubModuleSelector.create(0),
    equipmentManagement: SubModuleSelector.create(1),
    overviewDashboard: SubModuleSelector.create(2),
    smartAlerts: SubModuleSelector.create(3),
    smartMonitoring: SubModuleSelector.create(4),
    smartReports: SubModuleSelector.create(5),
    smartRules: SubModuleSelector.create(6),
  },
  safety: {
    index: 3,
    accountSettings: SubModuleSelector.create(0),
    overviewDashboard: SubModuleSelector.create(1),
    smartAlerts: SubModuleSelector.create(2),
    smartLocation: SubModuleSelector.create(3),
    staffManagement: SubModuleSelector.create(4),
    smartReports: SubModuleSelector.create(5),
    smartRules: SubModuleSelector.create(6),
  },
};
