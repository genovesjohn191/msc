import { Routes } from '@angular/router';
import { McsPrivateCloudOnlyGuard } from '@app/core/guards/mcs-private-cloud-only.guard';
import { RouteKey } from '@app/models';
import { PrivateCloudDashboardOverviewComponent } from './overview/private-cloud-dashboard-overview.component';

/**
 * List of services for the main module
 */
export const privateCloudDashboardProviders: any[] = [
];

/**
 * List of routes for the main module
 */
export const privateCloudDashboardRoutes: Routes = [
  {
    path: 'overview',
    component: PrivateCloudDashboardOverviewComponent,
    data: { routeId: RouteKey.PrivateCloudDashboardOverview },
    canActivate: [ McsPrivateCloudOnlyGuard ]
  }
];
