import { Injectable } from '@angular/core';
import { WeekViewBuilder } from '../builders/week-view-builder';
import {
  CalendarService,
  daysPerWeek,
  hoursPerDay,
} from '../services/calendar.service';

@Injectable()
export class WeekViewRenderer {
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
  renderHeader(): void {
    const date = this.calendar.getFirstDateOfWeek();
    const weekdays = document.querySelectorAll('.weekday');
    const days = document.querySelectorAll('.day');

    for (let i = 0; i < daysPerWeek; i++) {
      weekdays.item(i).textContent = this.weekdayFormatter.format(date);
      const day = days.item(i);
      day.textContent = `${date.getDate()}`;
      day.setAttribute('aria-label', this.ariaLabelFormatter.format(date));
      date.setDate(date.getDate() + 1);
    }
  }

  /**
   * Renders the css grid for the calendar content.
   */
  renderCalendar(): void {
    const calendar = document.getElementById('calendar');
    if (!calendar) {
      throw new Error('HTMLElement with id "calendar" is not definend');
    }

    const aux = new Date();
    const date = new Date(aux.getFullYear(), aux.getMonth(), aux.getDate());
    const formatter = new Intl.DateTimeFormat('default', { hour: 'numeric' });

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
}
