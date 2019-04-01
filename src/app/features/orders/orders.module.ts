import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';

@NgModule({
  declarations: [
    OrdersComponent,
    OrderComponent
  ],
  imports: [
    SharedModule
  ]
})

export class OrdersModule { }
