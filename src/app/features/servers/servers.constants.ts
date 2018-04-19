import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '../../core';
/** Services */
import { ServerService } from './server/';
import { ServersService } from './servers.service';
import { ServersRepository } from './servers.repository';
import { ServersResourcesRepository } from './servers-resources.repository';
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
import {
  CreateServerComponent,
  ServerProvisioningPageComponent
} from './create-server';
import {
  VdcComponent,
  VdcOverviewComponent,
  VdcService
} from './vdc';
import { SelfManagedServerGuard } from './guards';

/**
 * List of services for the main module
 */
export const serversProviders: any[] = [
  ServersService,
  ServerService,
  ServersRepository,
  ServersResourcesRepository,
  ServersOsRepository,
  VdcService,
  SelfManagedServerGuard
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
    component: CreateServerComponent,
    canDeactivate: [McsNavigateAwayGuard]
  },
  {
    path: 'servers/create/:id',
    component: ServerProvisioningPageComponent
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
      {
        path: 'backups', component:
          ServerBackupsComponent,
        canActivate: [SelfManagedServerGuard]
      }
    ]
  },
  {
    path: 'servers/vdc/:id',
    component: VdcComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: VdcOverviewComponent }
    ]
  }
];
