import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeekViewComponent } from './week-view/week-view.component';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [WeekViewComponent],
  imports: [CommonModule, MaterialModule],
  exports: [WeekViewComponent],
})
export class CalendarModule {}
