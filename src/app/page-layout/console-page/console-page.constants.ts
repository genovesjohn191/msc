import { Routes } from '@angular/router';
import { McsAuthenticationGuard } from '../../core';
/** Components */
import { ConsolePageComponent } from './console-page.component';

/**
 * List of routes for the main module
 */
export const consolePageRoutes: Routes = [
  {
    path: 'console/:id',
    component: ConsolePageComponent,
    canActivate: [McsAuthenticationGuard]
  }
];
