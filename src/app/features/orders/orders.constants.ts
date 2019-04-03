import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
/** Components */
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';

/**
 * List of routes for the main module
 */
export const ordersRoutes: Routes = [
  {
    path: '',
    component: OrdersComponent
  },
  {
    path: '',
    component: OrderComponent,
    data: { routeId: RouteKey.OrderDetails }
  },
];
