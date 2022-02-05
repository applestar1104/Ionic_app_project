import { Injectable } from '@angular/core';
import { CrewAppState } from '../providers/crewapp-state';
import { CrewAppRest } from '../providers/crewapp-rest';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';
import { CrewSecureStorage } from '../providers/secure-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessLocalStorage {
  constructor(
    private crewapprest: CrewAppRest,
    private crewappstate: CrewAppState,
    private crewsecurestorage: CrewSecureStorage
  ) { }

  async processLocalStorageTimeEntries() {
    await this.crewappstate.presentLoading(this.crewappstate.getTranslation('HOME.LOADING'));
    const observableHttpCollection: any[] = [];
    let counter = 0;
    const combo = await Promise.all([this.crewsecurestorage.get('timeentrycollection'), this.crewsecurestorage.get('timesheet')]);

    let timeentrycollection = combo[0];
    if (timeentrycollection === null) {
      timeentrycollection = [];
    }

    let timesheet = combo[1];
    if (timesheet === null) {
      timesheet = this.createNewTimesheet(moment(), this.crewappstate.getTenant()['weekStartDay']);
    }

    timeentrycollection.forEach(localstoragetimeentry => {
      const action = localstoragetimeentry['api'];

      switch (action) {
        case 'addTimeEntriesAWS':
          observableHttpCollection[counter] = this.crewapprest.addTimeEntriesAWS(localstoragetimeentry);
          counter += 1;
          break;

        case 'updateTimeEntriesAWS':
          observableHttpCollection[counter] = this.crewapprest.updateTimeEntriesAWS(
            {
              timeEntryId: localstoragetimeentry.timeEntryId,
              body: localstoragetimeentry
            }
          );
          counter += 1;
          break;
      } // switch (action)
    });

    //  forkJoin these two calls.
    const comboObservableHttpCollection: any[] = [];
    if (this.crewappstate.getUser() !== undefined) {
      comboObservableHttpCollection[0] = this.crewapprest.workerDayTimeEntries({ workerId: this.crewappstate.getUser()['personId'], date: moment().format('YYYY-MM-DD') });
      comboObservableHttpCollection[1] = this.crewapprest.getTimeEntriesForSheetAWS({ workerId: this.crewappstate.getUser()['personId'], date: moment().format('YYYY-MM-DD') });
    }

    const resultsCombo = await new Promise((res, rej) => {
      if (observableHttpCollection.length > 0) {
        forkJoin(observableHttpCollection)
          .subscribe(observable_collection_result => {
            forkJoin(comboObservableHttpCollection)
              .subscribe(combo_result => {
                const currentTimeEntryCollection = combo_result[0]['data'].map(item => {
                  item.api = 'processed';
                  return item;
                });

                res({ timeentrycollection: currentTimeEntryCollection, timesheet: combo_result[1] });
              }, err => {
                res({ timeentrycollection: timeentrycollection, timesheet: timesheet });
              });
          }, err2 => {
            forkJoin(comboObservableHttpCollection)
              .subscribe(combo_result => {
                const currentTimeEntryCollection = combo_result[0]['data'].map(item => {
                  item.api = 'processed';
                  return item;
                });

                res({ timeentrycollection: currentTimeEntryCollection, timesheet: combo_result[1] });
              }, err => {
                res({ timeentrycollection: timeentrycollection, timesheet: timesheet });
              });
          });

      } else {
        forkJoin(comboObservableHttpCollection)
          .subscribe(combo_result => {
            const currentTimeEntryCollection = combo_result[0]['data'].map(item => {
              item.api = 'processed';
              return item;
            });

            res({ timeentrycollection: currentTimeEntryCollection, timesheet: combo_result[1] });
          }, err => {
            res({ timeentrycollection: timeentrycollection, timesheet: timesheet });
          });
      } // if (observableHttpCollection.length > 0)
    });

    await this.crewsecurestorage.set('timeentrycollection', resultsCombo['timeentrycollection']);
    await this.crewsecurestorage.set('timesheet', resultsCombo['timesheet']);
    this.crewappstate.dismissLoading();

    return resultsCombo;
  } // processLocalStorageTimeEntries - Jan-09-2020

  async addTimeEntries(timeEntryPostObj) {
    const dayname = moment(timeEntryPostObj['startDateTime']).tz(this.crewappstate.getTenant()['timeZone']).format('dddd').toLowerCase();
    const combo = await Promise.all([this.crewsecurestorage.get('projects'), this.crewsecurestorage.get('timeentrycollection'), this.crewsecurestorage.get('timesheet')]);
    let timeentrycollection = combo[1];
    const projectCollection = combo[0]['data'];
    let timesheet = combo[2];

    if (timeentrycollection === null) {
      timeentrycollection = [];
    }

    const selectedProjectIndex = projectCollection.findIndex(proj => {
      return proj.projectId === timeEntryPostObj.projectId;
    });

    if (selectedProjectIndex !== -1) {
      timeEntryPostObj.project = projectCollection[selectedProjectIndex];
    }

    timeEntryPostObj.api = 'addTimeEntriesAWS';
    timeEntryPostObj.timeEntryId = null;

    const updatedTimeEntryCollection = [...timeentrycollection, timeEntryPostObj];
    timeentrycollection = updatedTimeEntryCollection;

    /**
     * Update Timesheet so we can get regular hours worked this week.
     * This is needed to check if overtime is reached by hours going over default week length.
     */
    if (timesheet) {
      timesheet['data']['workDays'][dayname]['timeEntries'].push(timeEntryPostObj);
    } else {
      /**
       * If timesheet doesn't exist in local storage create
       */
      timesheet = this.createNewTimesheet(moment(), this.crewappstate.getTenant()['weekStartDay']);
    }

    await this.crewsecurestorage.set('timeentrycollection', timeentrycollection);
    await this.crewsecurestorage.set('timesheet', timesheet);
    return timeEntryPostObj;
  } // addTimeEntries

  async updateTimeEntries(timeEntryPutObj) {
    const dayname = moment(timeEntryPutObj['startDateTime']).tz(this.crewappstate.getTenant()['timeZone']).format('dddd').toLowerCase();
    const combo = await Promise.all([this.crewsecurestorage.get('projects'), this.crewsecurestorage.get('timeentrycollection'), this.crewsecurestorage.get('timesheet')]);
    const timesheet = combo[2];


    /**
     * Find the time entry in local storage to update.
     */
    let timeentrycollection = combo[1];
    if (!timeentrycollection) {
      timeentrycollection = [];
    }

    const selectedTimeEntryIndex = timeentrycollection.findIndex(item => {
      return item.startDateTime === timeEntryPutObj.startDateTime;
    });

    if (selectedTimeEntryIndex !== -1) {
      // update this entry in local storage.
      timeentrycollection[selectedTimeEntryIndex] = timeEntryPutObj;
      const updatedTimeEntryCollection = [...timeentrycollection];
      timeentrycollection = updatedTimeEntryCollection;
    } // if (selectedTimeEntryIndex !== -1)

    /**
     * Find the time entry in timesheet to update.
     */
    if (timesheet) {
      const selectedTimeEntryIndex2 = timesheet['data']['workDays'][dayname]['timeEntries'].findIndex(item => {
        return item.startDateTime === timeEntryPutObj.startDateTime;
      });

      if (selectedTimeEntryIndex2 !== -1) {
        timesheet['data']['workDays'][dayname]['timeEntries'].push(timeEntryPutObj);
      }
    }

    await this.crewsecurestorage.set('timeentrycollection', timeentrycollection);
    await this.crewsecurestorage.set('timesheet', timesheet);
    return timeEntryPutObj;
  } // updateTimeEntries

  async updateLocalStorage(putPostObjCollection) {
    const combo = await Promise.all([this.crewsecurestorage.get('projects'), this.crewsecurestorage.get('timeentrycollection'), this.crewsecurestorage.get('timesheet')]);
    let timeentrycollection = combo[1];
    const projectCollection = combo[0]['data'];
    let timesheet = combo[2];

    if (!timeentrycollection) {
      timeentrycollection = [];
    }

    putPostObjCollection.forEach(putPostObj => {
      if (putPostObj.action === 'add') {
        const selectedProjectIndex = projectCollection.findIndex(proj => {
          return proj.projectId === putPostObj.projectId;
        });

        if (selectedProjectIndex !== -1) {
          putPostObj.project = projectCollection[selectedProjectIndex];
        }

        const updatedTimeEntryCollection = [...timeentrycollection, putPostObj];
        timeentrycollection = updatedTimeEntryCollection;

        /**
         * Update our timesheet in local storage so we can calculate regular hours worked this week
         * in case we need it to check if we hit default week length trigger for overtime.
         */
        if (timesheet) {
          timesheet = this.createNewTimesheet(moment(), this.crewappstate.getTenant()['weekStartDay']);
        } else {
          const dayname = moment(putPostObj['startDateTime']).tz(this.crewappstate.getTenant()['timeZone']).format('dddd').toLowerCase();
          timesheet['data']['workDays'][dayname]['timeEntries'].push(putPostObj);
        }
      } // if (putPostObj.api === 'addTimeEntriesAWS')

      if (putPostObj.action === 'update') {
        const selectedTimeEntryIndex = timeentrycollection.findIndex(item => {
          return item.startDateTime === putPostObj.startDateTime;
        });

        if (selectedTimeEntryIndex !== -1) {
          // Can we figure out what the api property should be?
          const processLocalStorageAPI = timeentrycollection[selectedTimeEntryIndex].api === 'processed' || timeentrycollection[selectedTimeEntryIndex].api === 'updateTimeEntriesAWS'
            ? 'updateTimeEntriesAWS' : 'addTimeEntriesAWS';

          putPostObj.api = processLocalStorageAPI;
          putPostObj.project = timeentrycollection[selectedTimeEntryIndex].project;

          if (putPostObj.newStartDateTime) {
            putPostObj.startDateTime = putPostObj.newStartDateTime;
          }
          // update this entry in local storage.
          timeentrycollection[selectedTimeEntryIndex] = putPostObj;
          const updatedTimeEntryCollection = [...timeentrycollection];
          timeentrycollection = updatedTimeEntryCollection;

          /**
           * Update our timesheet in local storage so we can calculate regular hours worked this week
           * in case we need it to check if we hit default week length trigger for overtime.
           */
          if (timesheet) {
            const dayname = moment(putPostObj['startDateTime']).tz(this.crewappstate.getTenant()['timeZone']).format('dddd').toLowerCase();

            const selectedTimeEntryIndex2 = timesheet['data']['workDays'][dayname]['timeEntries'].findIndex(item => {
              return item.startDateTime === putPostObj.startDateTime;
            });

            if (selectedTimeEntryIndex2 !== -1) {
              timesheet['data']['workDays'][dayname]['timeEntries'].push(putPostObj);
            }
          }
        } // if (selectedTimeEntryIndex !== -1)
      } // if (putPostObj.api === 'updateTimeEntriesAWS')
    }); // putPostObjCollection.forEach(putPostObj => {

    await this.crewsecurestorage.set('timeentrycollection', timeentrycollection);
    await this.crewsecurestorage.set('timesheet', timesheet);
    return timeentrycollection;
  } // updateLocalStorage

  async removeExpiredTimeEntries() {
    // Keep entries that are not processed or are needed to build the home page while offline (missing endDateTimes)
    let timeentrycollection = await this.crewsecurestorage.get('timeentrycollection');
    if (timeentrycollection === null) {
      timeentrycollection = [];
    }

    // Determine which dates contain entries we need to keep, starting with today
    const todayDate = moment().format('YYYY-MM-DD');
    const datesToKeep = new Set([todayDate]);

    timeentrycollection.forEach(timeentry => {
      if (timeentry.api !== 'processed' || !timeentry.endDateTime) {
        const timeEntryStartDate = moment(timeentry.startDateTime).format('YYYY-MM-DD');
        datesToKeep.add(timeEntryStartDate);
      }
    });

    // If a time entry starts on one of the dates in our set, keep it, otherwise expire it
    timeentrycollection.forEach(timeentry => {
      const timeEntryStartDate = moment(timeentry.startDateTime).format('YYYY-MM-DD');
      if (datesToKeep.has(timeEntryStartDate)) {
        timeentry.expired = false;
      } else {
        timeentry.expired = true;
      }
    });

    const notExpiredCollection = timeentrycollection.filter(timeentry => {
      return !timeentry.expired;
    });

    await this.crewsecurestorage.set('timeentrycollection', notExpiredCollection);
  } // async removeExpiredTimeEntries

  async addVisitor(visitPostObj) {
    console.log('[ProcessLocalStorage] addVisitor(visitPostObj)::: ', visitPostObj);
    const combo = await Promise.all([this.crewsecurestorage.get('projects'), this.crewsecurestorage.get('visitcollection')]);
    let visitCollection = combo[1];
    const projectCollection = combo[0]['data'];
    console.log('local storage visitor collection::: ', visitCollection);

    if (!visitCollection) {
      visitCollection = [];
    }

    const updatedVisitCollection = [...visitCollection, visitPostObj];
    visitCollection = updatedVisitCollection;

    await this.crewsecurestorage.set('visitcollection', visitCollection);
    if (this.crewappstate.network.getValue() === 'Online') {
      this.processLocalStorageVisits().then(() => {
        return visitPostObj;
      });
    } else {
      return visitPostObj;
    }
  }

  async processLocalStorageVisits() {
    const observableHttpCollection: any[] = [];

    let visitcollection = await this.crewsecurestorage.get('visitcollection');
    if (visitcollection === null) {
      visitcollection = [];
    }

    visitcollection.forEach((localstoragevisit, i) => {
      observableHttpCollection[i] = this.crewapprest.addVisitor(localstoragevisit);
    });

    const results = await new Promise((res, rej) => {
      if (observableHttpCollection.length > 0) {
        forkJoin(observableHttpCollection)
          .subscribe(localstoragevisitprocessresults => {
            res(localstoragevisitprocessresults);
          });
      }
    });

    await this.crewsecurestorage.set('visitcollection', []);
    return results;
  } // processLocalStorageVisits()

  /**
   * Given a date and start day of workweek, finds days & dates of that workweek
   * @param {String} date date that must be included in workweek (YYYY-MM-DD)
   * @param {String} weekStartDay day of week that workweek starts (e.g. monday)
   * @returns {Object} object containing workweek days with dates (YYYY-MM-DD)
   */
  getWorkWeek(date, weekStartDay) {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let offset = daysOfWeek.indexOf(weekStartDay);
    offset -= (offset > moment(date).day()) ? 7 : 0; // this makes sure workWeek always includes 'date'
    // hard-coded examples:
    // const workDays = [0, 1, 2, 3, 4, 5, 6]; // first day of week is Sunday
    // const workDays = [1, 2, 3, 4, 5, 6, 7]; // first day of week is Monday
    // const workDays = [5, 6, 7, 8, 9, 10, 11]; // first day of week is Friday
    const workDays = Array.from(daysOfWeek, (x, i) => i + offset);
    const workWeekMap = {};
    for (const d of workDays) {
      const dayDate = moment(date).day(d).format('YYYY-MM-DD');
      const name = moment(date).day(d).format('dddd').toLowerCase();
      workWeekMap[name] = dayDate;
    }
    return workWeekMap;
  } // getWorkWeek()

  createNewTimesheet(date, weekStartDay) {
    const final = {
      timecard: null,
      sheetBreakHrs: 0,
      sheetWorkHrs: 0,
      workDays: {
        monday: {},
        tuesday: {},
        wednesday: {},
        thursday: {},
        friday: {},
        saturday: {},
        sunday: {}
      }
    };

    const workDateMap = this.getWorkWeek(date, weekStartDay);

    for (const dv of Object.keys(workDateMap)) {
      final.workDays[dv] = {
        date: workDateMap[dv],
        count: 0,
        timeEntries: [],
        dayBreakHrs: 0,
        dayWorkHrs: 0
      };
    } // for ()

    return { data: final };
  } // createNewTimesheet()

} // ProcessLocalStorage
