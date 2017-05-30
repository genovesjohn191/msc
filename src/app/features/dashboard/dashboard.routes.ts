import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';

/** Resolvers */
import { ServersResolver } from '../servers/servers.resolver';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    resolve: {
      servers: ServersResolver
    }
  }
];
