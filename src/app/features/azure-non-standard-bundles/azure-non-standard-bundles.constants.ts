import { Routes } from '@angular/router';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';

import { AzureNonStandardBundlesComponent } from './azure-non-standard-bundles.component';

export const azureNonStandardBundlesRoute: Routes = [
  {
    path: '',
    component: AzureNonStandardBundlesComponent,
    canActivate: [ McsPublicCloudOnlyGuard ]
  }
];
