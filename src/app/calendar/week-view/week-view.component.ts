import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { WeekViewRenderer } from '../renders/week-view-renderer';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss'],
  providers: [WeekViewRenderer],
})
export class WeekViewComponent implements OnInit, OnDestroy {
  private dateSubscription: Subscription;

  constructor(
    private readonly calendar: CalendarService,
    private readonly view: WeekViewRenderer,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.view.renderTimezoneOffset();
    this.view.initCalendar();

    this.dateSubscription = this.calendar
      .getDateAsObservable()
      .subscribe((date: Date) => {
        this.view.renderHeader(date);
      });
  }

  ngOnDestroy(): void {
    if (this.dateSubscription) {
      this.dateSubscription.unsubscribe();
    }
  }
}
