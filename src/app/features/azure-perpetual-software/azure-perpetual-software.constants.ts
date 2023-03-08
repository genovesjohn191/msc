import { Routes } from '@angular/router';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';

import { AzurePerpetualSoftwareComponent } from './azure-perpetual-software.component';

export const azurePerpetualSoftwareRoute: Routes = [
  {
    path: '',
    component: AzurePerpetualSoftwareComponent,
    canActivate: [ McsPublicCloudOnlyGuard ]
  }
];
