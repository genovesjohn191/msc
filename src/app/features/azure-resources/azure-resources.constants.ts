import { Routes } from '@angular/router';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';

import { AzureResourcesComponent } from './azure-resources.component';

/**
 * List of routes for the main module
 */
export const azureResourcesRoute: Routes = [
  {
    path: '',
    component: AzureResourcesComponent,
    canActivate: [ McsPublicCloudOnlyGuard ]
  }
];
