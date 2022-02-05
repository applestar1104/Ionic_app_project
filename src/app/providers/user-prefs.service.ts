import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserPrefsService {
  /**
   * BC-1223 Refactor Settings
   */
  private settingsTemplate;
  private tenant;

  constructor() { }


  set(template, tenant) {
    this.settingsTemplate = template;
    this.tenant = tenant;
  }

  get(settingName: string): string | number | boolean {
    switch (settingName) {
      /**
       * BOOLEAN - Depends On Tenant and Settings Template
       */
      case 'timeAllowsWorkerEdits':
      case 'timeRequiresNotes':
      case 'timeHasNotes':
      case 'timeRequiresMileage':
      case 'timeRequiresCostCode':
      case 'timeRequiresSignature':
      case 'timeRequiresGps': {
        if (this.settingsTemplate !== undefined && this.settingsTemplate.hasOwnProperty(settingName)) {
          return this.settingsTemplate[settingName] === 1 ? true : false;
        } else {
          if (this.tenant !== undefined && this.tenant[settingName]) {
            return this.tenant[settingName] === 1 ? true : false;
          } else {
            return false;
          }
        }
      }

      /**
       * BOOLEAN - Depends On Settings Template Only
       */
      case 'exportsVisitors':
      case 'usesBrowserApp':
      case 'editsScheduleBoard':
      case 'editsPeople':
      case 'editsCompanies':
      case 'editsCostCodes':
      case 'editsSettingsTemplates':
      case 'editsTenant':
      case 'editsSubscription':
      case 'editsTimeEntries':
      case 'editsVisitorForm':
      case 'viewsScheduleBoard':
      case 'editsVisitors':
      case 'usesTimeClock':
      case 'usesNativeApp':
      case 'onScheduleBoard':
      case 'editsScheduleBoard':
      case 'editsProjects': {
        return (this.settingsTemplate !== undefined && this.settingsTemplate[settingName] === 1) ? true : false;
      }

      /**
       * Number or String (Depends On Tenant and Settings Template)
       */
      case 'defaultBreakLength':
      case 'defaultDayLength':
      case 'defaultStartTime':
      case 'defaultWeekLength': {
        return this.settingsTemplate[settingName] || this.settingsTemplate[settingName] === 0
          ? this.settingsTemplate[settingName] : this.tenant[settingName];
      }
    } // switch
  } // get()
}
