import { Routes } from '@angular/router';
import { McsReportingService } from '@app/core';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';
import { RouteKey } from '@app/models';

import { DashboardComponent } from './dashboard.component';
import { DashboardGuard } from './dashboard.guard';
import { ReportInsightsComponent } from './insights';
import { ReportOverviewComponent } from './overview';

/**
 * List of services for the main module
 */
export const dashboardProviders: any[] = [
  DashboardGuard,
  McsReportingService
];

/**
 * List of routes for the main module
 */
export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [DashboardGuard]
  },
  {
    path: 'overview',
    component: ReportOverviewComponent,
    data: { routeId: RouteKey.ReportOverview },
    canActivate: [ McsPublicCloudOnlyGuard ]
  },
  {
    path: 'insights',
    component: ReportInsightsComponent,
    data: { routeId: RouteKey.ReportInsights },
    canActivate: [ McsPublicCloudOnlyGuard ]
  }
];
