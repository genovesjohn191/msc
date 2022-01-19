import { Routes } from '@angular/router';

import { ExtendersComponent } from './extenders.component';

/**
 * List of routes for the main module
 */
export const extendersRoute: Routes = [
  {
    path: '',
    component: ExtendersComponent,
    canActivate: [ ]
  }
];
