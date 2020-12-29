import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeekViewComponent } from './calendar/week-view/week-view.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: 'calendar/week',
    component: WeekViewComponent,
  },
  {
    path: '',
    redirectTo: 'calendar/week',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
