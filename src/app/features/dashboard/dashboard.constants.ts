import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { DashboardComponent } from './dashboard.component';
import { DashboardGuard } from './dashboard.guard';
import { ReportOverviewComponent } from './overview';
import { ReportInsightsComponent } from './insights';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';

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
    data: { routeId: RouteKey.ReportOverview }
  },
  {
    path: 'insights',
    component: ReportInsightsComponent,
    data: { routeId: RouteKey.ReportInsights },
  }
];
