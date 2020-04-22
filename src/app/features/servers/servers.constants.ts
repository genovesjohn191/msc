import { Routes } from '@angular/router';
import {
  McsNavigateAwayGuard,
  McsRequiredResourcesGuard
} from '@app/core';
import { RouteKey } from '@app/models';
/** Services */
import { ServerService } from './server/';
import { ServersService } from './servers.service';
/** Components */
import { ServersComponent } from './servers.component';
import {
  ServerSnapshotsComponent,
  ServerComponent,
  ServerManagementComponent,
  ServerServicesComponent,
  ServerServicesGuard,
  ServerStorageComponent,
  ServerNicsComponent,
  ServerResolver
} from './server';
import { ServerCreateComponent } from './server-create';
import {
  VdcComponent,
  VdcOverviewComponent,
  VdcStorageComponent,
  VdcService,
  VdcResolver
} from './vdc';

/**
 * List of services for the main module
 */
export const serversProviders: any[] = [
  ServersService,
  ServerService,
  ServerServicesGuard,
  ServerResolver,
  VdcService,
  VdcResolver
];

/**
 * List of routes for the main module
 */
export const serversRoutes: Routes = [
  {
    path: '',
    component: ServersComponent
  },
  {
    path: 'create',
    component: ServerCreateComponent,
    canActivate: [McsRequiredResourcesGuard],
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.ServerCreate }
  },
  {
    path: ':id',
    component: ServerComponent,
    data: { routeId: RouteKey.ServerDetails },
    resolve: {
      server: ServerResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'management',
        pathMatch: 'full',
        data: { routeId: RouteKey.ServerDetailsManagement }
      },
      {
        path: 'management',
        component: ServerManagementComponent,
        data: { routeId: RouteKey.ServerDetailsManagement }
      },
      {
        path: 'services',
        component: ServerServicesComponent,
        data: { routeId: RouteKey.ServerDetailsServices },
        canActivate: [ServerServicesGuard]
      },
      {
        path: 'storage',
        component: ServerStorageComponent,
        data: { routeId: RouteKey.ServerDetailsStorage }
      },
      {
        path: 'nics',
        component: ServerNicsComponent,
        data: { routeId: RouteKey.ServerDetailsNics }
      },
      {
        path: 'snapshots',
        component: ServerSnapshotsComponent,
        data: { routeId: RouteKey.ServerDetailsSnapshots }
      }
    ]
  },
  {
    path: 'vdc/:id',
    component: VdcComponent,
    data: { routeId: RouteKey.VdcDetails },
    resolve: {
      vdc: VdcResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.VdcDetailsOverview }
      },
      {
        path: 'overview',
        component: VdcOverviewComponent,
        data: { routeId: RouteKey.VdcDetailsOverview }
      },
      {
        path: 'storage',
        component: VdcStorageComponent,
        data: { routeId: RouteKey.VdcDetailsStorage }
      }
    ]
  }
];
