import { EWorkStatus } from '../enums';
import { ICompany } from './company.model';
import { ICoordinate } from './coordinate.model';
import { IProject } from './project.model';
import { ISettingsTemplate } from './settings-template.model';
import { ITimeEntry } from './time-entry.model';

export interface IEmployee {
  active: number;
  appLanguage: string;
  company?: ICompany;
  companyId: number;
  email: string;
  firstName: string;
  lastName: string;
  personId: number;
  phoneNumber: string;
  settingsTemplate?: ISettingsTemplate;
  settingsTemplateId: number;
  tenantId: number;
  timeEntries?: Array<ITimeEntry>;
  coordinate: ICoordinate;
  workStatus: EWorkStatus;
  lastProject: IProject;
  todayStartTime: string;
  todayLastActivity: string;
  todayLastActivityTime: string;
  distanceFromLastProject: number;
  imageUrl: string;
  fullAddress: string;
  timeZone: string;
}
