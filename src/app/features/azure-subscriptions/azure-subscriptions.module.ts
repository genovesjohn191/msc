import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

/** Azure Subscriptions */
import { AzureSubscriptionsComponent } from './azure-subscriptions.component';
import { azureSubscriptionsRoute } from './azure-subscriptions.constants';

@NgModule({
  declarations: [
    AzureSubscriptionsComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(azureSubscriptionsRoute)
  ],
  providers: [
  ]
})

export class AzureSubscriptionsModule { }