import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/checkidtoken',
    pathMatch: 'full'
  },

  {
    path: 'visitorlogproject',
    children: [
      {
        path: '',
        loadChildren: './pages/visitorlogproject/visitorlogproject.module#VisitorlogprojectModule'
      }
    ]
  },

  {
    path: 'visitorloglist',
    children: [
      {
        path: '',
        loadChildren: './pages/visitorloglist/visitorloglist.module#VisitorloglistModule'
      }
    ]
  },

  {
    path: 'visitorlog',
    children: [
      {
        path: '',
        loadChildren: './pages/visitorlog/visitorlog.module#VisitorlogModule'
      }
    ]
  },

  {
    path: 'choosejobboard',
    children: [
      {
        path: '',
        loadChildren: './pages/choosejobboard/choosejobboard.module#ChooseJobboardModule'
      }
    ]
  },

  {
    path: 'projectboard',
    children: [
      {
        path: '',
        loadChildren: './pages/projectboard/projectboard.module#ProjectBoardModule'
      }
    ]
  },

  {
    path: 'requestboard',
    children: [
      {
        path: '',
        loadChildren: './pages/requestboard/requestboard.module#RequestBoardModule'
      }
    ]
  },

  {
    path: 'jobboard',
    children: [
      {
        path: '',
        loadChildren: './pages/jobboard/jobboard.module#JobboardModule'
      }
    ]
  },

  {
    path: 'localstorage',
    children: [
      {
        path: '',
        loadChildren: './pages/localstorage/localstorage.module#LocalStorageModule'
      }
    ]
  },

  {
    path: 'project',
    children: [
      {
        path: '',
        loadChildren: './pages/project/project.module#ProjectModule'
      }
    ]
  },

  {
    path: 'project/:projectId',
    children: [
      {
        path: '',
        loadChildren: './pages/project-detail/project-detail.module#ProjectDetailModule'
      }
    ]
  },

  {
    path: 'checkidtoken',
    children: [
      {
        path: '',
        loadChildren: './pages/checkidtoken/checkidtoken.module#CheckIdTokenModule'
      }
    ]
  },

  {
    path: 'login',
    children: [
      {
        path: '',
        loadChildren: './pages/login/login.module#LoginModule'
      }
    ]
  },

  {
    path: 'signupwarn',
    children: [
      {
        path: '',
        loadChildren: './pages/sign-up-warn/sign-up-warn.module#SignUpWarnModule'
      }
    ]
  },

  {
    path: 'signup',
    children: [
      {
        path: '',
        loadChildren: './pages/sign-up/sign-up.module#SignUpModule'
      }
    ]
  },

  {
    path: 'updateapp',
    children: [
      {
        path: '',
        loadChildren: './pages/updateapp/updateapp.module#UpdateAppModule'
      }
    ]
  },

  {
    path: 'resetpassword',
    children: [
      {
        path: '',
        loadChildren: './pages/reset-password/reset-password.module#ResetPasswordModule'
      }
    ]
  },

  {
    path: 'resetcode',
    children: [
      {
        path: '',
        loadChildren: './pages/reset-code/reset-code.module#ResetCodeModule'
      }
    ]
  },

  {
    path: 'account',
    loadChildren: './pages/account/account.module#AccountModule'
  },

  {
    path: 'language',
    loadChildren: './pages/language/language.module#LanguageModule'
  },

  {
    path: 'app',
    loadChildren: './pages/tabs-page/tabs-page.module#TabsModule'
  },

  {
    path: 'jobboard',
    loadChildren: './pages/jobboard-tabs-page/jobboard-tabs-page.module#JobboardTabsModule'
  },

  {
    path: 'crew-status',
    loadChildren: './pages/crew-status/crew-status.module#CrewStatusPageModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
