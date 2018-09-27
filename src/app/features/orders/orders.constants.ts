import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
/** Components */
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';

/**
 * List of all the entry components
 */
export const ordersRoutesComponents: any[] = [
  OrdersComponent,
  OrderComponent
];

/**
 * List of routes for the main module
 */
export const ordersRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(RouteKey.Orders),
    component: OrdersComponent,
    data: { routeId: RouteKey.Orders }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.OrderDetail),
    component: OrderComponent,
    data: { routeId: RouteKey.OrderDetail }
  },
];
