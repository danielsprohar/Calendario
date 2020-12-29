import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import {
  CalendarEvent,
  defaultOccurrence,
  repeats,
  statuses,
} from '../models/calendar-event';
import {
  CalendarService,
  millisecondsPerHour,
} from '../services/calendar.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  private dataSubscription: Subscription;
  private readonly today = new Date();
  private readonly defaultStartTime: string = this.getTime();
  private readonly defaultEndTime: string = this.getEndTime();
  private readonly defaultRepeats = 'Does not repeat';
  private readonly defaultStatus = 'busy';

  public readonly repeatsOptions = repeats;
  public readonly statusOptions = statuses;
  public form: FormGroup;

  constructor(
    private readonly calendar: CalendarService,
    private readonly fb: FormBuilder,
    private dataService: DataService<CalendarEvent>,
    public dialogRef: MatDialogRef<EventDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CalendarEvent
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.data) {
      this.setFormFields(this.data);
    }
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  /**
   * Extracts the time portion from the given `date` value.
   *
   * If a date is not provided, then a new `Date` will be created and used.
   * @param date The date of interest
   */
  private getTime(date?: Date): string {
    date = date ?? new Date();
    return date.toLocaleTimeString('default', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Adds one hour to the start date and returns a new instance of a `Date`.
   *
   * This method is used to render the default `end time` in the form field
   * when the user opens the dialog.
   * @param startDate The start date
   */
  private getEndTime(startDate: Date = new Date()): string {
    const endDate = new Date(startDate.getTime() + millisecondsPerHour);
    return endDate.toLocaleTimeString('default', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Creates a new `FormGroup` object and initializes the form with default values.
   */
  private initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(512)]],
      startDate: [this.today, [Validators.required]],
      startTime: [this.defaultStartTime, [Validators.required]],
      endDate: [this.today, [Validators.required]],
      endTime: [this.defaultEndTime, [Validators.required]],
      status: [this.defaultStatus, [Validators.required]],
      isAllDay: [false],
      repeats: [this.defaultRepeats, [Validators.required]],
      description: ['', [Validators.maxLength(2048)]],
    });
  }

  /**
   * Set the form field values with the given event data.
   * @param e The calendar event
   */
  private setFormFields(e: CalendarEvent): void {
    this.title?.setValue(e.title);
    this.startDate?.setValue(e.startDate);
    this.endDate?.setValue(e.endDate);
    this.isAllDay?.setValue(e.isAllDay);
    this.repeats?.setValue(e.repeats);
    this.description?.setValue(e.description);

    if (this.calendar.isAllDayEvent(e)) {
      // Must be an all-day event
      this.startTime?.setValue(null);
      this.endTime?.setValue(null);
      this.isAllDay?.setValue(true);
      this.toggleDatetimeFields(true);
      return;
    }
    if (e.startDate) {
      this.startTime?.setValue(this.getTime(new Date(e.startDate)));
    }
    if (e.endDate) {
      this.endTime?.setValue(this.getTime(new Date(e.endDate)));
    }
  }

  /**
   * Clears all data from the form.
   */
  private resetForm(): void {
    for (const ctrl of Object.entries(this.form.controls)) {
      ctrl[1].setValue(null);
    }
  }

  // =========================================================================
  // Getters
  // =========================================================================

  get title(): AbstractControl | null {
    return this.form.get('title');
  }

  get startDate(): AbstractControl | null {
    return this.form.get('startDate');
  }

  get startTime(): AbstractControl | null {
    return this.form.get('startTime');
  }

  get endDate(): AbstractControl | null {
    return this.form.get('endDate');
  }

  get endTime(): AbstractControl | null {
    return this.form.get('endTime');
  }

  get status(): AbstractControl | null {
    return this.form.get('status');
  }

  get isAllDay(): AbstractControl | null {
    return this.form.get('isAllDay');
  }

  get repeats(): AbstractControl | null {
    return this.form.get('repeats');
  }

  get description(): AbstractControl | null {
    return this.form.get('description');
  }

  // =========================================================================
  // Facilitators
  // =========================================================================

  /**
   * Since the `date` and `time` portions are provided from separate form fields
   * an ISO conforming string must be constructed.
   *
   * Recall that an ISO datetime string has the following format:
   *
   * `YYYY-MM-DDTHH:MM:SS`
   *
   * For example, `2021-01-01T00:00:00`
   * @param date The `date` portion of the datetime string to be constructed.
   * @param time The `time` portion of the datetime string to be constructed.
   */
  private buildISODateTimeString(date: Date, time: string): string {
    const timeTokens = time.split(':');
    let hour = +timeTokens[0];
    const minutes = timeTokens[1].split(' ')[0];

    if (time.match(/pm/gi)) {
      hour += 12;
    }

    const dateSegment = new Date(date).toISOString().split('T')[0];
    return `${dateSegment}T${hour}:${minutes}:00`;
  }

  /**
   * Checks if the event details have been modified from its initial state.
   * @param e The event details.
   */
  private isEventModified(e: CalendarEvent): boolean {
    return (
      this.data.description !== e.description ||
      this.data.endDate !== e.endDate ||
      this.data.id !== e.id ||
      this.data.isAllDay !== e.isAllDay ||
      this.data.repeats !== e.repeats ||
      this.data.startDate !== e.startDate ||
      this.data.status !== e.status ||
      this.data.title !== e.title
    );
  }

  /**
   * Extracts the data from the form fields
   * and creates a new instance of a `CalendarEvent`.
   */
  private buildEventFromFormValues(): CalendarEvent {
    const startDate = new Date(
      this.buildISODateTimeString(this.startDate?.value, this.startTime?.value)
    );
    const endDate = new Date(
      this.buildISODateTimeString(this.endDate?.value, this.endTime?.value)
    );

    const occurrence =
      this.repeats?.value === this.defaultRepeats
        ? defaultOccurrence
        : this.repeats?.value.trim();

    const event = new CalendarEvent({
      id: this.data.id ?? undefined,
      title: this.title?.value.trim(),
      startDate,
      endDate,
      repeats: occurrence,
      isAllDay: this.isAllDay?.value,
      status: this.status?.value,
      description: this.description?.value?.trim(),
    });

    return event;
  }

  // =========================================================================
  // Action handlers
  // =========================================================================

  /**
   * Toggles the `display` value for the div that encapsulates
   * the form fields for the event's date & time values.
   * @param isAllDay the checkbox value
   */
  public toggleDatetimeFields(isAllDay: boolean): void {
    document.getElementById('datetimeContainer')?.classList.toggle('hidden');
  }

  /**
   * Closes the dialog.
   */
  public onNoClick(): void {
    this.resetForm();
    this.dialogRef.close();
  }

  /**
   * Builds an event with the information provided in the form
   * and saves it to the database.
   */
  public onSave(): void {
    const event = this.buildEventFromFormValues();

    if (this.data && this.isEventModified(event)) {
      this.dataSubscription = this.dataService
        .update(`/events/${this.data.id}`, event)
        .subscribe();
    } else {
      this.dataSubscription = this.dataService
        .create('/events', event)
        .subscribe();
    }

    this.resetForm();
    this.dialogRef.close(event);
  }
}
