import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportWidgetModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

import { BillingComponent } from './billing.component';
import {
  billingProviders,
  billingRoutes
} from './billing.constants';
import { BillingServiceComponent } from './service/billing-service.component';
import { BillingSummaryComponent } from './summary/billing-summary.component';
import { BillingTabularComponent } from './tabular/billing-tabular.component';

@NgModule({
  declarations: [
    BillingComponent,
    BillingSummaryComponent,
    BillingServiceComponent,
    BillingTabularComponent
  ],
  imports: [
    SharedModule,
    ReportWidgetModule,
    RouterModule.forChild(billingRoutes)
  ],
  providers: [
    ...billingProviders
  ]
})

export class BillingModule { }
