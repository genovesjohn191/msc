import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { DashboardComponent } from './dashboard.component';
import {
  dashboardProviders,
  dashboardRoutes
} from './dashboard.constants';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(dashboardRoutes)
  ],
  providers: [
    ...dashboardProviders
  ]
})

export class DashboardModule { }
