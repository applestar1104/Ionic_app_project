import { IEmployee } from './employee.model';
import { IProject } from './project.model';
import { IScheduleItem } from './schedule-item.model';

export interface ITimeEntry {
  approvedBy: object;
  breakEntry: number;
  costCode: object;
  createdBy: IEmployee;
  createdById: number;
  createdDateTime: string;
  description: string;
  endDateTime: string;
  endLat: number;
  endLng: number;
  hours: IScheduleItem;
  miles: number;
  notes: string;
  project: IProject;
  projectId: number;
  rateMultiplier: number;
  scheduleItem: IScheduleItem;
  startDateTime: string;
  startLat: number;
  startLng: number;
  tenantId: number;
  timeEntryId: number;
  updatedBy: IEmployee;
  updatedById: number;
  worker: IEmployee;
  workerId: number;
}
