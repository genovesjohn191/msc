import { Routes } from '@angular/router';
/** Services */
import { ServerService } from './server/';
import {
  CreateSelfManagedServersService,
  CreateSelfManagedServerResolver
} from './self-managed-server';
import { ServersService } from './servers.service';
import { ServersRepository } from './servers.repository';
import { ServersResourcesRespository } from './servers-resources.repository';
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
import { McsNavigateAwayGuard } from '../../core';
import { CreateSelfManagedServersComponent } from './self-managed-server';
import {
  VdcComponent,
  VdcOverviewComponent,
  VdcService
} from './vdc';
import { CanActivateSelfManagedServer } from './guards';

/**
 * List of services for the main module
 */
export const serversProviders: any[] = [
  ServersService,
  ServerService,
  ServersRepository,
  ServersResourcesRespository,
  CreateSelfManagedServerResolver,
  CreateSelfManagedServersService,
  VdcService,
  CanActivateSelfManagedServer
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
    resolve: { CreateSelfManagedServerResolver },
    canDeactivate: [McsNavigateAwayGuard]
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
        canActivate: [CanActivateSelfManagedServer]
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
