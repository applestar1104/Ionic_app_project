import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Subject, BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { ToastController, LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular'; // BC-839 use 'ion-alert' instead of 'confirm'
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { CrewSecureStorage } from '../providers/secure-storage.service';
import { UserPrefsService } from '../providers/user-prefs.service';

@Injectable({
  providedIn: 'root'
})
export class CrewAppState {

  constructor(
    public toastCtrl: ToastController,
    private platform: Platform,
    private appVersionUtil: AppVersion,
    private loadingCtrl: LoadingController,
    public alertController: AlertController, // BC-839 use 'ion-alert' instead of 'confirm'
    private translate: TranslateService,
    private userprefs: UserPrefsService,
    private crewsecurestorage: CrewSecureStorage,
  ) { }

  private visitProject: any = {};

  private weekLengthTriggersOvertime = {
    trigger: false,
    regularHours: 0
  };

  public network = new BehaviorSubject<string>('Online');
  // public network = new BehaviorSubject<string>('Offline');

  public network$ = this.network.asObservable();
  private sideMenu = new Subject<any>(); // BC-434
  public sideMenuState$ = this.sideMenu.asObservable(); // BC-434

  private stateAppVersion: string = null;
  private stateAppPlatform: string = null;

  private clockAction = ''; // BC-435
  private routeProject: any = {};
  private routeScheduleItemId: number;
  private routeScheduleItem: any = null;
  private routeBackgroundColorSwitch: string;

  private refreshToken: string;
  private idToken: string;
  private user = { ID: null, name: '' };
  private currentTenant: object;
  private currentUser: object;
  private scheduleDateSelected: string;
  private receiptViewModel: any;

  private clockedInTimeEntry: any = null;
  private clockedInBreakEntry: any = null;

  private csiCollection: any;

  private homeSelectGoBack: string;
  private homeSelectTimeGoBack: string;
  private homeSelectTimeTitle: string;

  private multiTimeEntryCollection: any[] = [];
  private currentTimeEntryPutObj: any;
  private clockoutCostCodeCollection: number[] = [];

  private timeEntryNotes: string;
  private timeEntryImages: any[];

  private clockoutCostCode: number;
  private miles = 0;

  private secondsBooked = 0;
  private breakSecondsBooked = 0;

  private breakHoursBooked = 0;
  private hoursBooked = 0;

  private lastEndDateTime: string;

  private projectDetailBack = '';

  private firstClockIn: any = {
    clockedIn: false,
    startDateTime: null
  };

  private startedCollection: any[] = []; // BC-435

  private loading: HTMLIonLoadingElement;

  private timecardFix = {
    day: '',
    timecard: null
  }; // BC-473

  private timecardDay = moment().format('YYYY-MM-DD'); // BC-473

  private unsignedTimecardCollection: any[] = [];

  /**
   * BC-560 Overtime Entry and Approval
   * If calculated hours worked is more than eight show OT modal and
   * split time entry into two...
   */
  private updateCostCodeCollection: any[] = [];
  private OTNeedsApprovalCollection: any[] = [];
  private httpCollectionOT: any[] = [];
  private selectedTime: string;

  // tslint:disable-next-line: max-line-length
  private badtoken = 'eyJraWQiOiJMb2c5YmtGV1dBNzMxSXpFeHlxQUN4ZWdqVW1hekxTZmdvMUVjb1FTZGVBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJmZjBkYzRmYy0zZjk4LTQxZGItYmY5My01ZjQ2OWRkOWI5MGQiLCJhdWQiOiIyN25ob3JraWlybWxpc3JqN2xmN3J2dHBxdSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjRmMDAwZjIzLTA3ZDktNDJhYi05NWRkLWI3ZTIwOTMzNWExNyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNTg5MDc4NTk1LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl9rVXEwYWNoMVUiLCJjb2duaXRvOnVzZXJuYW1lIjoiZmYwZGM0ZmMtM2Y5OC00MWRiLWJmOTMtNWY0NjlkZDliOTBkIiwiZXhwIjoxNTg5MDgyMTk1LCJpYXQiOjE1ODkwNzg1OTUsImVtYWlsIjoiamFzb25AY29iZWluYy5jb20iLCJjdXN0b206dXNlcklkIjoiMSJ9.E_giDSnFm-PCAC1XIJGAIeY3zzK079AMk-f7hC5yRBp1ahF6yxa3m17iZ3Pz2A9JHxAZMb8J5juy5O69SQ7_Eo4YPCtos57TfLxeTKE_eDqitFs4OopyqMVCdlZHEFS7odPf0XXQ26VoDrTBdMtViCOpRF9i6ywhrm-e4s_GIxvnoy6DKPe8f6iOYIbZIcZ7yBjPpeCDpBnmPUiLf6TDaZyywuB5bKqici3laETKYjzh7ZbzYx793m4KgPU5U6b25ZYsQN1LcbcQWOE6X6MrX0KCZf3JaIUIQAGTecfw3H6H1lFVYcWZw7_4RLkjA3i5UrYTn_fXxNpcaZdQLyYfYQ';
  // tslint:disable-next-line: max-line-length
  private badrefreshtoken = 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.bgOL8gT9YdW7TGaL5z7AkmJDZdr10D7dThBe7QmHUrcwioQ7vWjxeZL6qvSgu226Dqxjtz6SMgzz3TRRMuddkNXGWWY69YNWtBztx6cTNhkuAN9_Xsxy1pUmuxQEhrXPEHYoCZHYqL4l98mmt7T7Gud0OcIG8soH94HBZmO4QrhrlztK5-oATegfxzK2aL5YHXN7XFaYELnr7-HguAG_SjiDtrbrQK3iqVKKYDz8isj-JcBC5Ck3Sd2veVW03Cv1-qfhAKo2RYAmxCEIAf4dX0FLxekFoyR2jjzuOtAiAIfTrew-MpWRhfXgwidB7tPVUeRbttG7fs7KQ2i10tdZIQ.aIcfqTa1xjzoMRHd.ZS6lF8yYYpUY2OeYj08HMq5ViIGaRjEDAeMZyV0-R5z-hJhT0ps9oNsfLYG9wKxTfhXfEAdqHt61SkVwgnaOIWcRKWriox3EUe_DtlX8-itkH4mqKk61VcDv9oOtK_I6eTWnlYSIXWJSpp_f3_l_9l1ZZTS8dSS2d2_zJumfyhj7H-mYEPLLT9Hz6Cj0bcKlcDsOkRky5aJosb-zYaVwgII-wYi0S0mC-DDKmz2oPJePW3AkGzwg-j8PkNDjarkL02-2n_wcrJnytOoxpMMWNUnEeuvybv5MmRYadQVMGzOwyUbyRhBXPKDnFrYghjcticE9T3rN8roG1R9Tv7AEv1s8MJqNb1jJSbZxD7VYSlBVrM2gNlXY5mx2OD3Hl_e24imeaOV9wYTizalMmphpXZiaIuGA63Sk7iFs1xsBn9xhpkCwRgzLg3aggGDEmvHRchGGNI3v6pw-LrkDEgSBXf1ewrwrb2t1X0b4Vi7d6sQMK3zLuHFthH2xwwBVVPyZx3vKntYi9EF3tSHmvynj5FHx-4ICSLKIBj81-gDVhkYKCsHp38lnBkBO9eD3xc0kO8iBUTwsvyJGreZT1lOW-DtvvfPmC61lxlZTmaaSUIWQgM1V6mji7MoaE8yYvAPM35cfbBed8m51dXgIDBkMX1fdRZ13olBXoOyrTI8CNzNrEqEsi3SSW3ZhkDPtMqUhyiz3RMhCrVDK1Y-QYxGqt0zCw8_XQK4qi1sjCSIolAOFJsj-7uy7MLay3mImaqW3XX-SznknDGe_8pu7_fKtWrhyppTBix6A0V2TUkfsa8dK8kLPnu6MIw1ZJv4tT-s5R6nsqmdN3p700A3CfYgYKdwdgsaT1BR68OYddHQkd2AXAt4BkQdegmNnGl28vMnpW49U-_UUqoMzPy-UPwveu9UNnL9frSi3GXWnX8t7r-cqIGs9x9TFP94o1mSi6X4uO3VRtHvMgDTxmtf82nopCA9cKPI0vsIYhNgwJptVUuHi7VJF3lnUcMRW1p6Lew6fZ0b3cfcvXUgl8cSKV99k5o8jA1srpclzwWGVjgMcJMtx6NOMTrGJZW8-xBSa5yjyUM0wqc2b1y7I7CSgrmBfb1RBVFUMrmZXa1IkfoPFUbjmqMIkfApWxiS7xQaV4wB9jUD6KHXGbxDBfYe43fjgabJTZCTe4FrOOKMzBhNUox8sEPnjvpQd-cy8jKDX0EF7uMrRXn4rS1wmvbNRNHsV088rHVNaCrarrERjh9b30yqf9Qyvhk0o21WOndzd0p3beO7vWAEYl924hKN4gbE0fbxQGNAbMv2Romjnqzu4x61wPw5vijwAWR9H-A.qC1IzpwjizrzXAJlbKLE6w';

  private defaultBreakLength: number;
  private defaultDayLength: number;
  private defaultWeekLength: number;

  /**
   * BC-548 skip mileage or csi based on company settings.
   */
  private skipMileage = false;
  private skipCostCode = false;
  private defaultStartTime = '';
  private timeRequiresNotes: number;
  private timeHasNotes: number;
  private timeRequiresGps: boolean;

  private timeRequiresSignature: boolean;

  /**
   * BC-613 Reset Password
   */
  private resetpasswordemail = '';

  /**
   * BC-585 Go directly to Home root from other root route.
   */
  private lastUrl: string;

  /**
   * BC-716 after 4 hours of working, allow users to enter a lunch
   * even if it starts before their current entry startDateTime
   */
  private minutesCollection = [
    { key: 0, value: '00' },
    { key: 1, value: '01' },
    { key: 2, value: '02' },
    { key: 3, value: '03' },
    { key: 4, value: '04' },
    { key: 5, value: '05' },
    { key: 6, value: '06' },
    { key: 7, value: '07' },
    { key: 8, value: '08' },
    { key: 9, value: '09' },
    { key: 10, value: '10' },
    { key: 11, value: '11' },
    { key: 12, value: '12' },
    { key: 13, value: '13' },
    { key: 14, value: '14' },
    { key: 15, value: '15' },
    { key: 16, value: '16' },
    { key: 17, value: '17' },
    { key: 18, value: '18' },
    { key: 19, value: '19' },
    { key: 20, value: '20' },
    { key: 21, value: '21' },
    { key: 22, value: '22' },
    { key: 23, value: '23' },
    { key: 24, value: '24' },
    { key: 25, value: '25' },
    { key: 26, value: '26' },
    { key: 27, value: '27' },
    { key: 28, value: '28' },
    { key: 29, value: '29' },
    { key: 30, value: '30' },
    { key: 31, value: '31' },
    { key: 32, value: '32' },
    { key: 33, value: '33' },
    { key: 34, value: '34' },
    { key: 35, value: '35' },
    { key: 36, value: '36' },
    { key: 37, value: '37' },
    { key: 38, value: '38' },
    { key: 39, value: '39' },
    { key: 40, value: '40' },
    { key: 41, value: '41' },
    { key: 42, value: '42' },
    { key: 43, value: '43' },
    { key: 44, value: '44' },
    { key: 45, value: '45' },
    { key: 46, value: '46' },
    { key: 47, value: '47' },
    { key: 48, value: '48' },
    { key: 49, value: '49' },
    { key: 50, value: '50' },
    { key: 51, value: '51' },
    { key: 52, value: '52' },
    { key: 53, value: '53' },
    { key: 54, value: '54' },
    { key: 55, value: '55' },
    { key: 56, value: '56' },
    { key: 57, value: '57' },
    { key: 58, value: '58' },
    { key: 59, value: '59' },
  ];

  private hoursCollection = [
    { key: 0, value: '00' },
    { key: 1, value: '01' },
    { key: 2, value: '02' },
    { key: 3, value: '03' }
  ];

  private durationCollection = [
    { viewValue: '0', value: 0 },
    { viewValue: '.5', value: .5 },
    { viewValue: '1', value: 1 },
    { viewValue: '1.5', value: 1.5 },
    { viewValue: '2', value: 2 },
    { viewValue: '2.5', value: 2.5 },
    { viewValue: '3', value: 3 },
    { viewValue: '3.5', value: 3.5 },
    { viewValue: '4', value: 4 },
    { viewValue: '4.5', value: 4.5 },
    { viewValue: '5', value: 5 },
    { viewValue: '5.5', value: 5.5 },
    { viewValue: '6', value: 6 },
    { viewValue: '6.5', value: 6.5 },
    { viewValue: '7', value: 7 },
    { viewValue: '7.5', value: 7.5 },
    { viewValue: '8', value: 8 },
    { viewValue: '8.5', value: 8.5 },
    { viewValue: '9', value: 9 },
    { viewValue: '9.5', value: 9.5 },
    { viewValue: '10', value: 10 },
    { viewValue: '10.5', value: 10.5 },
    { viewValue: '11', value: 11 },
    { viewValue: '11.5', value: 11.5 },
    { viewValue: '12', value: 12 },
    { viewValue: '12.5', value: 12.5 },
    { viewValue: '13', value: 13 },
    { viewValue: '13.5', value: 13.5 },
    { viewValue: '14', value: 14 },
    { viewValue: '14.5', value: 14.5 },
    { viewValue: '15', value: 15 },
    { viewValue: '15.5', value: 15.5 },
    { viewValue: '16', value: 16 },
    { viewValue: '16.5', value: 16.5 },
    { viewValue: '17', value: 17 },
    { viewValue: '17.5', value: 17.5 },
    { viewValue: '18', value: 18 },
    { viewValue: '18.5', value: 18.5 },
    { viewValue: '19', value: 19 },
    { viewValue: '19.5', value: 19.5 },
    { viewValue: '20', value: 20 },
    { viewValue: '20.5', value: 20.5 },
    { viewValue: '21', value: 21 },
    { viewValue: '21.5', value: 21.5 },
    { viewValue: '22', value: 22 },
    { viewValue: '22.5', value: 22.5 },
    { viewValue: '23', value: 23 },
    { viewValue: '23.5', value: 23.5 },
    { viewValue: '24', value: 24 },
  ];

  private presetColors = [
    '#dc627b', '#ce7881', '#e3395d', '#d8686a',
    '#b88380', '#d5534e', '#e7363d', '#cf8978',
    '#d56442', '#de592e', '#dd8160', '#e76019',
    '#ae896e', '#c58f65', '#a9681c', '#c0884d',
    '#dc974a', '#d6902c', '#dfa61f', '#bea732',
    '#ccb95a', '#bfaf65', '#ab9c3d', '#8a7e36',
    '#877b1b', '#a09961', '#9d9d77', '#a8b334',
    '#617202', '#7b8b24', '#a4b34c', '#a3c420',
    '#a7ba67', '#788c3b', '#a3c541', '#87aa23',
    '#799d10', '#7da437', '#62891c', '#98bf51',
    '#7ab52a', '#8cb860', '#64903a', '#83c351',
    '#86ab69', '#479925', '#52bb28', '#a1c293',
    '#5a794e', '#4d943a', '#7cc366', '#799a6d',
    '#53c74e', '#339e3f', '#549c56', '#48ca65',
    '#508a5a', '#77c28c', '#37ba6b', '#379460',
    '#78ad8f', '#34c78e', '#409d7a', '#37c4ae',
    '#4e998b', '#2e7b6e', '#6fbfb0', '#33d4d1',
    '#3fadaf', '#5da2a8', '#34c7dd', '#48a3ba',
    '#58b5e1', '#2178a3', '#6b93b1', '#5089b7',
    '#379ee7', '#81a7da', '#5d8dd1', '#5c6eac',
    '#6786e2', '#929ad3', '#577ef1', '#8c90dd',
    '#6c62f2', '#9275de', '#8b64e4', '#876dac',
    '#c2a5e9', '#aa7dd7', '#ad62f0', '#aa8cbb',
    '#ac80c6', '#b762de', '#cb84d4', '#b153bf',
    '#db77e6', '#cd49dc', '#ad56ab', '#e382db'
  ];

  /**
   * BC-877 Job Board - remember selected date
   */
  private jobboardSelectedDate = null;

  public buildMenu = new Subject<void>();
  public translateMenu = new Subject<void>();

  /**
   * BC-877 Job Board - Use Push to keep Request Tab count updated.
   * Job Board Tabs Page can subscribe to openRequestsSubject to get refreshed Request count
   * to display next to the Requests icon.
   */
  public openRequestsSubject = new Subject();
  private openRequests = 0;

  private visitorLogProjectId: number;

  private visitorQuestions = [
    {
      title: 'Customize this list of questions, or use the default quesitons provided',
      children: [],
      styles: { color: 'red', 'font-size': 'inherit', 'font-weight': '400' }
    },
  ];

  private pendingCheckInEntry: any;


  private bulkCheckInCollection: any[] = [];
  setBulkCheckIn(bulkcheckincollection: any[]): void {
    this.bulkCheckInCollection = bulkcheckincollection;
  }
  getBulkCheckInCollection(): any[] {
    return this.bulkCheckInCollection;
  }

  setPendingCheckInEntry(pendingentry) {
    this.pendingCheckInEntry = pendingentry;
  }
  getPendingCheckInEntry() {
    return this.pendingCheckInEntry;
  }

  setVisitorProject(project) {
    this.visitProject = Object.assign({}, project);
  }
  getVisitorProject(): any {
    return this.visitProject;
  }

  resetCrewState() {
    // console.log('resetting state');
    this.resetClockedInTimeEntry();
    this.resetClockedInBreakEntry();
    this.resetOTNeedsApprovalCollection();
    this.resetUpdateCostCodeCollection();
    this.setHttpCollection([]);
    this.resetStartedCollection();
    this.setTimecardDay(moment().format('YYYY-MM-DD'));
    this.setScheduleDateSelected(moment().format('YYYY-MM-DD'));
    this.setVisitorLogProjectId(null);
  }

  setCrewState(data) {
    const tenant = data[0]['data'];
    const user = data[1]['data'];

    if (data[2]) {
      this.setRefreshToken(data[2]);
    }

    this.setTenant(tenant);
    this.setUser(user);

    /**
     * BC-1223 Refactor User Settings
     */
    this.userprefs.set(user['person']['settingsTemplate'], tenant);

    this.buildMenu.next();

    this.showSideMenu(true);
  } // setCrewState

  /*
  * Default route depends on:
  * - canAccessModule()
  * - user.person.usesTimeClock
  * - user.person.onScheduleBoard
  * - network status
  */
  findDefaultRoute(): string {
    const canAccessTimeTrackingModule = this.canAccessModule('timeTrackingModule');
    const canAccessSchedulingModule = this.canAccessModule('schedulingModule');
    const user = this.currentUser;

    if (canAccessTimeTrackingModule && this.userprefs.get('usesTimeClock')) {
      return '/app/tabs/home';
    }
    if (this.network.getValue() === 'Online') {
      if (this.userprefs.get('onScheduleBoard')) {
        if (canAccessSchedulingModule) {
          return '/app/tabs/schedule';
        }
        return '/project';
      }
      return '/visitorlogproject';
    }
    this.presentToastButton('You are currently offline.', 'danger');
    return '/login';
  }

  setVisitorLogProjectId(projectId: number): void {
    this.visitorLogProjectId = projectId;
  }
  getVisitorLogProjectId(): number {
    return this.visitorLogProjectId;
  }

  updateNetworkStatus(connectionstatus: string) {
    this.network.next(connectionstatus);
  }

  translateDateStr(starttime) {
    const datestr = moment(starttime).format('dddd MMMM Do YYYY');
    const dateStrTokens = datestr.split(' ');
    const translationKeyDay = `TIMECARD.DAYS_OF_WEEK_CAMEL.${dateStrTokens[0].toUpperCase()}`;
    dateStrTokens[0] = this.getTranslation(translationKeyDay);
    const translationKeyMonth = `SCHEDULE.${dateStrTokens[1].toUpperCase()}`;
    dateStrTokens[1] = this.getTranslation(translationKeyMonth);

    return dateStrTokens.join(' ');
  }

  setOpenRequests(requests: number): void {
    this.openRequests = requests;
    this.openRequestsSubject.next(requests);
  }
  incrementOpenRequests() {
    const openRequestsAddOne = this.openRequests + 1;
    this.setOpenRequests(openRequestsAddOne);
  }
  decrementOpenRequests() {
    const openRequestsMinusOne = this.openRequests - 1;
    this.setOpenRequests(openRequestsMinusOne);
  }

  setJobboardSelectedDate(selecteddate: string): void {
    this.jobboardSelectedDate = selecteddate;
  }
  getJobboardSelectedDate(): string {
    return this.jobboardSelectedDate;
  }

  getDurationCollection() {
    return this.durationCollection;
  }

  getTranslation(index: string) {
    // let result = '';
    // console.log('crewapp state getTranslation ONE');

    return this.translate.instant(index);
    //   .subscribe(
    //     (res: string) => {
    //       console.log('crewapp state getTranslation TWO');
    //       result = res;
    //     },
    //     error => 'translation error'
    //   );

    // console.log('crewapp state getTranslation THREE');
    // return result;
  }

  /**
   * BC-853 - timecard - use alert for conflicts instead of toast, disable click-away to dismiss.
   */
  async presentAlert(optionsObj) {
    const alert = await this.alertController.create({
      header: optionsObj.header,
      subHeader: optionsObj.subHeader,
      message: optionsObj.message,
      buttons: ['OK'],
      backdropDismiss: false
    });

    await alert.present();
  }

  /**
   * BC-839 receipts & timecard unsaved changes - use 'ion-alert' instead of 'confirm'
   */
  async presentAlertConfirm(optionsObj) {
    let confirm = false;
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: optionsObj.header,
      // message: 'You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.',
      message: optionsObj.message,
      buttons: [
        {
          // text: 'Cancel',
          text: optionsObj.cancelBtnText,
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          // text: 'Ok',
          text: optionsObj.okBtnText,
          role: 'ok',
          handler: () => {
            alert.dismiss(true);
            return false;
          }
        }
      ]
    });

    await alert.present();
    await alert.onDidDismiss().then(result => {
      confirm = result.data === true;
    });

    return confirm;
  }

  changeDate(targetDateTime, oldDateTime) {
    const difference = moment(targetDateTime).startOf('day').diff(moment(oldDateTime).startOf('day'), 'days');
    const updatedDateTime = moment(oldDateTime).add(difference, 'days').utc().format();
    return updatedDateTime;
  }

  getMinutesCollection() {
    return this.minutesCollection;
  }
  getHoursCollection() {
    return this.hoursCollection;
  }

  setLastUrl(url: string) {
    this.lastUrl = url;
  }
  getLastUrl() {
    return this.lastUrl;
  }

  setResetPasswordEmail(email) {
    this.resetpasswordemail = email;
  }
  getResetPasswordEmail() {
    return this.resetpasswordemail;
  }

  getNextDay(dayname) {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const selectedDayIndex = daysOfWeek.findIndex(day => {
      return day === dayname;
    });
    if (selectedDayIndex !== -1) {
      if (selectedDayIndex === 6) {
        return daysOfWeek[0];
      } else {
        return daysOfWeek[selectedDayIndex + 1];
      }
    } else {
      return 'no day found';
    }
  }
  getWeekArrayFromStartDay(startday) {
    const weekarray = [];
    let day = startday;

    for (let i = 0; i < 7; i += 1) {
      weekarray.push(day);
      day = this.getNextDay(day);
    }

    return weekarray;
  }
  getWeekArrayFromStartDayShort(startday) {
    const weekarray = [];
    let day = startday;

    for (let i = 0; i < 7; i += 1) {
      weekarray.push(this.getShortDay(day));
      day = this.getNextDay(day);
    }

    return weekarray;
  }
  getShortDay(day) {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const selectedDayIndex = daysOfWeek.findIndex(theday => theday === day);
    return daysOfWeekShort[selectedDayIndex];
  }

  pushUpdateCostCodeCollection(costcodecollection) {
    this.updateCostCodeCollection = [...this.updateCostCodeCollection, ...costcodecollection];
  }
  getUpdateCostCodeCollection() {
    return this.updateCostCodeCollection;
  }
  resetUpdateCostCodeCollection() {
    this.updateCostCodeCollection = [];
  }

  pushOTNeedsApprovalCollection(overtimecollection) {
    this.OTNeedsApprovalCollection = [...this.OTNeedsApprovalCollection, ...overtimecollection];
  }
  getOTNeedsApprovalCollection() {
    return this.OTNeedsApprovalCollection;
  }
  resetOTNeedsApprovalCollection() {
    this.OTNeedsApprovalCollection = [];
  }

  setSelectedTime(selectedtime) {
    this.selectedTime = selectedtime;
  }
  getSelectedTime() {
    return this.selectedTime;
  }
  setHttpCollection(httpcollection) {
    this.httpCollectionOT = httpcollection;
  }
  getHttpCollection() {
    return this.httpCollectionOT;
  }

  getRateMultiplier(optionsObj) {
    return 1.5;
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  getRandomPresetColor() {
    const indexIntoPresetColors = this.getRandomInt(0, 99);
    return this.presetColors[indexIntoPresetColors];
  }

  public async presentToast(message: string, color = 'medium'): Promise<any> {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2000,
      showCloseButton: true
    });
    toast.present();
  }

  public async presentToastButton(message, color = 'medium') {
    const toast = await this.toastCtrl.create({
      message,
      color,
      showCloseButton: true,
      closeButtonText: 'OK',
      position: 'middle',
      animated: true,
    });
    toast.present();
  }

  public async presentLoading(message: string): Promise<any> {
    this.loading = await this.loadingCtrl.create({
      message
    });
    this.loading.present();
  }

  public dismissLoading(): void {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  cleanSpaces(string) {
    return string.trim().replace(/\s\s+/g, ' ');
  }

  numbersOnly(string) {
    return string.replace(/\D+/g, '');
  }

  setTimecardDay(daystr: string): void { // BC-473
    this.timecardDay = daystr;
  }
  getTimecardDay(): string { // BC-473
    return this.timecardDay;
  }

  setTimecardFix(timecard, day) {
    this.timecardFix = { timecard, day };
  }

  getTimecardFix() {
    return this.timecardFix;
  }

  getBadToken() {
    return this.badtoken;
  } // getBadToken()

  getBadRefreshToken() {
    return this.badrefreshtoken;
  } // getBadRefreshToken()

  resetStartedCollection() {
    this.startedCollection = [];
  }
  addStartedCollection(timeEntryObj) {
    this.startedCollection = [...this.startedCollection, timeEntryObj];
  } // addStartCollection

  getStartedCollection() {
    return this.startedCollection;
  }

  setRouteBackgroundColorSwitch(backgroundColorSwitch) {
    this.routeBackgroundColorSwitch = backgroundColorSwitch;
  }
  getRouteBackgroundColorSwitch() {
    return this.routeBackgroundColorSwitch;
  }
  setRouteProject(project) {
    this.routeProject = project;
  }
  getRouteProject() {
    return this.routeProject;
  }
  setRouteScheduleItemId(scheduleItemId: number): void {
    this.routeScheduleItemId = scheduleItemId;
  }
  getRouteScheduleItemId(): number {
    return this.routeScheduleItemId;
  }
  setRouteScheduleItem(scheduleItem: any): void {
    this.routeScheduleItem = scheduleItem;
  }
  getRouteScheduleItem(): any {
    return this.routeScheduleItem;
  }

  // BC-435
  setClockAction(action: string): void {
    this.clockAction = action;
  }
  getClockAction(): string {
    return this.clockAction;
  }

  // BC-434
  showSideMenu(show: boolean): void {
    this.sideMenu.next(show);
  }

  createTimerString(seconds: number): string {
    if (seconds < 86400) { // 24 hours
      // 23:59:59 is the limit of the moment() time string
      return moment().startOf('day').add(seconds, 'seconds').format('HH:mm:ss');

    } else {
      // create a custom string for times >= 24 hours
      const HH = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mm = Math.floor(seconds % 3600 / 60).toString().padStart(2, '0');
      const ss = Math.round(seconds % 3600 % 60).toString().padStart(2, '0');
      return `${HH}:${mm}:${ss}`;
    }
  } // createTimerString

  setSecondsToZero(dateTime: string): string {
    return moment(moment(dateTime).format('YYYY-MM-DD HH:mm')).utc().format();
  }

  setFirstStart(firstClockIn) {
    this.firstClockIn.clockedIn = firstClockIn.clockedIn;
    this.firstClockIn.startDateTime = firstClockIn.startDateTime;
  }
  getFirstStart() {
    return this.firstClockIn;
  }

  setProjectDetailBack(url) {
    this.projectDetailBack = url;
  }
  getProjectDetailBack() {
    return this.projectDetailBack;
  }

  setLastEndDateTime(endDateTime) {
    this.lastEndDateTime = endDateTime;
  }
  getLastEndDateTime() {
    return this.lastEndDateTime;
  }

  getAppVersion(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.stateAppVersion) {
        resolve(this.stateAppVersion);
      } else {
        this.platform.ready().then(() => {
          if (this.platform.is('cordova')) {
            this.appVersionUtil.getVersionNumber().then(result => {
              this.stateAppVersion = result;
              resolve(this.stateAppVersion);
            }).catch(error => {
              console.log('Error with getVersionNumber():::', error);
              this.stateAppVersion = 'browser';
              resolve(this.stateAppVersion);
            });
          } else {
            this.stateAppVersion = 'browser';
            resolve(this.stateAppVersion);
          }
        });
      }
    });
  }

  getAppPlatform(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.stateAppPlatform) {
        resolve(this.stateAppPlatform);
      } else {
        this.platform.ready().then(() => {
          if (this.platform.is('ios')) {
            this.stateAppPlatform = 'ios';
          } else {
            this.stateAppPlatform = 'android';
          }
          resolve(this.stateAppPlatform);
        });
      }
    });
  }

  setBreakHoursBooked(hours: number): void {
    this.breakHoursBooked = hours;
  }

  setHoursBooked(hours: number): void {
    this.hoursBooked = hours;
  }

  setSecondsBooked(seconds: number): void {
    this.secondsBooked = seconds;
  }
  getSecondsBooked(): number {
    return this.secondsBooked;
  }

  setBreakSecondsBooked(seconds: number): void {
    this.breakSecondsBooked = seconds;
  }
  getBreakSecondsBooked(): number {
    return this.breakSecondsBooked;
  }

  setClockoutMiles(miles: number): void {
    this.miles = miles || 0;
  }
  getClockoutMiles(): number {
    return this.miles;
  }
  /**
   * BC-912 clock out/switch jobs - select multiple cost codes
   */
  pushMultiTimeEntryCollection(timeentry) {
    // console.log('[crewapp-state] pushMultiTimeEntryCollection - timeentry::: ', timeentry);
    this.multiTimeEntryCollection.push(timeentry);
  }
  getMultiTimeEntryCollection() {
    return this.multiTimeEntryCollection;
  }

  updateMultiEntryCollection(entry) {
    const selectedIndex = this.multiTimeEntryCollection.findIndex(item => {
      return item.timeEntryId === entry.timeEntryId;
    });
    if (selectedIndex !== -1) {
      this.multiTimeEntryCollection[selectedIndex].approvedById = entry.approvedById;
      this.multiTimeEntryCollection[selectedIndex].description = entry.description;
    }
  }
  resetMultiTimeEntryCollection() {
    this.multiTimeEntryCollection = [];
  }
  setCurrentTimeEntryPutObj(putobj) {
    this.currentTimeEntryPutObj = putobj;
  }
  setClockoutCostCodeCollection(costCodeCollection: number[]): void {
    this.clockoutCostCodeCollection = costCodeCollection;
  }
  getCurrentTimeEntryPutObj() {
    return this.currentTimeEntryPutObj;
  }
  getClockoutCostCodeCollection() {
    return this.clockoutCostCodeCollection;
  }

  setTimeEntryNotes(note: string) {
    this.timeEntryNotes = note;
  }
  getTimeEntryNotes(): string {
    return this.timeEntryNotes;
  }

  setTimeEntryImages(images: any[]) {
    this.timeEntryImages = images;
  }
  getTimeEntryImages(): any[] {
    return this.timeEntryImages;
  }

  setClockoutCostCode(costCodeId: number): void {
    this.clockoutCostCode = costCodeId;
  }
  getClockoutCostCode(): number {
    return this.clockoutCostCode;
  }

  calcEntryHours(startDateTime: string, endDateTime: string, isBreakEntry = false): number {
    const entrySeconds = moment(endDateTime).diff(moment(startDateTime), 'seconds');
    if (entrySeconds === 0) {
      return 0;
    } else {
      const grandTotalSeconds = entrySeconds + (!isBreakEntry ? this.secondsBooked : this.breakSecondsBooked);
      const roundedHoursBooked = !isBreakEntry ? this.hoursBooked : this.breakHoursBooked;
      const netEntryHours = (grandTotalSeconds / 3600) - roundedHoursBooked;
      return Math.round(netEntryHours * 100) / 100;
    }
  }

  selectedTimeIsOk(selectedDateTime: string, earliestDateTime: string, defaultEndDayMoment = null): boolean {
    const latestMoment = defaultEndDayMoment ? defaultEndDayMoment : moment();
    if (moment(selectedDateTime).isAfter(latestMoment)) {
      this.presentToastButton('Select a time before ' + latestMoment.format('h:mm a'), 'danger');
      return false;
    }
    if (moment(selectedDateTime).isBefore(moment(earliestDateTime))) {
      this.presentToastButton('Select a time after ' + moment(earliestDateTime).format('h:mm a'), 'danger');
      return false;
    }
    return true;
  } // selectedTimeIsOk

  setHomeSelectTimeTitle(title) {
    this.homeSelectTimeTitle = title;
  }
  getHomeSelectTimeTitle() {
    return this.homeSelectTimeTitle;
  }

  setHomeSelectTimeGoBack(goback) {
    this.homeSelectTimeGoBack = goback;
  }
  getHomeSelectTimeGoBack() {
    return this.homeSelectTimeGoBack;
  }

  setHomeSelectGoBack(goback) {
    this.homeSelectGoBack = goback;
  }
  getHomeSelectGoBack() {
    return this.homeSelectGoBack;
  }

  setCsiCollection(csiCollection) {
    this.csiCollection = csiCollection;
  }

  getCsiCollection() {
    return this.csiCollection;
  }

  /*---------- Clock In Break Clock Out ----------*/
  setClockedInBreakEntry(breakentry) {
    this.clockedInBreakEntry = breakentry;
  }

  getClockedInBreakEntry() {
    return this.clockedInBreakEntry;
  }
  /**
   * BC-751 Reset State on Logout
   */
  resetClockedInBreakEntry() {
    this.clockedInBreakEntry = null;
  }

  setClockedInTimeEntry(timeentry) {
    this.clockedInTimeEntry = timeentry;
  }

  getClockedInTimeEntry() {
    return this.clockedInTimeEntry;
  }
  /**
   * BC-751 Reset State on Logout
   */
  resetClockedInTimeEntry() {
    this.clockedInTimeEntry = null;
  }
  /*---------- Clock In Break Clock Out ----------*/

  setReceiptViewModel(model) {
    this.receiptViewModel = model;
  }

  getReceiptViewModel() {
    return this.receiptViewModel;
  }

  getScheduleDateSelected() {
    return this.scheduleDateSelected;
  }

  setScheduleDateSelected(scheduledate) {
    this.scheduleDateSelected = scheduledate;
  }

  setIdToken(idToken: string): void {
    this.idToken = idToken;
  }

  setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
  }

  getRefreshToken(): string {
    return this.refreshToken;
  }

  setSubsciptionStatus(status) {
    this.currentTenant['subscriptionStatus'] = status;
  }

  setTenant(tenant) {
    tenant['currentProducts'] = tenant['currentProducts'] ? JSON.parse(tenant['currentProducts']) : {} ;

    tenant['visitorQuestions'] = JSON.parse(tenant['visitorQuestions']);
    tenant['visitorInputs'] = JSON.parse(tenant['visitorInputs']);

    this.currentTenant = tenant;
  }

  getTenant() {
    return this.currentTenant;
  }

  setUser(user) {
    user.title = `${user.person.firstName} ${user.person.lastName}`;
    this.currentUser = user;
  }

  getUser() {
    return this.currentUser;
  }

  getIdToken(): string {
    return this.idToken;
  }

  setUserName(name) {
    this.user.name = name;
  }

  getUserName() {
    return this.user.name;
  }

  okToChooseScheduleItem(scheduleItems, currentTimeEntry) {
    /**
     * BC-731 switch jobs - go directly to other projects if the only scheduled job is the same as the current one
     */
    if (scheduleItems.length > 0) {
      if (scheduleItems.length > 1) {
        return true;
      } else {
        if (scheduleItems[0].scheduleItemId === currentTimeEntry.scheduleItemId) {
          return false;
        } else {
          return true;
        }
      }
    } else {
      return false;
    }
  } // okToChooseScheduleItem

  makeCounterZero() {
    let counter = -1;

    return () => {
      return ++counter;
    };
  }

  /**
   * BC-908 Translate to Spanish
   */
  getMonthName(month_number) {
    let result = '';

    switch (month_number) {
      case 0:
        result = this.getTranslation('SCHEDULE.JANUARY');
        break;
      case 1:
        result = this.getTranslation('SCHEDULE.FEBRUARY');
        break;
      case 2:
        result = this.getTranslation('SCHEDULE.MARCH');
        break;
      case 3:
        result = this.getTranslation('SCHEDULE.APRIL');
        break;
      case 4:
        result = this.getTranslation('SCHEDULE.MAY');
        break;
      case 5:
        result = this.getTranslation('SCHEDULE.JUNE');
        break;
      case 6:
        result = this.getTranslation('SCHEDULE.JULY');
        break;
      case 7:
        result = this.getTranslation('SCHEDULE.AUGUST');
        break;
      case 8:
        result = this.getTranslation('SCHEDULE.SEPTEMBER');
        break;
      case 9:
        result = this.getTranslation('SCHEDULE.OCTOBER');
        break;
      case 10:
        result = this.getTranslation('SCHEDULE.NOVEMBER');
        break;
      case 11:
        result = this.getTranslation('SCHEDULE.DECEMBER');
        break;
    }

    return result;
  } // getMonthName

  empty(str) {
    if (typeof str === 'undefined' || !str || str.length === 0 || str === '' ||
      !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, '') === '') {
      return true;
    } else {
      return false;
    }
  }

  canAccessModule(targetModuleName) {
    /**
     * BC-1184 Restrict access to modules based on subscribed products and subscription status.
     *
     * Subscription Status possible values:
     *  'free', 'trial' : all access to all features, ignore value of tenant currentProducts.
     *
     *  'post_trial', 'past_due_expired', 'terminated : only able to access “free” features.
     *
     *  'paid', 'past_due', 'requires_payment_method', 'scheduled_to_be_cancelled' : can access "free" and tenant currentProducts.
     *
     */
    const subscriptionStatus = this.currentTenant !== undefined ? this.currentTenant['subscriptionStatus'] : null;

     if (subscriptionStatus === 'free' || subscriptionStatus === 'trial') {
      /**
       * Access to all features. We can ignore tenant currentProducts.
       *
       * We can return true and exit.
       */
      return true;
     }

     if (subscriptionStatus === 'terminated' || subscriptionStatus === 'post_trial' || subscriptionStatus === 'past_due_expired') {
      /**
       * ‘post_trial’ || 'past_due_expired'  || ‘terminated’.
       *
       * We are only able to access “free” features. We can ignore tenant currentProducts.
       *
       * So we exit and return false.
       */

      return false;
     }

    /**
     * We do not have "free" access to all modules. So we need to check if the target module is one
     * of our purchased modules.
     */
    if (this.currentTenant !== undefined && !this.currentTenant['currentProducts'][targetModuleName]) {
      /**
       * We cannot find this module.
       *
       * So we can return false and exit.
       */
      return false;

    } else {
      /**
       * User is trying to access a "paid" module. We need to check their subscription status.
       */
      if (subscriptionStatus === 'paid' || subscriptionStatus === 'past_due' || subscriptionStatus === 'requires_payment_method' || subscriptionStatus === 'scheduled_to_be_cancelled') {
        /**
         * User has paid for access to the target module.
         *
         * So we can return true and exit.
         */
        return true;
      }
    } // if (!targetInCurrentProducts)

    return false;
  } // canAccessModule()

  setWeekLengthOvertimeTrigger(regularHours: number) {
    this.weekLengthTriggersOvertime.trigger = true;
    this.weekLengthTriggersOvertime.regularHours = regularHours;
  }
  getWeekLengthOvertimeTrigger() {
    return this.weekLengthTriggersOvertime;
  }
  setUnsignedTimecardCollection(unsignedtimecardcollection) {
    this.unsignedTimecardCollection = unsignedtimecardcollection;
  }
  getUnsignedTimecardCollection() {
    return this.unsignedTimecardCollection;
  }

  async getTimesheetWorkHours() {
    const clockedInTimeEntry = this.getClockedInTimeEntry();
    const workStartMoment = this.clockedInTimeEntry ? moment(this.clockedInTimeEntry.startDateTime) : moment();
    const localstoragetimesheetRaw = await this.crewsecurestorage.get('timesheet');
    let localstoragetimesheet = null;
    if (localstoragetimesheetRaw) {
      localstoragetimesheet = localstoragetimesheetRaw['data'];
    }

    let regularHoursTotal = 0;
    const timeZone = this.getTenant()['timeZone'];

    if (localstoragetimesheetRaw) {
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        .forEach(oneday => {
          const time_entries = localstoragetimesheet['workDays'][oneday]['timeEntries'];
          time_entries.forEach(timeentry => {
            if (!timeentry['rateMultiplier']) {
              timeentry.rateMultiplier = 1;
            }
            // const isToday = moment(timeentry['startDateTime']).tz(timeZone).isSame(workStartMoment.tz(timeZone), 'day');
            if ((timeentry['rateMultiplier'] === 1) && !timeentry['breakEntry'] && timeentry['endDateTime']) {
              regularHoursTotal += timeentry.hours;
            }
          });
        });
    }

    return regularHoursTotal;
  } // getTimesheetWorkHours()
} // CrewAppState
