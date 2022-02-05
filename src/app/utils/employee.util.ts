import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as moment from 'moment';

import { EWorkStatus } from '../enums';
import { ICoordinate, IEmployee, IProject } from '../models';
import { CrewAppRest } from '../providers/crewapp-rest';
import { getAddress, getMilesBetweenCoords, isToday } from './general.util';

declare var google: any;

export function getEmployeeWorkStatus(employee: IEmployee) {
  return employee.timeEntries.length > 0
    ? employee.timeEntries[employee.timeEntries.length - 1].endDateTime
      ? EWorkStatus.CLOCKED_OUT
      : employee.timeEntries[employee.timeEntries.length - 1].breakEntry
        ? !isToday(employee.timeEntries[employee.timeEntries.length - 1].startDateTime, employee.timeZone)
          ? EWorkStatus.OFFLINE
          : EWorkStatus.ON_BREAK
        : !isToday(employee.timeEntries[employee.timeEntries.length - 1].startDateTime, employee.timeZone)
          ? EWorkStatus.OFFLINE
          : EWorkStatus.CLOCKED_IN
    : EWorkStatus.OFFLINE;
}

export function getEmployeeLastProject$(employee: IEmployee, crewapprest: CrewAppRest): Observable<IProject> {
  const lastProject: IProject = employee.timeEntries.length > 0
    ? employee.timeEntries[employee.timeEntries.length - 1].project
    : null;

  if (lastProject) {
    if (!lastProject.projectId) {
      return of({ ...lastProject });
    }

    const { projectId } = lastProject;

    return crewapprest.getProjectAWS({ projectId })
      .pipe(
        mergeMap(async ({ data }: any) => {
          const location = data.location;

          let fullAddress = location && location.address ? location.address : '';
          fullAddress = fullAddress + (fullAddress && location.city ? ', ' : '') + (location.city ? location.city : '');
          fullAddress = fullAddress + (fullAddress && location.state ? ', ' : '') + (location.state ? location.state : '');
          fullAddress = fullAddress + (fullAddress && location.postalCode ? ', ' : '') + (location.postalCode ? location.postalCode : '');

          let coordinate = !data.location.lat || !data.location.lng
            ? null
            : ({
                lat: data.location.lat,
                lng: data.location.lng,
              });

          if (fullAddress && !coordinate) {
            const geolocation: any = await getAddress(fullAddress);

            coordinate = {
              lat: geolocation.lat(),
              lng: geolocation.lng()
            };
          }

          const locationData = {
            location,
            coordinate,
            fullAddress
          };

          return {
            ...lastProject,
            ...locationData

          } as IProject;
        })
      );
  } else {
    return of(null);
  }
}

export function getEmployeeTodayStartTime(employee: IEmployee) {
  const todayTimeEntries = employee.timeEntries.filter((timeEntry) =>
    isToday(timeEntry.startDateTime, employee.timeZone)
  );

  return todayTimeEntries.length > 0
    ? moment(
        Math.min.apply(null, todayTimeEntries.map((timeEntry) => moment(timeEntry.startDateTime).valueOf()))
      ).format('hh:mm a')
    : null;
}

export function getEmployeeTodayLastActivity(employee: IEmployee) {
  switch (employee.workStatus) {
    case EWorkStatus.OFFLINE: {
      return 'Offline at';
    }

    case EWorkStatus.ON_BREAK: {
      return 'Started break at';
    }

    case EWorkStatus.CLOCKED_OUT: {
      return 'Ended day at';
    }

    case EWorkStatus.CLOCKED_IN: {
      if (employee.timeEntries.length > 1) {
        const lastTimeEntry = employee.timeEntries[employee.timeEntries.length - 1];
        const previousTimeEntry = employee.timeEntries[employee.timeEntries.length - 2];

        if (previousTimeEntry.breakEntry) {
          return 'Ended break at';
        }

        if (previousTimeEntry.project && lastTimeEntry.project && previousTimeEntry.project.identifier !== lastTimeEntry.project.identifier) {
          return 'Switched at';
        }
      }

      return 'Clocked in at';
    }
  }
}

export function getEmployeeTodayLastActivityTime(employee: IEmployee) {
  return employee.timeEntries.length > 0
    ? moment(employee.timeEntries[employee.timeEntries.length - 1].endDateTime
        ? employee.timeEntries[employee.timeEntries.length - 1].endDateTime
        : employee.timeEntries[employee.timeEntries.length - 1].startDateTime
      ).format('hh:mm a')
    : null;
}

export function getEmployeeDistanceFromLastProject(employee: IEmployee) {
  return employee.coordinate && employee.lastProject && employee.lastProject.coordinate
    ? Number(getMilesBetweenCoords(employee.coordinate, employee.lastProject.coordinate).toFixed(2))
    : null;
}

export function getEmployeeCoordinate(employee: IEmployee) {
  const lastTimeEntry = employee.timeEntries.length > 0
    ? employee.timeEntries[employee.timeEntries.length - 1]
    : null;

  if (!lastTimeEntry) {
    return null;
  }

  let coordinate = {
    lat: lastTimeEntry.endLat
      ? lastTimeEntry.endLat
      : lastTimeEntry.startLat
      ? lastTimeEntry.startLat
      : null,
    lng: lastTimeEntry.endLng
      ? lastTimeEntry.endLng
      : lastTimeEntry.startLng
      ? lastTimeEntry.startLng
      : null,
  };

  if (!coordinate.lat || !coordinate.lng) {
    coordinate = null;
  }

  return coordinate as ICoordinate;
}

export function getEmployeeFullAddress$(employee: IEmployee): Observable<string> {
  if (!employee || !employee.coordinate) {
    return of(null);
  }

  const { coordinate } = employee;
  const geocoder = new google.maps.Geocoder();

  return new Observable((subscriber) => {
    geocoder.geocode({ location: coordinate }, (results, status) => {
      if (status === 'OK' && results[0]) {
        subscriber.next(results[0].formatted_address);
        subscriber.complete();
      } else {
        subscriber.next(null);
      }
    });
  });
}

export function employeeIsVisibleOnMap(employee: IEmployee) {
  return (
    employee.workStatus !== EWorkStatus.OFFLINE &&
    isToday(employee.timeEntries[employee.timeEntries.length - 1].startDateTime, employee.timeZone)
  );
}
