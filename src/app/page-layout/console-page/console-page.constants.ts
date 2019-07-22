import { Routes } from '@angular/router';
import { McsAuthenticationGuard } from '@app/core';
import { ConsolePageComponent } from './console-page.component';
import { RouteKey } from '@app/models';
import { ConsolePageResolver } from './console-page.resolver';

/**
 * List of services for the main module
 */
export const consolePageProviders: any[] = [
  ConsolePageResolver
];

/**
 * List of routes for the main module
 */
export const consolePageRoutes: Routes = [
  {
    path: '',
    component: ConsolePageComponent,
    canActivate: [McsAuthenticationGuard],
    data: { routeId: RouteKey.Console },
    resolve: {
      server: ConsolePageResolver
    }
  }
];
