import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportWidgetModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';
import { DataSizePipe } from '@app/shared/pipes/data-size.pipe';
import { PrivateCloudDashboardOverviewComponent } from './overview/private-cloud-dashboard-overview.component';
import { privateCloudDashboardRoutes } from './private-cloud-dashboard.constants';

@NgModule({
  declarations: [
    PrivateCloudDashboardOverviewComponent
  ],
  imports: [
    SharedModule,
    ReportWidgetModule,
    RouterModule.forChild(privateCloudDashboardRoutes)
  ],
  providers: [DataSizePipe]
})

export class PrivateCloudDashboardModule { }
