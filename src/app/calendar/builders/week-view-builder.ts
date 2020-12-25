import { Injectable } from '@angular/core';

@Injectable()
export class WeekViewBuilder {
  constructor() {}

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
}
