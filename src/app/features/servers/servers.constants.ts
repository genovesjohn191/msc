import { Routes } from '@angular/router';
import {
  McsNavigateAwayGuard,
  CoreRoutes
} from '@app/core';
import { RouteKey } from '@app/models';
import { RequiredResourcesGuard } from '@app/services';
/** Services */
import { ServerService } from './server/';
import { ServersService } from './servers.service';
/** Components */
import { ServersComponent } from './servers.component';
import {
  ServerBackupsComponent,
  ServerComponent,
  ServerManagementComponent,
  ServerServicesComponent,
  ServerServicesGuard,
  ServerStorageComponent,
  ServerNicsComponent
} from './server';
import { ServerProvisioningComponent } from './server-provisioning/server-provisioning.component';
import {
  ServerCreateComponent,
  ServerCreateService,
  ServerCreateGuard
} from './server-create';
import {
  VdcComponent,
  VdcOverviewComponent,
  VdcStorageComponent,
  VdcService
} from './vdc';

/**
 * List of services for the main module
 */
export const serversProviders: any[] = [
  ServersService,
  ServerService,
  ServerServicesGuard,
  ServerCreateService,
  ServerCreateGuard,
  VdcService
];

/**
 * List of all the entry components for the servers
 */
export const serversRoutesComponents: any[] = [
  ServersComponent,
  ServerCreateComponent,
  ServerProvisioningComponent,
  ServerComponent,
  ServerManagementComponent,
  ServerServicesComponent,
  ServerStorageComponent,
  ServerNicsComponent,
  ServerBackupsComponent,
  VdcComponent,
  VdcOverviewComponent,
  VdcStorageComponent
];

/**
 * List of routes for the main module
 */
export const serversRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(RouteKey.Servers),
    component: ServersComponent,
    data: { routeId: RouteKey.Servers }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.ServerCreate),
    component: ServerCreateComponent,
    canActivate: [RequiredResourcesGuard],
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.ServerCreate }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.ServerCreateProvisioning),
    component: ServerProvisioningComponent,
    data: { routeId: RouteKey.ServerCreateProvisioning }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.ServerDetail),
    component: ServerComponent,
    data: { routeId: RouteKey.ServerDetail },
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getRoutePath(RouteKey.ServerDetailManagement),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.ServerDetailManagement),
        component: ServerManagementComponent,
        data: { routeId: RouteKey.ServerDetailManagement }
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.ServerDetailServices),
        component: ServerServicesComponent,
        data: { routeId: RouteKey.ServerDetailServices },
        canActivate: [ServerServicesGuard]
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.ServerDetailStorage),
        component: ServerStorageComponent,
        data: { routeId: RouteKey.ServerDetailStorage }
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.ServerDetailNics),
        component: ServerNicsComponent,
        data: { routeId: RouteKey.ServerDetailNics }
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.ServerDetailBackups),
        component: ServerBackupsComponent,
        data: { routeId: RouteKey.ServerDetailBackups }
      }
    ]
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.VdcDetail),
    component: VdcComponent,
    data: { routeId: RouteKey.VdcDetail },
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getRoutePath(RouteKey.VdcDetailOverview),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.VdcDetailOverview),
        component: VdcOverviewComponent,
        data: { routeId: RouteKey.VdcDetailOverview }
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.VdcDetailStorage),
        component: VdcStorageComponent,
        data: { routeId: RouteKey.VdcDetailStorage }
      }
    ]
  }
];
