import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinct, shareReplay } from 'rxjs/operators';
import { daysInMonth } from '../constants/days-in-month';
import { CalendarEvent } from '../models/calendar-event';
import { DateSegments } from '../models/date-segments.model';

export const millisecondsPerHour = 3600000;
export const millisecondsPerDay = 86400000;
export const millisecondsPerWeek = 604800000;
export const daysPerWeek = 7;
export const hoursPerDay = 24;

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly dateSubject = new BehaviorSubject<Date>(new Date());
  private readonly isMonthViewSubject = new BehaviorSubject<boolean>(false);
  private readonly isWeekViewSubject = new BehaviorSubject<boolean>(true);

  constructor() {}

  // =========================================================================
  // Getters & setters
  // =========================================================================

  public getDateAsObservable(): Observable<Date> {
    return this.dateSubject.asObservable().pipe(distinct(), shareReplay());
  }

  public getDate(): Date {
    return this.dateSubject.value;
  }

  /**
   * Sets the underlying `date` value with the date provided.
   *
   * NOTE: The time segments are ignored.
   * In other words, only the `year`, `month`, and `date` values are used.
   * @param date The new date
   */
  public setDate(date: Date): void {
    this.dateSubject.next(
      new Date(date.getFullYear(), date.getMonth(), date.getDate())
    );
  }

  // =========================================================================
  // Facilitators
  // =========================================================================

  /**
   * Compares the `date`, `month`, and `year` values
   * of the underlying `Date` value and the `Date` provided.
   * @param other The date of interest.
   */
  public isEqual(other: Date): boolean {
    const date = this.dateSubject.value;
    return (
      date.getDate() === other.getDate() &&
      date.getMonth() === other.getMonth() &&
      date.getFullYear() === other.getFullYear()
    );
  }

  /**
   * Compares the `date`, `month`, and `year` values
   * of the `Date`s provided.
   * @param a A date of interest.
   * @param b A date of interest.
   */
  public isSameDates(a: Date, b: Date): boolean {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  public isMonthViewAsObservable(): Observable<boolean> {
    return this.isMonthViewSubject.asObservable();
  }

  /**
   * Returns `true` if the MonthlyViewComponent is currently visible to the user,
   * otherwise `false`.
   */
  public isMonthViewVisible(): boolean {
    return this.isMonthViewSubject.value;
  }

  /**
   * Sets the underlying `isMonthViewSubject` value with the given value.
   * @param value The boolean value
   */
  public isMonthView(value: boolean): void {
    this.isMonthViewSubject.next(value);
  }

  // =========================================================================

  public isWeekViewAsObservable(): Observable<boolean> {
    return this.isWeekViewSubject.asObservable();
  }

  /**
   * Returns `true` if the WeeklyViewComponent is currently visible to the user,
   * otherwise `false`.
   */
  public isWeekViewVisible(): boolean {
    return this.isWeekViewSubject.value;
  }

  /**
   * Sets the underlying `isMonthViewSubject` value with the given value.
   * @param value The boolean value
   */
  public isWeekView(value: boolean): void {
    this.isWeekViewSubject.next(value);
  }

  /**
   * Returns a new instance of a `Date` with the given `date` values
   * and the `hour` and `min` values set to 0.
   * @param date The date of interest.
   */
  public setZeroHour(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Extracts the `hour` portion of the given dates and creates a `string`.
   *
   * For example, an event that lasts one hour will result in `9 AM - 10 AM`
   *
   * **NOTE**: This should *not* be called for an "all-day event."
   * @param start The starting date
   * @param end The ending date
   */
  public extractTimeSpan(start: Date, end: Date): string {
    const onlyHour = {
      hour: 'numeric',
    };

    const hourAndMinutes = {
      hour: 'numeric',
      minute: 'numeric',
    };

    let startTime = '';
    let endTime = '';

    if (
      (start.getHours() < 12 && end.getHours() < 12) ||
      (start.getHours() >= 12 && end.getHours() >= 12)
    ) {
      // Desired format: 9 - 10:30 AM || 9 - 10:30 PM
      startTime = start.toLocaleString('default', onlyHour).split(' ')[0];
      endTime = end.toLocaleString('default', hourAndMinutes);
    } else {
      // 11:30 AM - 12:30 PM
      startTime = start.toLocaleString('default', hourAndMinutes);
      endTime = end.toLocaleString('default', hourAndMinutes);
    }

    return `${startTime} - ${endTime}`;
  }

  /**
   * Checks to see if the given `event` is an "all-day event."
   *
   * An "all-day event" is defined to be an event
   * where the event's start time & end time equal 00:00;
   * @param event The event of interest.
   */
  public isAllDayEvent(event: CalendarEvent): boolean {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    return (
      start.getHours() === end.getHours() &&
      start.getHours() === 0 &&
      end.getHours() === 0
    );
  }

  // =========================================================================
  // Month operations
  // =========================================================================

  /**
   * Adds *exactly* one month to the underlying `date` value.
   */
  public incrementMonth(): void {
    const currentDate = this.dateSubject.value;
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    this.dateSubject.next(newDate);
  }

  /**
   * Subtracts *exactly* one month to the underlying `date` value.
   */
  public decrementMonth(): void {
    const currentDate = this.dateSubject.value;
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    this.dateSubject.next(newDate);
  }

  /**
   * Returns the number of days in the month of the underlying `date` value.
   * The given month value must be in the range `[0,11]`,
   * where `0` is January and `11` is December.
   */
  public getDaysInMonth(): number {
    const month = this.dateSubject.value.getMonth();
    if (month < 0 || month > 11) {
      throw new Error("Invalid 'month' value");
    }
    if (month === 1 && this.isLeapYear()) {
      // The given month is February and we're currently in a leap year, thus +1.
      return daysInMonth[month] + 1;
    }

    return daysInMonth[month];
  }

  /**
   * Returns the numerical value of the first day of the month,
   * where `0` is Sunday and `6` is Saturday, and the numerical range is `[0,6]`.
   */
  public getFirstDayOfMonth(): number {
    const date = new Date(this.dateSubject.value);
    date.setDate(1);
    return date.getDay();
  }

  /**
   * Returns `true` if the underlying `date` value is a leap year;
   * otherwise `false`.
   */
  public isLeapYear(): boolean {
    const y = this.dateSubject.value.getFullYear();
    return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  }

  // =========================================================================
  // Week operations
  // =========================================================================

  /**
   * Returns a new `Date` object that represents
   * the first day of the week (Sunday) relative to the given `date` value.
   *
   * **NOTE**: The `time` will be set to `00:00`
   *
   * @param date The date of interest.
   */
  public getFirstDateOfWeek(date = new Date()): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const delta = d.getDay() * millisecondsPerDay;
    return new Date(d.getTime() - delta);
  }

  /**
   * Adds *exactly* seven days to the given date.
   * @param date The date of interest.
   */
  public addOneWeek(date: Date): Date {
    return new Date(date.valueOf() + millisecondsPerWeek);
  }

  /**
   * Extracts the weekday, hour, and minute values from the given `Date` object.
   * @param date The date of interest.
   */
  public getDateTimeSegments(date: Date = new Date()): DateSegments {
    const day = date.getDay();
    const timeSegments = date.toTimeString().split(' ')[0].split(':');

    return {
      day,
      hour: +timeSegments[0],
      minutes: +timeSegments[1],
    };
  }

  /**
   * Checks if the current `Date` is the start-of-the-week,
   * if it is not, then the underlying `DateSubject` value
   * is set to the start-of-the-week.
   */
  private ensureStartDateOfWeek(): void {
    if (this.isCurrentWeek()) {
      return;
    }
    this.setDate(this.getFirstDateOfWeek(this.dateSubject.value));
  }

  /**
   * Ensures that the underlying `date` value is the 'start of the week',
   * then subtracts 7 days from said value.
   */
  public previousWeek(): void {
    this.ensureStartDateOfWeek();
    const previousWeek = new Date(
      this.dateSubject.value.getTime() - millisecondsPerWeek
    );
    this.setDate(this.getFirstDateOfWeek(previousWeek));
  }

  /**
   * Ensures that the underlying `date` value is the 'start of the week',
   * then adds 7 days from said value.
   */
  public nextWeek(): void {
    this.ensureStartDateOfWeek();
    const nextWeek = new Date(
      this.dateSubject.value.getTime() + millisecondsPerWeek
    );
    this.setDate(this.getFirstDateOfWeek(nextWeek));
  }

  /**
   * Checks if the rendered week is the current week of the year.
   * @returns `true` if the rendered week is the current week, otherwise `false`.
   */
  public isCurrentWeek(): boolean {
    const temp = this.getFirstDateOfWeek(new Date());
    const currentStartOfWeek = new Date(
      temp.getFullYear(),
      temp.getMonth(),
      temp.getDate()
    );

    const renderedDate = this.dateSubject.value;
    const currentEndOfWeek = new Date(
      currentStartOfWeek.getTime() + millisecondsPerWeek
    );

    return (
      currentStartOfWeek.getMonth() === renderedDate.getMonth() &&
      currentStartOfWeek.getFullYear() === renderedDate.getFullYear() &&
      currentStartOfWeek.valueOf() <= renderedDate.valueOf() &&
      renderedDate.valueOf() < currentEndOfWeek.valueOf()
    );
  }

  /**
   * Checks to see if the underlying `date` value falls within
   * the final week of the month.
   */
  public isLastWeekOfMonth(): boolean {
    const currentDate = new Date(this.dateSubject.value);
    const nextWeekDate = new Date(currentDate.getTime() + millisecondsPerWeek);
    return currentDate.getMonth() !== nextWeekDate.getMonth();
  }

  /**
   * Checks to see if the underlying `date` value falls within
   * the final week of the year.
   */
  public isLastWeekOfYear(): boolean {
    const currentDate = new Date(this.dateSubject.value);
    const nextWeekDate = new Date(currentDate.getTime() + millisecondsPerWeek);
    return currentDate.getFullYear() !== nextWeekDate.getFullYear();
  }

  /**
   * Checks to see if the underlying `date` value is the current date.
   */
  public isCurrentDate(): boolean {
    const today = new Date();
    const date = this.getDate();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }
}
