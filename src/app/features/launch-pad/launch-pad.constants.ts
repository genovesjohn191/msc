import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
import { RouteKey } from '@app/models';
import { LaunchPadSearchComponent } from './search/launch-pad-search.component';
import {
  companyIdParam,
  LaunchPadWorkflowLaunchComponent,
  productIdParam,
  serviceIdParam,
  sourceParam,
  worklowGroupIdParam
} from './workflows/launch-pad-workflow-launch.component';
import { LaunchPadWorkflowsComponent } from './workflows/launch-pad-workflows.component';

/**
 * List of routes for the main module
 */
export const launchPadRoutes: Routes = [
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
    path: `workflows/launch/:${sourceParam}/:${companyIdParam}/:${worklowGroupIdParam}/:${serviceIdParam}/:${productIdParam}`,
    component: LaunchPadWorkflowLaunchComponent,
    data: { routeId: RouteKey.LaunchPadWorkflowLaunch },
  },
];
