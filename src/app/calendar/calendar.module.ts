import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeekViewComponent } from './week-view/week-view.component';
import { MaterialModule } from '../material/material.module';
import { WeekViewBuilder } from './builders/week-view-builder';
import { EventDetailsComponent } from './event-details/event-details.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [WeekViewComponent, EventDetailsComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  exports: [WeekViewComponent, EventDetailsComponent],
  providers: [WeekViewBuilder],
})
export class CalendarModule {}
