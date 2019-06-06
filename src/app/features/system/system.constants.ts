import { Routes } from '@angular/router';
import { SystemMessagesComponent } from './messages/messages.component';

/**
 * List of routes for the main module
 */
export const systemRoutes: Routes = [
  {
    path: '',
    component: SystemMessagesComponent
  },
];
