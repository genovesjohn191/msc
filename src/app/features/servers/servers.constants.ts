import { Routes } from '@angular/router';
/** Services */
import { ServerService } from './server/';
import { CreateSelfManagedServersService } from './self-managed-server';
import { ServersService } from './servers.service';
/** Components */
import { ServersComponent } from './servers.component';
import {
  ServerBackupsComponent,
  ServerComponent,
  ServerManagementComponent,
  ServerServicesComponent,
  ServerStorageComponent
} from './server';
import { McsNavigateAwayGuard } from '../../core';
import { CreateSelfManagedServersComponent } from './self-managed-server';
import {
  VdcComponent,
  VdcOverviewComponent,
  VdcService
} from './vdc';

/**
 * List of services for the main module
 */
export const serversProviders: any[] = [
  ServersService,
  ServerService,
  CreateSelfManagedServersService,
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
    component: CreateSelfManagedServersComponent,
    canDeactivate:[McsNavigateAwayGuard]
  },
  {
    path: 'servers/:id',
    component: ServerComponent,
    children: [
      { path: '', redirectTo: 'management', pathMatch: 'full' },
      { path: 'management', component: ServerManagementComponent },
      { path: 'services', component: ServerServicesComponent },
      { path: 'storage', component: ServerStorageComponent },
      { path: 'backups', component: ServerBackupsComponent }
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
