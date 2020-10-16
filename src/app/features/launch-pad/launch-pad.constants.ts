import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
import { RouteKey } from '@app/models';
import { CrispOrdersWorkflowComponent } from './crisp-orders/crisp-orders.component';

/**
 * List of routes for the main module
 */
export const launchPadRoutes: Routes = [
  {
    path: 'crisp-orders',
    component: CrispOrdersWorkflowComponent,
    data: { routeId: RouteKey.LaunchPadCrispOrders },
    canDeactivate: [McsNavigateAwayGuard],
  }
];
