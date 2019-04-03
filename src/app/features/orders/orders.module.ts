import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
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
    SharedModule,
    RouterModule.forChild(ordersRoutes)
  ]
})

export class OrdersModule { }
