import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WeekviewComponent } from './weekview/weekview';
import { DayComponent } from './day/day';
import { TimerComponent } from './timer/timer';
import { IonicModule } from '@ionic/angular';

/**
 * BC-673 reset password - give feedback about password requirements
 */
import { PasswordStrengthComponent } from './password-strength/password-strength.component';
import { EmployeeListModalComponent } from './employee-list-modal/employee-list-modal.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule.forRoot()
  ],

  declarations: [
    WeekviewComponent,
    DayComponent,
    TimerComponent,
    PasswordStrengthComponent,
    EmployeeListModalComponent
  ],

  exports: [
    WeekviewComponent,
    DayComponent,
    TimerComponent,
    PasswordStrengthComponent
  ],

  entryComponents: [
    EmployeeListModalComponent
  ]
})
export class ComponentsModule { }
