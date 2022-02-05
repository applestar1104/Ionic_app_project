import { IClient } from './client.model';
import { ICoordinate } from './coordinate.model';
import { IEmployee } from './employee.model';
import { ILocation } from './location.model';

export interface IProject {
  active: number;
  activeBool: boolean;
  bgColor: string;
  client: IClient;
  clientId: number;
  defaultColor: string;
  formCode: string;
  identifier: string;
  location: ILocation;
  locationId: number;
  name: string;
  pm: IEmployee;
  pmId: number;
  projectId: number;
  projectCode: string;
  ps: IEmployee;
  psId: number;
  tenantId: number;
  coordinate: ICoordinate;
  fullAddress: string;
}
