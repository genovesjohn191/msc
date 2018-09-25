import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Services */
import { ordersRoutesComponents } from './orders.constants';
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
  ]
})

export class OrdersModule { }
