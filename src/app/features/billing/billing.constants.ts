import { Routes } from '@angular/router';
import { McsPublicCloudOnlyGuard } from '@app/core/guards/mcs-public-cloud-only.guard';
import { RouteKey } from '@app/models';

import { BillingComponent } from './billing.component';
import { BillingServiceComponent } from './service/billing-service.component';
import { BillingSummaryComponent } from './summary/billing-summary.component';
import { BillingTabularComponent } from './tabular/billing-tabular.component';

/**
 * List of services for the main module
 */
export const billingProviders: any[] = [
];

/**
 * List of routes for the main module
 */
export const billingRoutes: Routes = [
  {
    path: '',
    component: BillingComponent,
    canActivate: [McsPublicCloudOnlyGuard],
    children: [
      {
        path: '',
        redirectTo: 'summary',
        pathMatch: 'full',
        data: { routeId: RouteKey.BillingSummary }
      },
      {
        path: 'summary',
        component: BillingSummaryComponent,
        data: { routeId: RouteKey.BillingSummary }
      },
      {
        path: 'service',
        component: BillingServiceComponent,
        data: { routeId: RouteKey.BillingService }
      },
      {
        path: 'tabular',
        component: BillingTabularComponent,
        data: { routeId: RouteKey.BillingTabular }
      },
    ]
  }
];
