import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

/** Azure Software Subscriptions */
import { azureSoftwareSubscriptionsRoute } from './azure-software-subscriptions.constants';
import { AzureSoftwareSubscriptionsComponent } from './azure-software-subscriptions.component';

@NgModule({
  declarations: [
    AzureSoftwareSubscriptionsComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(azureSoftwareSubscriptionsRoute)
  ],
  providers: []
})

export class AzureSoftwareSubscriptionsModule { }
