import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Services */
import {
  ordersProviders,
  ordersRoutesComponents
} from './orders.constants';
/** Components */
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';

@NgModule({
  entryComponents: [
    ...ordersRoutesComponents
  ],
  declarations: [
    OrdersComponent,
    OrderComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...ordersProviders
  ]
})

export class OrdersModule { }
