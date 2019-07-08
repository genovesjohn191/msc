import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
import { RouteKey } from '@app/models';
import { SystemMessagesComponent } from './messages/messages.component';
import { SystemMessageCreateComponent } from './messages/message-create/message-create.component';

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
  }
];
