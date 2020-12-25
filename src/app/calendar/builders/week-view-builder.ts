import { Injectable } from '@angular/core';
import { hoursPerDay, daysPerWeek } from 'src/app/services/calendar.service';

@Injectable()
export class WeekViewBuilder {
  constructor() {}

  buildTimezoneOffset(): void {
    const el = document.getElementById('timezoneOffset');
    if (el) {
      // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
      let offset = new Date().getTimezoneOffset() / 60;
      if (offset > 0) {
        // Positive value denotes we are west of GMT (-)
        el.innerHTML = offset / 10 === 1 ? `GMT-${offset}` : `GMT-0${offset}`;
      } else if (offset < 0) {
        // Negative value denotes we are east of GMT (+)
        el.innerHTML = offset / 10 === -1 ? `GMT+${offset}` : `GMT+0${offset}`;
      }
    }
  }

  buildTimeCell(time: number): HTMLDivElement {
    const cell = document.createElement('div');
    cell.classList.add('time-cell');

    if (time !== 0 && time !== 24) {
      const span = document.createElement('span');
      span.textContent = `${time}`;
      cell.appendChild(span);
    }

    return cell;
  }

  buildCell(): HTMLDivElement {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    return cell;
  }

  buildCalendar(): void {
    const calendar = document.getElementById('calendar');
    if (!calendar) {
      throw new Error('The "calendar" is not definend');
    }

    let time = 1;
    for (let hour = 0; hour < hoursPerDay; hour++) {
      for (let day = 0; day <= daysPerWeek; day++) {
        if (day === 0) {
          calendar.appendChild(this.buildTimeCell(time++));
        } else {
          const cell = this.buildCell();
          cell.id = `${day - 1}-${hour}`;
          calendar.appendChild(cell);
        }
      }
    }
  }
}
