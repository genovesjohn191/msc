import { Routes } from '@angular/router';
/** Servers */
import { ServersComponent } from './servers.component';
import { ServerComponent } from './server/server.component';
import { ServerManagementComponent } from './server/management/server-management.component';
import { ServerServicesComponent } from './server/services/server-services.component';
import { ServerStorageComponent } from './server/storage/server-storage.component';
import { ServerBackupsComponent } from './server/backups/server-backups.component';
/** Managed Server */
import {
  CreateSelfManagedServerComponent,
  NewSelfManagedServerComponent,
  CopySelfManagedServerComponent,
  CloneSelfManagedServerComponent
} from './self-managed-server';
/** Server Provisioning Notifications */
import {
  ProvisioningNotificationsComponent
} from './provisioning-notifications/provisioning-notifications.component';
/** Resolvers */
import { ServersResolver } from './servers.resolver';
import { ServerResolver } from './server/server.resolver';

export const routes: Routes = [
  {
    path: 'servers', component: ServersComponent
  },
  {
    path: 'servers/create', component: CreateSelfManagedServerComponent,
    children: [
      { path: 'new', component: NewSelfManagedServerComponent },
      { path: 'copy', component: CopySelfManagedServerComponent },
      { path: 'clone', component: CloneSelfManagedServerComponent }
    ]
  },
  {
    path: 'servers/provisioning', component: ProvisioningNotificationsComponent,
  },
  {
    path: 'servers/:id',
    component: ServerComponent,
    resolve: {
      server: ServerResolver,
      servers: ServersResolver
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
