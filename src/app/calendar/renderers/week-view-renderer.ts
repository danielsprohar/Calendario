import { Injectable } from '@angular/core';
import { WeekViewBuilder } from '../builders/week-view-builder';
import { CalendarEvent } from '../models/calendar-event';
import {
  CalendarService,
  daysPerWeek,
  hoursPerDay,
} from '../services/calendar.service';

@Injectable()
export class WeekViewRenderer {
  private readonly hourFormatter = new Intl.DateTimeFormat('defualt', {
    hour: 'numeric',
  });

  private readonly weekdayFormatter = new Intl.DateTimeFormat('default', {
    weekday: 'short',
  });

  private readonly ariaLabelFormatter = new Intl.DateTimeFormat('default', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  constructor(
    private readonly builder: WeekViewBuilder,
    private readonly calendar: CalendarService
  ) {}

  /**
   * Clears the calendar of all its events.
   *
   * NOTE: This method does not remove the events from the database.
   */
  private clearCalendar(): void {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell: Element) => {
      for (const child of Array.from(cell.children)) {
        cell.removeChild(child);
      }
    });
  }

  /**
   * Renders the timezone offset of the local computer to the calendar.
   */
  renderTimezoneOffset(): void {
    const el = document.getElementById('timezoneOffset');
    if (el) {
      // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
      let offset = new Date().getTimezoneOffset() / 60;
      if (offset > 0) {
        // Positive value indicates that we are west of GMT (-)
        el.innerHTML = offset / 10 === 1 ? `GMT-${offset}` : `GMT-0${offset}`;
      } else if (offset < 0) {
        // Negative value indicats we are east of GMT (+)
        el.innerHTML = offset / 10 === -1 ? `GMT+${offset}` : `GMT+0${offset}`;
      }
    }
  }

  /**
   * Render the weekdays (e.g., Sun, Mon, etc.)
   * and the current days in numeric format (e.g., 1, 2, 3, etc.).
   */
  renderHeader(date: Date = new Date()): void {
    const auxDate = this.calendar.getFirstDateOfWeek(date);
    const weekdays = document.querySelectorAll('.weekday');
    const days = document.querySelectorAll('.day');
    const today = new Date();

    // Remove the css stying for the current date
    const day = document.querySelector('.is-current-date');
    if (day) {
      day.classList.remove('is-current-date');
    }

    // Now let's update the header
    for (let i = 0; i < daysPerWeek; i++) {
      weekdays.item(i).textContent = this.weekdayFormatter.format(auxDate);
      const day = days.item(i);
      day.textContent = `${auxDate.getDate()}`;
      day.setAttribute('aria-label', this.ariaLabelFormatter.format(auxDate));

      if (auxDate.valueOf() > today.valueOf()) {
        day.classList.add('is-future-date');
      }
      if (this.calendar.isSameDates(today, auxDate)) {
        day.classList.add('is-current-date');
      }
      auxDate.setDate(auxDate.getDate() + 1);
    }
  }

  /**
   * Initializes the css grid for the calendar content.
   *
   * NOTE: This method should only be called *once*.
   */
  initCalendar(): void {
    const calendar = document.getElementById('calendar');
    if (!calendar) {
      throw new Error('HTMLElement with id "calendar" is not definend');
    }

    const aux = new Date();
    const date = new Date(aux.getFullYear(), aux.getMonth(), aux.getDate());
    const formatter = this.hourFormatter;

    for (let hour = 0; hour < hoursPerDay; hour++) {
      date.setHours(hour);
      for (let day = 0; day <= daysPerWeek; day++) {
        if (day === 0) {
          calendar.appendChild(this.builder.buildTimeCell(date, formatter));
        } else {
          const cell = this.builder.buildCell();
          cell.id = `${day - 1}-${hour}`;
          calendar.appendChild(cell);
        }
      }
    }
  }

  /**
   * Renders the given event to the calendar.
   *
   * NOTE: This type of event should have a time duration of an hour or less.
   * @param event The event details.
   */
  private renderEvent(event: CalendarEvent): void {
    const date = new Date(event.startDate);
    const cell = document.getElementById(`${date.getDay()}-${date.getHours()}`);
    if (cell) {
      cell.appendChild(this.builder.buildEvent(event));
    }
  }

  /**
   * Renders an all-day event to the calendar.
   * @param event The event details.
   */
  private renderAllDayEvent(event: CalendarEvent): void {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    let start = startDate.getDay();
    const end = endDate.getDay();

    while (start <= end) {
      const cell = document.getElementById(`${start}`);
      if (cell) {
        cell.appendChild(this.builder.buildAllDayEvent(event));
      }
      start++;
    }
  }

  /**
   * Renders a multi-hour event to the calendar.
   * @param event The event details.
   */
  private renderMultiHourEvent(event: CalendarEvent): void {
    const date = new Date(event.startDate);
    const cell = document.getElementById(`${date.getDay()}-${date.getHours()}`);
    if (cell) {
      cell.appendChild(this.builder.buildMultiHourEvent(event));
    }
  }

  /**
   * Renders the given events to the calendar.
   * @param events The events to render.
   */
  renderEvents(events: CalendarEvent[]): void {
    this.clearCalendar();
    if (events.length === 0) {
      return;
    }

    // NOTE: Events are sorted in ascending order by their `startDate` property.
    events.forEach((event: CalendarEvent) => {
      if (this.calendar.isAllDayEvent(event)) {
        // NOTE: All-day events have their starting & ending hour values set to 0.
        this.renderAllDayEvent(event);
      } else if (this.calendar.isMultiHourEvent(event)) {
        this.renderMultiHourEvent(event);
      } else {
        // An event with a time duration of an hour or less
        this.renderEvent(event);
      }
    });
  }
}
