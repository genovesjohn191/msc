import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
import { RouteKey } from '@app/models';
import { LaunchPadSearchComponent } from './search/launch-pad-search.component';
import { LaunchPadWorkflowLaunchComponent } from './workflows/launch-pad-workflow-launch.component';
import { LaunchPadWorkflowsComponent } from './workflows/launch-pad-workflows.component';

/**
 * List of routes for the main module
 */
export const launchPadRoutes: Routes = [
  // {
  //   path: 'crisp-orders',
  //   component: CrispOrdersWorkflowComponent,
  //   data: { routeId: RouteKey.LaunchPadCrispOrders },
  //   canDeactivate: [McsNavigateAwayGuard],
  // },
  {
    path: 'search/:keyword',
    component: LaunchPadSearchComponent,
    data: { routeId: RouteKey.LaunchPadSearch },
  },
  {
    path: 'workflows',
    component: LaunchPadWorkflowsComponent,
    data: { routeId: RouteKey.LaunchPadWorkflowLaunch },
  },
  {
    path: 'workflows/launch/:companyid/:system/:workflowgroupid/:serviceid',
    component: LaunchPadWorkflowLaunchComponent,
    data: { routeId: RouteKey.LaunchPadWorkflowLaunch },
  },
];
