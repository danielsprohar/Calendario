import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WeekViewBuilder } from '../builders/week-view-builder';
import { CalendarService } from '../services/calendar.service';

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
    this.vb.renderTimezoneOffset();
    this.vb.renderHeader();
    this.vb.renderCalendar();
  }
}
