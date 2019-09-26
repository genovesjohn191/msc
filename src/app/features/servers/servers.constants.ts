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
  ServerBackupsComponent,
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
    path: '',
    component: ServerCreateComponent,
    canActivate: [McsRequiredResourcesGuard],
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.ServerCreate }
  },
  {
    path: '',
    component: ServerComponent,
    data: { routeId: RouteKey.ServerDetails },
    resolve: {
      server: ServerResolver
    },
    children: [
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
        data: { routeId: RouteKey.ServerDetailsManagement }
      },
      {
        path: '',
        component: ServerManagementComponent,
        data: { routeId: RouteKey.ServerDetailsManagement }
      },
      {
        path: '',
        component: ServerServicesComponent,
        data: { routeId: RouteKey.ServerDetailsServices },
        canActivate: [ServerServicesGuard]
      },
      {
        path: '',
        component: ServerStorageComponent,
        data: { routeId: RouteKey.ServerDetailsStorage }
      },
      {
        path: '',
        component: ServerNicsComponent,
        data: { routeId: RouteKey.ServerDetailsNics }
      },
      {
        path: '',
        component: ServerBackupsComponent,
        data: { routeId: RouteKey.ServerDetailsBackups }
      }
    ]
  },
  {
    path: '',
    component: VdcComponent,
    data: { routeId: RouteKey.VdcDetails },
    resolve: {
      vdc: VdcResolver
    },
    children: [
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
        data: { routeId: RouteKey.VdcDetailsOverview }
      },
      {
        path: '',
        component: VdcOverviewComponent,
        data: { routeId: RouteKey.VdcDetailsOverview }
      },
      {
        path: '',
        component: VdcStorageComponent,
        data: { routeId: RouteKey.VdcDetailsStorage }
      }
    ]
  }
];
