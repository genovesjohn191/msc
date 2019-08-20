import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { SystemMessagePageComponent } from './system-message-page.component';
import { McsSystemMessagePageGuard } from './system-message-page.guard';
import { SystemMessagePageResolver } from './system-message-page.resolver';

export const systemMessagePageProviders: any[] = [
  McsSystemMessagePageGuard,
  SystemMessagePageResolver
];

/**
 * List of routes for the main module
 */
export const systemMessagePageRoutes: Routes = [
  {
    path: '',
    component: SystemMessagePageComponent,
    canActivate: [ McsSystemMessagePageGuard ],
    data: { routeId: RouteKey.SystemMessagePage },
    resolve: {
      message: SystemMessagePageResolver
    }
  }
];
