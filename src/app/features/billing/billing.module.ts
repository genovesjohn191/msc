import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportWidgetModule } from '@app/features-shared';
import { FormFieldsModule } from '@app/features-shared/form-fields/form-fields.module';
import { SharedModule } from '@app/shared';

import { BillingComponent } from './billing.component';
import {
  billingProviders,
  billingRoutes
} from './billing.constants';
import { BillingServiceComponent } from './service/billing-service.component';
import { BillingSummaryComponent } from './summary/billing-summary.component';

@NgModule({
  declarations: [
    BillingComponent,
    BillingSummaryComponent,
    BillingServiceComponent
  ],
  imports: [
    SharedModule,
    ReportWidgetModule,
    FormFieldsModule,
    RouterModule.forChild(billingRoutes)
  ],
  providers: [
    ...billingProviders
  ]
})

export class BillingModule { }
