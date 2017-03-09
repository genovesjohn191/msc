import { Routes } from '@angular/router';

import { ServersComponent } from './servers.component';
import { ChildComponent } from './child/child.component';

export const routes: Routes = [
  {
    path: 'servers', component: ServersComponent,
    children: [
      { path: 'child', component: ChildComponent },
      { path: 'others', loadChildren: './+others/others.module#OthersModule' }
    ]
  },
  { path: 'others', loadChildren: './+others/others.module#OthersModule' }
];
