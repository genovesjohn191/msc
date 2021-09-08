import { Routes } from '@angular/router';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';

import { AzureSubscriptionsComponent } from './azure-subscriptions.component';

/**
 * List of routes for the main module
 */
export const azureSubscriptionsRoute: Routes = [
  {
    path: '',
    component: AzureSubscriptionsComponent,
    canActivate: [ McsPublicCloudOnlyGuard ]
  }
];