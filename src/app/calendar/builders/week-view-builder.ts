import { Injectable } from '@angular/core';
import {
  hoursPerDay,
  daysPerWeek,
  CalendarService,
} from '../services/calendar.service';

@Injectable()
export class WeekViewBuilder {
  constructor(private readonly calendar: CalendarService) {}

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
   * Uses the `hour` value from the date provided and renders it as a string
   * inside an `HTMLSpanElement` using the provided formatter.
   * @param date The date of interest.
   * @param formatter The user-defined formatter. *ONLY* the `hour` option should be set.
   */
  buildTimeCell(date: Date, formatter: Intl.DateTimeFormat): HTMLDivElement {
    const d = new Date(date);
    const cell = document.createElement('div');
    cell.classList.add('time-cell');

    const hour = d.getHours();
    if (hour !== 0 && hour !== 24) {
      const span = document.createElement('span');
      span.textContent = formatter.format(date);
      cell.appendChild(span);
    }

    return cell;
  }

  /**
   * Creates a new `div` element and adds the necessary css stlying.
   */
  buildCell(): HTMLDivElement {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    return cell;
  }

  /**
   * Render the weekdays (e.g., Sun, Mon, etc.)
   * and the current days in numeric format (e.g., 1, 2, 3, etc.).
   */
  renderHeader(): void {
    const date = this.calendar.getFirstDateOfWeek();
    const weekdays = document.querySelectorAll('.weekday');
    const days = document.querySelectorAll('.day');

    const dayFormatter = new Intl.DateTimeFormat('default', {
      weekday: 'short',
    });

    const ariaLabelFormatter = new Intl.DateTimeFormat('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    for (let i = 0; i < daysPerWeek; i++) {
      weekdays.item(i).textContent = dayFormatter.format(date);
      const day = days.item(i);
      day.textContent = `${date.getDate()}`;
      day.setAttribute('aria-label', ariaLabelFormatter.format(date));
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
          calendar.appendChild(this.buildTimeCell(date, formatter));
        } else {
          const cell = this.buildCell();
          cell.id = `${day - 1}-${hour}`;
          calendar.appendChild(cell);
        }
      }
    }
  }
}
