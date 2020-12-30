import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PaginatedResponse } from 'src/app/models/paginated-response.model';
import { DataService } from 'src/app/services/data.service';
import { EventDetailsComponent } from '../event-details/event-details.component';
import { CalendarEvent } from '../models/calendar-event';
import { WeekViewRenderer } from '../renderers/week-view-renderer';
import {
  CalendarService,
  millisecondsPerHour,
} from '../services/calendar.service';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss'],
  providers: [WeekViewRenderer],
})
export class WeekViewComponent implements OnInit, OnDestroy {
  private dateSubscription: Subscription;
  private eventsSubscription: Subscription;
  private dialogSubscription: Subscription;

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
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }

  // =========================================================================
  //
  // =========================================================================

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

  /**
   * Updates the event in the calendar.
   * @param event The event details
   */
  private updateEvent(event: CalendarEvent): void {
    console.log(event);
    // TODO: Update the event in the calendar.
  }

  /**
   * Creates a new event in the calendar
   */
  private createEvent(date: Date): void {
    date = new Date(date);
    const dialogRef = this.dialog.open(EventDetailsComponent, {
      data: new CalendarEvent({
        startDate: date,
        endDate: new Date(date.getTime() + millisecondsPerHour),
      }),
      maxHeight: '95%',
      height: 'fit-content',
    });

    this.dialogSubscription = dialogRef
      .afterClosed()
      .subscribe((result: CalendarEvent) => {
        if (result) {
          this.view.renderEvent(result);
          this.events.push(result);
        }
      });
  }

  /**
   * Parses the cell `id` for the selected date
   * in which the new event should be created.
   * @param id The id value of the selected cell inside the calendar
   */
  private getDateFromId(id: string): Date {
    let date = new Date(this.calendar.getDate());
    const tokens = id.split('-');
    if (!tokens) {
      throw new Error('Invalid format for cell "id"');
    }

    try {
      const day = +tokens[0];
      const hour = +tokens[1];
      date = new Date(date.setDate(date.getDate() + day));
      date = this.calendar.setZeroHour(date);
      date.setHours(hour);
      return date;
    } catch (e) {
      // Invalid cast exception when casting the strings to numbers
      throw new Error('Invalid "id" values');
    }
  }

  // =========================================================================
  // Action handlers
  // =========================================================================

  /**
   * Open a dialog with the selected event passed as the `data` field
   * to the `EventDetailsComponent`.
   * @param event The event that is selected by the user.
   */
  public openDialog(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.className === 'cell') {
      this.createEvent(this.getDateFromId(target.id));
    } else if (
      target.className === 'event' ||
      target.className === 'event-details'
    ) {
      const selectedEvent = this.events.find(
        (e) => e.id === target.parentElement?.id
      );

      const dialogRef = this.dialog.open(EventDetailsComponent, {
        data: selectedEvent,
        maxHeight: '95%',
        height: 'fit-content',
      });

      this.dialogSubscription = dialogRef
        .afterClosed()
        .subscribe((result: CalendarEvent) => {
          if (result) {
            this.updateEvent(result);
          }
        });
    }
  }
}
