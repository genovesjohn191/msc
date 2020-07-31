import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { DashboardComponent } from './dashboard.component';
import {
  dashboardProviders,
  dashboardRoutes
} from './dashboard.constants';
import { ReportOverviewComponent } from './overview';
import { ReportInsightsComponent } from './insights';
import { ReportWidgetModule } from '@app/features-shared';

@NgModule({
  declarations: [
    DashboardComponent,
    ReportOverviewComponent,
    ReportInsightsComponent,
  ],
  imports: [
    SharedModule,
    ReportWidgetModule,
    RouterModule.forChild(dashboardRoutes)
  ],
  providers: [
    ...dashboardProviders
  ]
})

export class DashboardModule { }
