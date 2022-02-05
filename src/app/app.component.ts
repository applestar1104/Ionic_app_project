import { Component, OnInit, ViewEncapsulation, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Events, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CrewAppRest } from './providers/crewapp-rest';
import { CrewAppState } from './providers/crewapp-state'; // BC-434
import { environment } from '../environments/environment';
import * as moment from 'moment'; // BC-751 Reset State
import { Network } from '@ionic-native/network/ngx';
import { Subscription } from 'rxjs';
import { CrewSecureStorage } from './providers/secure-storage.service';
import { UserPrefsService } from './providers/user-prefs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  public menuYes: boolean; // BC-432
  public localAppVersion: string; // BC-432
  public appPages: any[] = [];
  public stage = environment.stage;

  loggedIn = false;

  private disconnectSubscription: Subscription;
  private connectSubscription: Subscription;

  public canAccessTimeTrackingModule: boolean;
  public canAccessSchedulingModule: boolean;

  public onScheduleBoard: boolean;
  public usesTimeClock: boolean;

  constructor(
    private events: Events,
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private crewapprest: CrewAppRest,
    private translate: TranslateService,
    private crewappstate: CrewAppState,
    private cdr: ChangeDetectorRef,
    private network: Network,
    private crewsecurestorage: CrewSecureStorage,
    private userprefs: UserPrefsService,
  ) {
    this.initializeApp();
    this.translate.setDefaultLang('en');

    this.crewappstate.getAppVersion().then(result => {
      this.localAppVersion = result;
    });

    this.crewappstate.setJobboardSelectedDate(moment().format('YYYY-MM-DD'));
  }

  ngAfterViewInit() {
    this.router.events
      .subscribe({
        next: (event) => {
          if (event instanceof NavigationEnd) {
            this.crewappstate.setLastUrl(event.urlAfterRedirects);
          }
        }
      });
  }

  ngOnInit() {
    this.crewappstate.buildMenu.subscribe(() => {
      this.onScheduleBoard = this.userprefs.get('onScheduleBoard') as boolean;
      this.usesTimeClock = this.userprefs.get('usesTimeClock') as boolean;
      this.canAccessTimeTrackingModule = this.crewappstate.canAccessModule('timeTrackingModule');
      this.canAccessSchedulingModule = this.crewappstate.canAccessModule('schedulingModule');

      this.appPages = [];

      const user = this.crewappstate.getUser();

      if (this.userprefs.get('editsVisitors')) {
        this.appPages.push({
          nickname: 'attendance',
          title: this.crewappstate.getTranslation('MENU.SITE_ATTENDANCE'),
          titleRef: 'MENU.SITE_ATTENDANCE',
          url: '/visitorlogproject',
          icon: 'clipboard',
          lock: false,
        });
      }

      if (this.usesTimeClock || this.onScheduleBoard) {
        let url = '/app/tabs/home';
        let titleRef = 'MENU.TIME_ENTRY';
        let lock = !this.canAccessTimeTrackingModule;
        if (!this.usesTimeClock || (lock && this.onScheduleBoard && this.canAccessSchedulingModule)) {
          url = '/app/tabs/schedule';
          titleRef = 'MENU.MY_SCHEDULE';
          lock = !this.canAccessSchedulingModule;
        }
        this.appPages.push({
          nickname: 'timeTracking',
          title: this.crewappstate.getTranslation(titleRef),
          titleRef,
          url,
          icon: 'clock',
          lock,
        });
      }

      if (this.userprefs.get('viewsScheduleBoard')) {
        this.appPages.push({
          nickname: 'scheduling',
          title: this.crewappstate.getTranslation('MENU.SCHEDULING'),
          titleRef: 'MENU.SCHEDULING',
          url: '/jobboard/jobboardtabs/employeeview',
          icon: 'calendar',
          lock: !this.canAccessSchedulingModule,
        });
      }

      this.appPages.push({
        nickname: 'projects',
        title: this.crewappstate.getTranslation('MENU.PROJECTS'),
        titleRef: 'MENU.PROJECTS',
        url: '/project',
        icon: 'folder',
        lock: false,
      });

      if (this.userprefs.get('viewsScheduleBoard')) {
        this.appPages.push({
          nickname: 'crewStatus',
          title: this.crewappstate.getTranslation('MENU.CREW_STATUS'),
          titleRef: 'MENU.CREW_STATUS',
          url: '/crew-status',
          icon: 'eye',
          lock: !this.canAccessSchedulingModule,
        });
      }

      if (this.stage === 'dev') {
        this.appPages.push({
          nickname: 'storage',
          title: 'Dev Tools',
          titleRef: null,
          url: '/localstorage',
          icon: 'logo-buffer',
          lock: false,
        });
      }
    });

    this.crewappstate.translateMenu.subscribe(() => {
      this.appPages.map(page => {
        return page.title = page.titleRef ? this.crewappstate.getTranslation(page.titleRef) : page.title;
      });
    });

    this.menuYes = false;

    // BC-434
    this.crewappstate.sideMenuState$
      .subscribe(showSideMenu => {
        this.menuYes = showSideMenu;
        this.cdr.detectChanges();
      });

    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.crewappstate.presentToast('Internet disconnected', 'danger');
      this.crewappstate.updateNetworkStatus('Offline');
      // this.router.navigateByUrl('/checkidtoken');
      this.crewappstate.dismissLoading();
    }, err => {
      this.crewappstate.presentToast('Network onDisconnect error.', 'danger');
    });

    this.connectSubscription = this.network.onConnect().subscribe(() => {
      this.crewappstate.presentToast('Internet reconnected', 'success');
      this.crewappstate.updateNetworkStatus('Online');
      // this.crewprocesslocalstorage.processLocalStorageVisits().then(() => {
      // this.router.navigateByUrl('/checkidtoken');
      // });
    }, err => {
      this.crewappstate.presentToast('Network onConnect error.', 'danger');
    });

  } // ngOnInit().

  ngOnDestroy() {
    if (this.disconnectSubscription) {
      this.disconnectSubscription.unsubscribe();
    }

    if (this.connectSubscription) {
      this.connectSubscription.unsubscribe();
    }
  } // ngOnDestroy

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  async logout() {
    this.crewappstate.showSideMenu(false);
    this.crewappstate.resetCrewState();
    this.crewapprest.resetMemoizedCollections();
    const language = await this.crewsecurestorage.get('language');
    await this.crewsecurestorage.clear();
    await this.crewsecurestorage.set('language', language);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
