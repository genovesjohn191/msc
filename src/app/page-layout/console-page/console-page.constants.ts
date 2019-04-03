import { Routes } from '@angular/router';
import { McsAuthenticationGuard } from '@app/core';
import { ConsolePageComponent } from './console-page.component';
import { RouteKey } from '@app/models';

/**
 * List of routes for the main module
 */
export const consolePageRoutes: Routes = [
  {
    path: '',
    component: ConsolePageComponent,
    canActivate: [McsAuthenticationGuard],
    data: { routeId: RouteKey.Console }
  }
];
