import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
import { RouteKey } from '@app/models';

import { AzureDeploymentCreateComponent } from './azure-deployments/azure-deployment-create/azure-deployment-create.component';
import { AzureDeploymentActivitiesComponent } from './azure-deployments/azure-deployment/history/azure-deployment-history.component';
import { AzureDeploymentComponent } from './azure-deployments/azure-deployment/azure-deployment.component';
import { AzureDeploymentResolver } from './azure-deployments/azure-deployment/azure-deployment.resolver';
import { AzureDeploymentOverviewComponent } from './azure-deployments/azure-deployment/overview/azure-deployment-overview.component';
import { AzureDeploymentsComponent } from './azure-deployments/azure-deployments.component';
import { LaunchPadGuard } from './launch-pad.guard';
import { LaunchPadSearchComponent } from './search/launch-pad-search.component';
import {
  companyIdParam,
  productIdParam,
  serviceIdParam,
  sourceParam,
  worklowGroupIdParam,
  LaunchPadWorkflowLaunchComponent
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
    data: { routeId: RouteKey.LaunchPadWorkflows },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: `workflows/launch/:${sourceParam}/:${companyIdParam}/:${worklowGroupIdParam}/:${serviceIdParam}/:${productIdParam}`,
    component: LaunchPadWorkflowLaunchComponent,
    data: { routeId: RouteKey.LaunchPadWorkflowLaunch },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'azure-deployments',
    component: AzureDeploymentsComponent,
    data: { routeId: RouteKey.LaunchPadAzureDeployments },
    canActivate: [ LaunchPadGuard ]
  },
  {
    path: 'azure-deployments/create',
    component: AzureDeploymentCreateComponent,
    data: { routeId: RouteKey.LaunchPadAzureDeploymentCreate },
    canActivate: [ LaunchPadGuard ],
    canDeactivate: [ McsNavigateAwayGuard ],
  },
  {
    path: 'azure-deployments/:id',
    component: AzureDeploymentComponent,
    data: { routeId: RouteKey.LaunchPadAzureDeploymentDetails },
    canActivate: [ LaunchPadGuard ],
    resolve: {
      deployment: AzureDeploymentResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.LaunchPadAzureDeploymentDetailsOverview }
      },
      {
        path: 'overview',
        component: AzureDeploymentOverviewComponent,
        data: { routeId: RouteKey.LaunchPadAzureDeploymentDetailsOverview }
      },
      {
        path: 'history',
        component: AzureDeploymentActivitiesComponent,
        data: { routeId: RouteKey.LaunchPadAzureDeploymentDetailsHistory }
      },
    ]
  }
];
