import { Injectable } from '@angular/core';
import { CalendarEvent } from '../models/calendar-event';
import { CalendarService } from '../services/calendar.service';

@Injectable()
export class WeekViewBuilder {
  constructor(private readonly calendar: CalendarService) {}

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
   * Builds a regular event. In other words, the event's time duration
   * is an hour or less.
   * @param event The event details.
   */
  public buildEvent(event: CalendarEvent): HTMLDivElement {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    const eventElement = document.createElement('div');
    eventElement.classList.add('event');
    eventElement.id = `${event.id}`;

    const eventTitle = document.createElement('div');
    eventTitle.classList.add('event-details');
    eventTitle.innerText = event.title;
    eventElement.appendChild(eventTitle);

    const timeSpan = this.calendar.extractTimeSpan(start, end);
    const eventTimeSpan = document.createElement('div');
    eventTimeSpan.classList.add('event-details');
    eventTimeSpan.innerText = timeSpan;
    eventElement.appendChild(eventTimeSpan);

    return eventElement;
  }

  /**
   * Builds an all-day event element which excludes the event's time span.
   * @param event The event details
   */
  public buildAllDayEvent(event: CalendarEvent): HTMLDivElement {
    const eventElement = document.createElement('div');
    eventElement.classList.add('event');
    eventElement.id = `${event.id}`;

    const eventTitle = document.createElement('div');
    eventTitle.classList.add('event-details');
    eventTitle.innerText = event.title;
    eventElement.appendChild(eventTitle);

    return eventElement;
  }

  /**
   * Builds a multi-hour event which requires absolute positioning
   * so the event can span across multiple rows.
   * @param event The event details
   */
  public buildMultiHourEvent(event: CalendarEvent): HTMLDivElement {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    const eventElement = this.buildEvent(event);
    const rowspan = end.getHours() - start.getHours() + 1;
    const cellMinHeight = 48; // In pixels

    eventElement.classList.add('position-absolute');
    eventElement.style.bottom = `-${(rowspan - 1) * cellMinHeight}px`;

    return eventElement;
  }
}
