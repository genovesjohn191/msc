import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Services */
import { ordersProviders } from './orders.constants';
/** Components */
import { OrdersComponent } from './orders.component';

@NgModule({
  declarations: [
    OrdersComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...ordersProviders
  ]
})

export class OrdersModule { }
