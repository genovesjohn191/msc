import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

/** Azure Non-Standard Bundles */
import { azureNonStandardBundlesRoute } from './azure-non-standard-bundles.constants';
import { AzureNonStandardBundlesComponent } from './azure-non-standard-bundles.component';

@NgModule({
  declarations: [
    AzureNonStandardBundlesComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(azureNonStandardBundlesRoute)
  ],
  providers: []
})

export class AzureNonStandardBundlesModule { }
