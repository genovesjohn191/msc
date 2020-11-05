import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

/** Azure Managed Services */
import { AzureManagedServicesComponent } from './azure-managed-services.component';
import { azureManagedServicesRoute } from './azure-managed-services.constants';

@NgModule({
  declarations: [
    AzureManagedServicesComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(azureManagedServicesRoute)
  ],
  providers: [
  ]
})

export class AzureManagedServicesModule { }