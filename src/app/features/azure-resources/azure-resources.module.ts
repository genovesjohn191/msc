import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

/** Azure Resources */
import { azureResourcesRoute } from './azure-resources.constants';
import { AzureResourcesComponent } from './azure-resources.component';

@NgModule({
  declarations: [
    AzureResourcesComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(azureResourcesRoute)
  ],
  providers: [
  ]
})

export class AzureResourcesModule { }
