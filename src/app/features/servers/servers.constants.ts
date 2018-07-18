import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '../../core';
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
  ServerServicesComponent,
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
    path: 'servers', component: ServersComponent
  },
  {
    path: 'servers/create',
    component: ServerCreateComponent,
    canActivate: [ServerCreateGuard],
    canDeactivate: [McsNavigateAwayGuard]
  },
  {
    path: 'servers/create/:id',
    component: ServerProvisioningComponent
  },
  {
    path: 'servers/:id',
    component: ServerComponent,
    children: [
      { path: '', redirectTo: 'management', pathMatch: 'full' },
      { path: 'management', component: ServerManagementComponent },
      { path: 'services', component: ServerServicesComponent },
      { path: 'storage', component: ServerStorageComponent },
      { path: 'nics', component: ServerNicsComponent },
      { path: 'backups', component: ServerBackupsComponent }
    ]
  },
  {
    path: 'servers/vdc/:id',
    component: VdcComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: VdcOverviewComponent },
      { path: 'storage', component: VdcStorageComponent }
    ]
  }
];
