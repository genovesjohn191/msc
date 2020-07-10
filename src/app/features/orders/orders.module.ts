import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

import {
  ordersComponents,
  ordersProviders
} from './orders.constants';
import { ordersRoutes } from './orders.constants';

@NgModule({
  declarations: ordersComponents,
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(ordersRoutes),
  ],
  providers: [...ordersProviders]
})

export class OrdersModule { }
