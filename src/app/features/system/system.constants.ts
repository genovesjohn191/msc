import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
import { RouteKey } from '@app/models';
import { SystemMessagesComponent } from './messages/messages.component';
import { SystemMessageCreateComponent } from './messages/message-create/message-create.component';
import { SystemMessageEditComponent } from './messages/message-edit/message-edit.component';
import { SystemMessageResolver } from './messages/message-edit/message-edit.resolver';

/**
 * List of services for the main module
 */
export const systemMessageProviders: any[] = [
  SystemMessageResolver
];

/**
 * List of routes for the main module
 */
export const systemRoutes: Routes = [
  {
    path: '',
    component: SystemMessagesComponent
  },
  {
    path: '',
    component: SystemMessageCreateComponent,
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.SystemMessageCreate }
  },
  {
    path: '',
    component: SystemMessageEditComponent,
    data: { routeId: RouteKey.SystemMessageEdit },
    resolve: {
      message: SystemMessageResolver
    }
  }
];
