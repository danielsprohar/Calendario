import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarService } from '../calendar/services/calendar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
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

  // =========================================================================

  public renderCurrentDate(): void {
    if (!this.calendar.isEqual(new Date())) {
      this.calendar.setDate(new Date());
    }
  }
}
