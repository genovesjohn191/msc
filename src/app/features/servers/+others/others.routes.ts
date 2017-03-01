import { Routes } from '@angular/router';

import { OthersComponent } from './others.component';

export const routes: Routes = [
  { path: '', redirectTo: 'others', pathMatch: 'full' },
  { path: 'others', component: OthersComponent },
];
