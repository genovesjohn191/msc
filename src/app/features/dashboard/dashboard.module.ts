import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportWidgetModule } from '@app/features-shared';
import { FormFieldsModule } from '@app/features-shared/form-fields/form-fields.module';
import { SharedModule } from '@app/shared';

import { DashboardComponent } from './dashboard.component';
import {
  dashboardProviders,
  dashboardRoutes
} from './dashboard.constants';
import { ReportInsightsComponent } from './insights';
import { ReportOverviewComponent } from './overview';

@NgModule({
  declarations: [
    DashboardComponent,
    ReportOverviewComponent,
    ReportInsightsComponent,
  ],
  imports: [
    FormFieldsModule,
    SharedModule,
    ReportWidgetModule,
    RouterModule.forChild(dashboardRoutes)
  ],
  providers: [
    ...dashboardProviders
  ]
})

export class DashboardModule { }
