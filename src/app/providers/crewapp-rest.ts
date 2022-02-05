import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, from, throwError } from 'rxjs';
import { tap, mergeMap, map, last } from 'rxjs/operators';
import { CrewAppState } from './crewapp-state';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CrewSecureStorage } from '../providers/secure-storage.service';
import { environment } from '../../environments/environment';
const AWS_BASE_URL = `https://${environment.api.id}.execute-api.${environment.region}.amazonaws.com/${environment.stage}/`;
// const AWS_BASE_URL = 'http://localhost:3000/'; // local testing


@Injectable({
  providedIn: 'root'
})
export class CrewAppRest {
  private jwtHelper;
  private peopleCollection: any;
  private costCodeCollection: any;
  private projectCollection: any;

  constructor(
    public http: HttpClient,
    private crewappstate: CrewAppState,
    private crewsecurestorage: CrewSecureStorage // BC-952 work offline
  ) {
    this.jwtHelper = new JwtHelperService();
  }

  getLocationAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}locations/${optionsObj.locationId}`, httpOptions);
        })
      );
  } // getLocationAWS

  addLocation(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.post(`${AWS_BASE_URL}locations`, optionsObj, httpOptions);
        })
      );
  } // addLocation
  addProject(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.post(`${AWS_BASE_URL}projects`, optionsObj, httpOptions);
        })
      );
  } // addProject
  addVisitor(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.post(`${AWS_BASE_URL}visitors`, optionsObj, httpOptions);
        })
      );
  } // addVisitor
  updateVisitor(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.put(`${AWS_BASE_URL}visitors/${optionsObj.visitorId}`, optionsObj.body, httpOptions);
        })
      );
  } // updateVisitor
  deleteVisitor(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.delete(`${AWS_BASE_URL}visitors/${optionsObj.visitorId}`, httpOptions);
        })
      );
  } // deleteVisitor

  getVisitors(queryString = ''): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}visitors${queryString}`, httpOptions);
        })
      );
  } // getVisitors().

  getQrCode(optionsObj): Observable<Object> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-rapidapi-host': 'qrcode-monkey.p.rapidapi.com',
        'x-rapidapi-key': '9ed55e64e8msh99334d03e902bcfp19e3abjsnea00eba4034a',
        'useQueryString': 'true',
      })
    };

    const requestBody = {
      'data': `${optionsObj.url}`,
      'config': {
        'body': 'circle',
        'eye': 'frame13',
        'eyeBall': 'ball15',
        'bodyColor': '#2062B0',
        'bgColor': '#FFFFFF',
        'eye1Color': '#2062B0',
        'eye2Color': '#2062B0',
        'eye3Color': '#2062B0',
        'eyeBall1Color': '#2062B0',
        'eyeBall2Color': '#2062B0',
        'eyeBall3Color': '#2062B0',
        'gradientColor1': '#2062B0',
        'gradientColor2': '#2062B0'
      },
      'size': 300,
      'download': true,
      'file': 'png'
    };

    return this.http.post('https://qrcode-monkey.p.rapidapi.com/qr/custom', requestBody, httpOptions);
  } // getQrCode

  getRefreshedIdToken() {
    return this.crewappstate.getIdToken();
  }

  async getRefreshedIdTokenP() {
    const results = await new Promise((res, rej) => {
      if (this.crewappstate.network.getValue() === 'Online') {
        const idtoken = this.crewappstate.getIdToken();

        if (this.jwtHelper.isTokenExpired(idtoken)) {
          this.refreshToken({ refreshToken: this.crewappstate.getRefreshToken() })
            .subscribe({
              next: async data => {
                // We have a new id token!
                const newidtoken = data['data']['idToken']['jwtToken'];
                this.crewappstate.setIdToken(newidtoken);
                this.crewappstate.setRefreshToken(data['data']['refreshToken']['token']);
                await this.crewsecurestorage.set('idtoken', data['data']['idToken']['jwtToken']);
                await this.crewsecurestorage.set('refreshtoken', data['data']['refreshToken']['token']);

                res(newidtoken);
              }
            });
        } else {
          res(idtoken);
        }
      } else {
        const err = new Error('Attempted to call API while offline');
        console.log(err);
        this.crewappstate.dismissLoading();
        rej(err);
      }
    });

    return results;
  } // getRefreshedIdTokenP

  resetMemoizedCollections() {
    this.peopleCollection = null;
    this.costCodeCollection = null;
    this.projectCollection = null;
  }

  setProjectsCollection(projectObj) {
    this.projectCollection = projectObj;
  }
  setCostCodesCollection(costcodeObj) {
    this.costCodeCollection = costcodeObj;
  }
  setPeopleCollection(peopleObj) {
    this.peopleCollection = peopleObj;
  }

  async setProjectCollectionFromSecureStorage() {
    const idtoken = await this.crewsecurestorage.get('idtoken');
    if (idtoken) {
      this.projectCollection = await this.crewsecurestorage.get('projects');
    } else {
      this.projectCollection = null;
    }
  } // setProjectCollectionFromSecureStorage

  async setCostCodeCollectionFromSecureStorage() {
    const idtoken = await this.crewsecurestorage.get('idtoken');
    if (idtoken) {
      this.costCodeCollection = await this.crewsecurestorage.get('costcodes');
    }
  } // setCostCodeCollectionFromSecureStorage

  async setPeopleCollectionFromSecureStorage() {
    const idtoken = await this.crewsecurestorage.get('idtoken');
    if (idtoken) {
      this.peopleCollection = await this.crewsecurestorage.get('people');
    }
  } // setPeopleCollectionFromSecureStorage

  setProjectCollection(projectcollection) {
    this.projectCollection = projectcollection;
  }
  isProjectCollectionNull() {
    return this.projectCollection == null;
  }

  signUp(optionsObj): Observable<Object> {
    return this.http.post(`${AWS_BASE_URL}signUp`, optionsObj);
  } // signUp

  forgotPassword(optionsObj): Observable<Object> {
    return this.http.post(`${AWS_BASE_URL}forgotPassword`, optionsObj);
  } // forgotPassword

  forgotPWConfirm(optionsObj): Observable<Object> {
    return this.http.post(`${AWS_BASE_URL}forgotPWConfirm`, optionsObj);
  } // forgotPWConfirm

  refreshToken(optionsObj): Observable<Object> {
    const httpOptions = {
      headers: new HttpHeaders({
        'X-Auth-Token': this.crewappstate.getIdToken()
      })
    };

    return this.http.post(`${AWS_BASE_URL}refreshToken`, optionsObj, httpOptions);
  } // refreshToken

  getSettings(): Observable<Object> {
    if (this.crewappstate.network.getValue() === 'Online') {
      return this.http.get(`${AWS_BASE_URL}settings`);
    } else {
      return throwError(new Error('Attempted to call API while offline'));
    }
  } // getSettings

  /*---------- People ----------*/
  getPeopleAWS(): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}people?active=1`, httpOptions);
        })
      );
  } // getPeopleAWS

  getPeopleMemo(): Observable<Object> {
    if (this.peopleCollection) {
      return of(this.peopleCollection);
    }

    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}people?active=1`, httpOptions)
            .pipe(
              tap(result => this.peopleCollection = result)
            );
        })
      );
  } // getPeopleMemo

  getPerson(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}people/${optionsObj.personId}?` +
            `getImage=${optionsObj.getImage}&getSignature=${optionsObj.getSignature}`, httpOptions);
        })
      );
  } // getPerson

  updatePersonAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.put(`${AWS_BASE_URL}people/${optionsObj.personId}`, optionsObj.body, httpOptions);
        })
      );
  } // updatePersonAWS
  /*---------- People ----------*/

  uploadSignatureImage(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.put(`${AWS_BASE_URL}people/${optionsObj.personId}/signatureImage`, optionsObj.body, httpOptions);
        })
      );
  } // uploadSignatureImage

  uploadProfileImage(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.put(`${AWS_BASE_URL}people/${optionsObj.personId}/profileImage`, optionsObj.body, httpOptions);
        })
      );
  } // uploadProfileImage

  logInAWS(optionsObj): Observable<Object> {
    return this.http.post(`${AWS_BASE_URL}logIn`, optionsObj);
  } // logInAWS().

  logOutAWS(): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}logOut`, httpOptions);
        })
      );
  } // logOutAWS().

  getCurrentTenant(): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}tenants/current`, httpOptions);
        })
      );
  } // getCurrentTenant

  getCurrentUserAWS(): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}users/current`, httpOptions);
        })
      );
  } // getCurrentUserAWS

  workerDayTimeEntries(optionsObj) {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}timeEntries/workerDay?workerId=${optionsObj.workerId}&date=${optionsObj.date}`, httpOptions);
        })
      );
  }  // workerDayTimeEntries().

  workerWeekScheduleItems(optionsObj) {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}scheduleItems/workerWeek?workerId=${optionsObj.workerId}&date=${optionsObj.date}`, httpOptions);
        })
      );
  }  // workerWeekScheduleItems().

  workerDayScheduleItems(optionsObj) {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}scheduleItems/workerDay?workerId=${optionsObj.workerId}&date=${optionsObj.date}`, httpOptions);
        })
      );
  }  // workerDayScheduleItems().

  getTimeEntriesForSheetAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}timeEntriesForSheet?workerId=${optionsObj.workerId}&date=${optionsObj.date}`, httpOptions);
        })
      );
  } // getTimeEntriesForSheetAWS().

  getTimeEntriesForCrewDay(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}timeEntries/crewDay?date=${optionsObj.date}`, httpOptions);
        })
      );
  } // getTimeEntriesForCrewDay

  getTimeEntriesAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}timeEntries/${optionsObj.timeEntryId}?getImages=1`, httpOptions);
        })
      );
  }

  addTimeEntriesAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.post(`${AWS_BASE_URL}timeEntries`, optionsObj, httpOptions);
        })
      );
  } // addTimeEntriesAWS

  deleteTimeEntriesAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.delete(`${AWS_BASE_URL}timeEntries/${optionsObj.timeEntryId}`, httpOptions);
        })
      );
  } // deleteTimeEntriesAWS

  updateTimeEntriesAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };
          console.log('timeEntryID: ', optionsObj.timeEntryId);
          console.log(`${AWS_BASE_URL}timeEntries/${optionsObj.timeEntryId}`);
          console.log('optionsObj.body: ', optionsObj.body);
          console.log('httpOptions', httpOptions);
          return this.http.put(`${AWS_BASE_URL}timeEntries/${optionsObj.timeEntryId}`, optionsObj.body, httpOptions);
        })
      );
  } // updateTimeEntriesAWS

  getScheduleItemAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}scheduleItems/${optionsObj.scheduleItemId}`, httpOptions);
        })
      );
  } // getScheduleItemAWS

  getScheduleItemsForWorkerBoardAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}scheduleItemsForWorkerBoard?date=${optionsObj.date}`, httpOptions);
        })
      );
  } // getScheduleItemsForWorkerBoardAWS

  getScheduleItemsForProjectBoardAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}scheduleItemsForProjectBoard?date=${optionsObj.date}`, httpOptions);
        })
      );
  } // getScheduleItemsForProjectBoardAWS

  getScheduleItemsForWorkerBoardReqAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}scheduleItemsForWorkerBoardReq?date=${optionsObj.date}`, httpOptions);
        })
      );
  } // getScheduleItemsForWorkerBoardReqAWS


  addProjectToWorkerBoardAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.post(`${AWS_BASE_URL}scheduleItems`, optionsObj, httpOptions);
        })
      );
  } // addProjectToWorkerBoardAWS

  updateScheduleItemAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.put(`${AWS_BASE_URL}scheduleItems/${optionsObj.scheduleItemId}`, optionsObj.body, httpOptions);
        })
      );
  } // updateScheduleItemAWS

  deleteScheduleItemAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.delete(`${AWS_BASE_URL}scheduleItems/${optionsObj.scheduleItemId}`, httpOptions);
        })
      );
  } // deleteScheduleItemAWS

  getTimecardAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}timeEntries?workerId=${optionsObj.workerId}&date=${optionsObj.date}`, httpOptions);
        })
      );
  } // getTimecardAWS

  getUnsignedTimecards(optionsObj): Observable<Object> {
    // GET /timecards?workerId=1234&timeCardStatus=Open
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}timecards?workerId=${optionsObj.workerId}&timecardStatus=${optionsObj.timecardStatus}`, httpOptions);
        })
      );
  } // getUnsignedTimecards

  updateTimecard(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.put(`${AWS_BASE_URL}timecards/${optionsObj.timecardId}/changeStatus`, optionsObj.body, httpOptions);
        })
      );
  } // updateTimecard

  /*---------- Receipts ----------*/
  getReceiptsAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}receipts?purchasedById=${optionsObj.purchasedById}`, httpOptions);
        })
      );
  } // getReceiptsAWS

  getReceiptAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}receipts/${optionsObj.receiptId}`, httpOptions);
        })
      );
  } // getReceiptAWS

  updateReceiptAWS(optionsObj, getProgress): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            reportProgress: true,
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          const req = new HttpRequest('PUT', `${AWS_BASE_URL}receipts/${optionsObj.receiptId}`, optionsObj.body, httpOptions);

          return this.http.request(req)
            .pipe(
              map(event => getProgress(event)),
              tap(() => { }),
              last()
            );
        })
      );
  } // updateReceiptAWS

  addReceiptAWS(optionsObj, getProgress): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            reportProgress: true,
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          const req = new HttpRequest('POST', `${AWS_BASE_URL}receipts`, optionsObj.body, httpOptions);

          return this.http.request(req)
            .pipe(
              map(event => getProgress(event)),
              tap(() => { }),
              last()
            );
        })
      );
  } // updateReceiptAWS
  /*---------- Receipts ----------*/

  /*---------- Projects ----------*/
  getProjectsMemo(): Observable<Object> {
    if (this.projectCollection) {
      return of(this.projectCollection);
    }

    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}projects?active=1`, httpOptions)
            .pipe(
              tap(result => this.projectCollection = result)
            );
        })
      );
  } // getProjectsMemo

  getProjectsAWS(queryString = ''): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}projects${queryString}`, httpOptions);
        })
      );
  } // getProjectsAWS

  getProjectAWS(optionsObj): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}projects/${optionsObj.projectId}`, httpOptions);
        })
      );
  } // getProjectAWS
  /*---------- Projects ----------*/

  /*---------- Cost Codes ----------*/
  getCostCodesMemo(): Observable<Object> {
    if (this.costCodeCollection) {
      return of(this.costCodeCollection);
    }

    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}costCodes?active=1`, httpOptions)
            .pipe(
              tap(result => this.costCodeCollection = result)
            );
        })
      );
  } // getCostCodesMemo

  getCostCodesAWS(): Observable<Object> {
    return from(this.getRefreshedIdTokenP())
      .pipe(
        mergeMap(idtoken => {
          const usefulToken = idtoken as string;
          const httpOptions = {
            headers: new HttpHeaders({
              'X-Auth-Token': usefulToken
            })
          };

          return this.http.get(`${AWS_BASE_URL}costCodes?active=1`, httpOptions);
        })
      );
  } // getCostCodesAWS
  /*---------- Cost Codes ----------*/


} // CrewAppRest
