import { Routes } from '@angular/router';
import {
  McsAuthenticationGuard,
  CoreRoutes
} from '@app/core';
import { McsRouteKey } from '@app/models';
import { ConsolePageService } from './console-page.service';
import { ConsolePageRepository } from './console-page.repository';
/** Components */
import { ConsolePageComponent } from './console-page.component';

/**
 * List of routes for the main module
 */
export const consolePageRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.Console),
    component: ConsolePageComponent,
    canActivate: [McsAuthenticationGuard],
    data: { routeId: McsRouteKey.Console }
  }
];

/**
 * List of services for the main module
 */
export const constantsProviders: any[] = [
  ConsolePageService,
  ConsolePageRepository
];
