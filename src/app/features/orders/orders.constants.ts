import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
/** Components */
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';
import { ScaleManagedServerComponent } from './scale-managed-server/scale-managed-server.component';

/**
 * List of services for the main module
 */
export const ordersProviders: any[] = [
];

/**
 * List of all the entry components
 */
export const ordersRoutesComponents: any[] = [
  OrdersComponent,
  OrderComponent,
  ScaleManagedServerComponent
];

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
    component: ScaleManagedServerComponent,
    data: { routeId: RouteKey.OrderScaleManagedServer }
  },
  // Add additional routes above this line
  {
    path: '',
    component: OrderComponent,
    data: { routeId: RouteKey.OrderDetails }
  },
];
