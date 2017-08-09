import { Routes } from '@angular/router';
/** Services and Resolvers */
import { ServersResolver } from './servers.resolver';
import {
  ServerService,
  ServerResolver
} from './server/';
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
import { CreateSelfManagedServersComponent } from './self-managed-server';
import {
  ProvisioningNotificationsComponent
} from './provisioning-notifications/provisioning-notifications.component';

/**
 * List of services for the main module
 */
export const serversProviders: any[] = [
  ServersService,
  ServerService,
  CreateSelfManagedServersService,
  ServersResolver,
  ServerResolver
];

/**
 * List of routes for the main module
 */
export const serversRoutes: Routes = [
  {
    path: 'servers', component: ServersComponent
  },
  {
    path: 'servers/create', component: CreateSelfManagedServersComponent
  },
  {
    path: 'servers/:id',
    component: ServerComponent,
    resolve: {
      servers: ServersResolver,
      server: ServerResolver
    },
    children: [
      { path: '', redirectTo: 'management', pathMatch: 'full' },
      { path: 'management', component: ServerManagementComponent },
      { path: 'services', component: ServerServicesComponent },
      { path: 'storage', component: ServerStorageComponent },
      { path: 'backups', component: ServerBackupsComponent }
    ]
  }
];
