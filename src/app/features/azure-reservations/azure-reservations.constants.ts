import { Routes } from '@angular/router';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';

import { AzureReservationsComponent } from './azure-reservations.component';

export const azureReservationsRoute: Routes = [
  {
    path: '',
    component: AzureReservationsComponent,
    canActivate: [ McsPublicCloudOnlyGuard ]
  }
];
