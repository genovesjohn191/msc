import { Routes } from '@angular/router';
/** Servers */
import { ServersComponent } from './servers.component';
import { ServerComponent } from './server/server.component';
import { ServerManagementComponent } from './server/management/server-management.component';
import { ServerServicesComponent } from './server/services/server-services.component';
import { ServerBackupsComponent } from './server/backups/server-backups.component';
/** Resolvers */
import { ServersResolver } from './servers.resolver';
import { ServerResolver } from './server/server.resolver';

export const routes: Routes = [
  {
    path: 'servers',
    component: ServersComponent,
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
      {
        path: 'management',
        component: ServerManagementComponent,
      },
      { path: 'services', component: ServerServicesComponent },
      { path: 'backups', component: ServerBackupsComponent }
    ]
  }
];
