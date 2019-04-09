import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';
/** Components */
import { ordersRoutes } from './orders.constants';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';

@NgModule({
  declarations: [
    OrdersComponent,
    OrderComponent
  ],
  imports: [
    RouterModule.forChild(ordersRoutes),
    SharedModule,
    FeaturesSharedModule
  ]
})

export class OrdersModule { }
