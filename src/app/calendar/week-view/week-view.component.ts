import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WeekViewBuilder } from '../builders/week-view-builder';
import { WeekViewRenderer } from '../renders/week-view-renderer';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss'],
  providers: [WeekViewRenderer],
})
export class WeekViewComponent implements OnInit {
  constructor(
    private readonly calendar: CalendarService,
    private readonly view: WeekViewRenderer,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.view.renderTimezoneOffset();
    this.view.renderHeader();
    this.view.renderCalendar();
  }
}
