import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { LaunchPadGuard } from './launch-pad.guard';
import { LaunchPadSearchComponent } from './search/launch-pad-search.component';
import { DeploymentCreateAzureComponent } from './deployments/azure-deployment-create/azure-deployment-create.component';
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
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'workflows',
    component: LaunchPadWorkflowsComponent,
    data: { routeId: RouteKey.LaunchPadWorkflowLaunch },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: `workflows/launch/:${sourceParam}/:${companyIdParam}/:${worklowGroupIdParam}/:${serviceIdParam}/:${productIdParam}`,
    component: LaunchPadWorkflowLaunchComponent,
    data: { routeId: RouteKey.LaunchPadWorkflowLaunch },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'deployments/create',
    component: DeploymentCreateAzureComponent,
    data: { routeId: RouteKey.LaunchPadWorkflowLaunch },
    canActivate: [ LaunchPadGuard ]
  },
];
