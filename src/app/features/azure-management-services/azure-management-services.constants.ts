import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';
import { AzureManagementServicesComponent } from './azure-management-services.component';
import {
  AzureManagementServiceComponent,
  AzureManagementServiceOverviewComponent,
  AzureManagementServiceChildrenComponent,
  AzureManagementServiceResolver,
  AzureManagementServiceService
} from './azure-management-service';

/**
 * List of services for the main module
 */
export const azureManagementServicesProviders: any[] = [
  AzureManagementServiceResolver,
  AzureManagementServiceService
];

/**
 * List of routes for the main module
 */
export const azureManagementServicesRoutes: Routes = [
  {
    path: '',
    component: AzureManagementServicesComponent,
    canActivate: [ McsPublicCloudOnlyGuard ]
  },
  {
    path: ':id',
    component: AzureManagementServiceComponent,
    data: { routeId: RouteKey.AzureManagementServicesDetails },
    resolve: {
      azureManagementService: AzureManagementServiceResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.AzureManagementServicesDetailsOverview }
      },
      {
        path: 'overview',
        component: AzureManagementServiceOverviewComponent,
        data: { routeId: RouteKey.AzureManagementServicesDetailsOverview }
      },
      {
        path: 'children',
        component: AzureManagementServiceChildrenComponent,
        data: { routeId: RouteKey.AzureManagementServicesDetailsChildren }
      }
    ]
  }
];
