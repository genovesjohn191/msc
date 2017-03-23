import { Routes } from '@angular/router';

import { NetworkingComponent } from './networking.component';

export const routes: Routes = [
  { path: '', component: NetworkingComponent, pathMatch: 'full' }
];
