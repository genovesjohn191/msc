import { NgModule } from '@angular/core';
/** Provider contants */
import { ordersProviders } from '../orders.constants';

@NgModule({
  providers: [
    ...ordersProviders
  ],
})

export class OrdersTestingModule { }
