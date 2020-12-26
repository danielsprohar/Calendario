import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PaginatedResponse } from 'src/app/models/paginated-response.model';
import { DataService } from 'src/app/services/data.service';
import { CalendarEvent } from '../models/calendar-event';
import { WeekViewRenderer } from '../renderers/week-view-renderer';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss'],
  providers: [WeekViewRenderer],
})
export class WeekViewComponent implements OnInit, OnDestroy {
  private dateSubscription: Subscription;
  private eventsSubscription: Subscription;

  public events: CalendarEvent[];

  constructor(
    private readonly calendar: CalendarService,
    private readonly view: WeekViewRenderer,
    private readonly data: DataService<CalendarEvent>,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.view.renderTimezoneOffset();
    this.view.initCalendar();

    this.dateSubscription = this.calendar
      .getDateAsObservable()
      .subscribe((date: Date) => {
        this.view.renderHeader(date);
        this.fetchEvents(date);
      });
  }

  ngOnDestroy(): void {
    if (this.dateSubscription) {
      this.dateSubscription.unsubscribe();
    }
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  /**
   * Fetchs all the events of the given week in which the given date resides.
   * @param date The date of interest.
   */
  private fetchEvents(date: Date): void {
    const startDate = this.calendar.getFirstDateOfWeek(date);
    const endDate = this.calendar.addOneWeek(startDate);
    const params = new HttpParams({
      fromObject: {
        startDate: startDate.getTime().toString(),
        endDate: endDate.getTime().toString(),
      },
    });

    this.eventsSubscription = this.data
      .getAll('/events', params)
      .subscribe((res: PaginatedResponse<CalendarEvent>) => {
        this.events = res.data;
        this.view.renderEvents(this.events);
      });
  }
}
