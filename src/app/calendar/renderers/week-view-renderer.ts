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
    const d = this.calendar.getFirstDateOfWeek(date);
    const weekdays = document.querySelectorAll('.weekday');
    const days = document.querySelectorAll('.day');

    for (let i = 0; i < daysPerWeek; i++) {
      weekdays.item(i).textContent = this.weekdayFormatter.format(d);
      const day = days.item(i);
      day.textContent = `${d.getDate()}`;
      day.setAttribute('aria-label', this.ariaLabelFormatter.format(d));
      d.setDate(d.getDate() + 1);
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
   * Renders the given events to the calendar.
   * @param events The events to render.
   */
  renderEvents(events: CalendarEvent[]): void {
    this.clearCalendar();
    // TODO: Update calendar.
  }
}
