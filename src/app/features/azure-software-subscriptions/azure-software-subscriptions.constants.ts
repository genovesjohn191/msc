import { Routes } from '@angular/router';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';

import { AzureSoftwareSubscriptionsComponent } from './azure-software-subscriptions.component';

export const azureSoftwareSubscriptionsRoute: Routes = [
  {
    path: '',
    component: AzureSoftwareSubscriptionsComponent,
    canActivate: [ McsPublicCloudOnlyGuard ]
  }
];
