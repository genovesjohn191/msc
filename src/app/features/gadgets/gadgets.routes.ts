import { Routes } from '@angular/router';

import { GadgetsComponent } from './gadgets.component';

/** Resolvers */
import { ServersResolver } from '../servers/servers.resolver';

export const routes: Routes = [
  {
    path: 'gadgets',
    component: GadgetsComponent,
    resolve: {
      servers: ServersResolver
    }
  }
];
