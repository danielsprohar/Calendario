import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarService } from 'src/app/services/calendar.service';
import { WeekViewBuilder } from '../builders/week-view-builder';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss'],
  providers: [WeekViewBuilder],
})
export class WeekViewComponent implements OnInit {
  constructor(
    private readonly calendar: CalendarService,
    private readonly vb: WeekViewBuilder,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.vb.buildTimezoneOffset();
    this.vb.buildCalendar();
  }
}
