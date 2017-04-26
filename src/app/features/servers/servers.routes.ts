import { Routes } from '@angular/router';
/** Servers */
import {
  ServersComponent,
  ServerComponent,
  ServerManagementComponent,
  ServerServicesComponent,
  ServerBackupsComponent,
  ServerResolver
} from './';

export const routes: Routes = [
  { path: 'servers', component: ServersComponent },
  {
    path: 'servers/:id',
    component: ServerComponent,
    resolve: {
      server: ServerResolver
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
