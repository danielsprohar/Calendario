import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { monthsAbbreviated, months } from '../calendar/constants/months';
import { CalendarService } from '../calendar/services/calendar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  private dateSubscription: Subscription;

  public todayTooltip: string;

  public readonly today = new Date();
  public readonly views = ['month', 'week'];
  public readonly form = new FormGroup({
    view: new FormControl('week', [Validators.required]),
  });

  constructor(
    public readonly calendar: CalendarService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const locale = window.navigator.language;
    this.todayTooltip = this.today.toLocaleString(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  // =========================================================================

  ngOnDestroy(): void {
    if (this.dateSubscription) {
      this.dateSubscription.unsubscribe();
    }
  }

  // =========================================================================

  ngAfterViewInit(): void {
    this.dateSubscription = this.calendar
      .getDateAsObservable()
      .subscribe((date: Date) => this.renderDate(date));
  }

  // =========================================================================

  get view(): AbstractControl | null {
    return this.form.get('view');
  }

  // =========================================================================

  public handleViewChange(selectedView: string): void {
    if (this.view && this.view.value === selectedView) {
      return;
    }

    // '?' => To silence VS Code's intellisense.
    this.view?.setValue(selectedView);

    if (selectedView === 'month') {
      this.calendar.isMonthView(true);
      this.calendar.isWeekView(false);
    } else {
      this.calendar.isMonthView(false);
      this.calendar.isWeekView(true);
    }

    this.router.navigate(['calendar', selectedView]);
  }

  // =========================================================================

  public renderPreviousMonth(): void {
    this.calendar.decrementMonth();
  }

  // =========================================================================

  public renderNextMonth(): void {
    this.calendar.incrementMonth();
  }

  // =========================================================================

  public renderPreviousWeek(): void {
    this.calendar.previousWeek();
  }

  // =========================================================================

  public renderNextWeek(): void {
    this.calendar.nextWeek();
  }

  /**
   * Sets the underlying `date` value in the
   * `CalendarService` to equal today's date.
   */
  public renderCurrentDate(): void {
    if (!this.calendar.isEqual(new Date())) {
      this.calendar.setDate(this.calendar.getFirstDateOfWeek(new Date()));
    }
  }

  /**
   * Renders the date value as a string in the `NavbarComponent`.
   */
  private renderDate(date: Date): void {
    const el = document.getElementById('date');
    if (!el) {
      throw new Error('"Date" is undefined');
    }

    const d = new Date(date);
    const thisYear = d.getFullYear();
    if (this.calendar.isLastWeekOfYear()) {
      // Format: Dec 2020 - Jan 2021
      const nextYear = thisYear + 1;
      el.textContent = `${monthsAbbreviated[11]} ${thisYear} - ${monthsAbbreviated[0]} ${nextYear}`;
    } else if (this.calendar.isLastWeekOfMonth()) {
      // Format: Jan - Feb 2021
      const thisMonth = monthsAbbreviated[d.getMonth()];
      const nextMonth = monthsAbbreviated[d.getMonth() + 1];
      el.textContent = `${thisMonth} - ${nextMonth} ${thisYear}`;
    } else {
      // Format: January 2021
      el.textContent = `${months[d.getMonth()]} ${thisYear}`;
    }
  }
}
