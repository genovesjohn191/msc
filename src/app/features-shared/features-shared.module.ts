import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { OrderDetailsStepComponent } from './order-details-step/order-details-step.component';
import { ProvisioninStepComponent } from './provisioning-step/provisioning-step.component';

@NgModule({
  declarations: [
    OrderDetailsStepComponent,
    ProvisioninStepComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    OrderDetailsStepComponent,
    ProvisioninStepComponent
  ]
})

export class FeaturesSharedModule { }
