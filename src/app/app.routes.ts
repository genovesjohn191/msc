import { Routes } from '@angular/router';

import { ChildComponent } from './features/servers/child/child.component';

// Routing Setup
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'}
];
