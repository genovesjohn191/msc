import { Routes } from '@angular/router';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';
import { RouteKey } from '@app/models';

import { AzureVirtualDesktopComponent } from './azure-virtual-desktop.component';
import { AzureVirtualDesktopService } from './azure-virtual-desktop.service';
import { DailyConnectionServiceComponent } from './daily-connection-service/daily-connection.component';
import { DailyUserAverageComponent } from './daily-user-average/daily-user-average.component';
import { DailyUserServiceComponent } from './daily-user-service/daily-user-service.component';
import { ServiceCostComponent } from './service-cost/service-cost.component';

/**
 * List of services for the main module
 */
export const avdProviders: any[] = [
  AzureVirtualDesktopService
];

/**
 * List of routes for the main module
 */
export const avdRoutes: Routes = [
  {
    path: '',
    component: AzureVirtualDesktopComponent,
    canActivate: [McsPublicCloudOnlyGuard],
    children: [
      {
        path: '',
        redirectTo: 'daily-user-service',
        pathMatch: 'full',
        data: { routeId: RouteKey.AvdDailyUserService }
      },
      {
        path: 'daily-user-service',
        component: DailyUserServiceComponent,
        data: { routeId: RouteKey.AvdDailyUserService }
      },
      {
        path: 'daily-user-average',
        component: DailyUserAverageComponent,
        data: { routeId: RouteKey.AvdDailyUserAverage }
      },
      {
        path: 'service-cost',
        component: ServiceCostComponent,
        data: { routeId: RouteKey.AvdServiceCost }
      },
      {
        path: 'daily-connection-service',
        component: DailyConnectionServiceComponent,
        data: { routeId: RouteKey.AvdDailyConnection }
      },
    ]
  }
];
