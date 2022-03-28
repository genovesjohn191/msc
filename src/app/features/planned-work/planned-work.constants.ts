import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { PlannedWorkOverviewComponent } from './details/overview/planned-work-overview.component';
import { PlannedWorkDetailsComponent } from './details/planned-work-details.component';
import { PlannedWorkDetailsResolver } from './details/planned-work-details.resolver';
import { PlannedWorkDetailsService } from './details/planned-work-details.service';

import { PlannedWorkListingComponent } from './planned-work-listing.component';

/**
 * List of services for the main module
 */
export const plannedWorkProviders: any[] = [
  PlannedWorkDetailsService,
  PlannedWorkDetailsResolver
];

/**
 * List of routes for the main module
 */
export const plannedWorkRoutes: Routes = [
  {
    path: '',
    component: PlannedWorkListingComponent
  },
  {
    path: 'details/:id',
    component: PlannedWorkDetailsComponent,
    data: { routeId: RouteKey.PlannedWorkDetails },
    resolve: {
      plannedWork: PlannedWorkDetailsResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.PlannedWorkDetailsOverview }
      },
      {
        path: 'overview',
        component: PlannedWorkOverviewComponent,
        data: { routeId: RouteKey.PlannedWorkDetailsOverview }
      }
    ]
  },
];
