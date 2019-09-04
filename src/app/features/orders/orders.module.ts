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
    RouterModule.forChild(ordersRoutes),
    SharedModule,
    FeaturesSharedModule
  ],
  providers: [...ordersProviders]
})

export class OrdersModule { }
