import { Routes } from '@angular/router';
import {
  McsNavigateAwayGuard,
  CoreRoutes,
  McsRouteKey
} from '../../core';
/** Services */
import { ServerService } from './server/';
import { ServersService } from './servers.service';
import { ServersRepository } from './repositories/servers.repository';
import { ServersOsRepository } from './repositories/servers-os.repository';
/** Components */
import { ServersComponent } from './servers.component';
import {
  ServerBackupsComponent,
  ServerComponent,
  ServerManagementComponent,
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
  ServersRepository,
  ServersOsRepository,
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
    path: CoreRoutes.getRoutePath(McsRouteKey.Servers),
    component: ServersComponent,
    data: { routeId: McsRouteKey.Servers }
  },
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.ServerCreate),
    component: ServerCreateComponent,
    canActivate: [ServerCreateGuard],
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: McsRouteKey.ServerCreate }
  },
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.ServerCreateProvisioning),
    component: ServerProvisioningComponent,
    data: { routeId: McsRouteKey.ServerCreateProvisioning }
  },
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.ServerDetail),
    component: ServerComponent,
    data: { routeId: McsRouteKey.ServerDetail },
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getRoutePath(McsRouteKey.ServerDetailManagement),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.ServerDetailManagement),
        component: ServerManagementComponent,
        data: { routeId: McsRouteKey.ServerDetailManagement }
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.ServerDetailStorage),
        component: ServerStorageComponent,
        data: { routeId: McsRouteKey.ServerDetailStorage }
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.ServerDetailNics),
        component: ServerNicsComponent,
        data: { routeId: McsRouteKey.ServerDetailNics }
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.ServerDetailBackups),
        component: ServerBackupsComponent,
        data: { routeId: McsRouteKey.ServerDetailBackups }
      }
    ]
  },
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.VdcDetail),
    component: VdcComponent,
    data: { routeId: McsRouteKey.VdcDetail },
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getRoutePath(McsRouteKey.VdcDetailOverview),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.VdcDetailOverview),
        component: VdcOverviewComponent,
        data: { routeId: McsRouteKey.VdcDetailOverview }
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.VdcDetailStorage),
        component: VdcStorageComponent,
        data: { routeId: McsRouteKey.VdcDetailStorage }
      }
    ]
  }
];
