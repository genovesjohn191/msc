import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { SystemMessagePageComponent } from './system-message-page.component';
import { McsSystemMessagePageGuard } from './system-message-page.guard';

export const systemMessagePageProviders: any[] = [
  McsSystemMessagePageGuard
];

/**
 * List of routes for the main module
 */
export const systemMessagePageRoutes: Routes = [
  {
    path: '',
    component: SystemMessagePageComponent,
    canActivate: [ McsSystemMessagePageGuard ],
    data: { routeId: RouteKey.SystemMessagePage }
  }
];
