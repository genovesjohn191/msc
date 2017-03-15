import { Routes } from '@angular/router';

import { ServersComponent } from './servers.component';

export const routes: Routes = [{
    path: '', component: ServersComponent, pathMatch: 'full'
  }
];
