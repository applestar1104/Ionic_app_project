import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'bc-day',
  styleUrls: ['day.scss'],
  templateUrl: 'day.html'
})
export class DayComponent {
  @Input() shortname: string;
  @Input() longname: string;
  @Input() dayOfWeek: number;
  @Input() count: number;
  @Input() selected: boolean;
  @Input() isToday: boolean;
  @Input() alert: boolean;
  @Input() available: boolean;
  // When I get clicked on I emit a custom event - "dayofweek".
  @Output() dayofweek: EventEmitter<any> = new EventEmitter();

  constructor() { }

  sendDay() {
    // console.log('sending day::: ', this.longname);
    this.dayofweek.emit(this.longname);
  }

}
