import { Routes } from '@angular/router';

import { ApplicationRecoveryComponent } from './application-recovery.component';

/**
 * List of routes for the main module
 */
export const applicationRecoveryRoute: Routes = [
  {
    path: '',
    component: ApplicationRecoveryComponent,
    canActivate: [ ]
  }
];
