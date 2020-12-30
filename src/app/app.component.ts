import { Component, OnInit } from '@angular/core';
import { CalendarService } from './calendar/services/calendar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private readonly calendar: CalendarService) {}

  ngOnInit(): void {
    this.calendar.setDate(this.calendar.getFirstDateOfWeek(new Date()));
  }
}
