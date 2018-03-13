import { Routes } from '@angular/router';
import { McsAuthenticationGuard } from '../../core';
import { serversProviders } from '../../features/servers/servers.constants';
import { ConsolePageService } from './console-page.service';
import { ConsolePageRepository } from './console-page.repository';
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

/**
 * List of services for the main module
 */
export const constantsProviders: any[] = [
  ...serversProviders,
  ConsolePageService,
  ConsolePageRepository
];
