import { Routes } from '@angular/router';
import {
  McsNavigateAwayGuard,
  CoreRoutes,
  McsRouteKey
} from '../../core';
/** Services */
import { ServerService } from './server/';
import { ServersService } from './servers.service';
import { ServersRepository } from './servers.repository';
import { ServersOsRepository } from './servers-os.repository';
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
 * List of routes for the main module
 */
export const serversRoutes: Routes = [
  {
    path: CoreRoutes.getPath(McsRouteKey.Servers),
    component: ServersComponent
  },
  {
    path: CoreRoutes.getPath(McsRouteKey.ServerCreate),
    component: ServerCreateComponent,
    canActivate: [ServerCreateGuard],
    canDeactivate: [McsNavigateAwayGuard]
  },
  {
    path: CoreRoutes.getPath(McsRouteKey.ServerCreateProvisioning),
    component: ServerProvisioningComponent
  },
  {
    path: CoreRoutes.getPath(McsRouteKey.ServerDetail),
    component: ServerComponent,
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getPath(McsRouteKey.ServerDetailManagement),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.ServerDetailManagement),
        component: ServerManagementComponent
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.ServerDetailStorage),
        component: ServerStorageComponent
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.ServerDetailNics),
        component: ServerNicsComponent
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.ServerDetailBackups),
        component: ServerBackupsComponent
      }
    ]
  },
  {
    path: CoreRoutes.getPath(McsRouteKey.VdcDetail),
    component: VdcComponent,
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getPath(McsRouteKey.VdcDetailOverview),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.VdcDetailOverview),
        component: VdcOverviewComponent
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.VdcDetailStorage),
        component: VdcStorageComponent
      }
    ]
  }
];
