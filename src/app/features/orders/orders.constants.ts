import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';
import { OrderResolver } from './order/order.resolver';
import { ScaleManagedServerComponent } from './scale-managed-server/scale-managed-server.component';
import { ExpandVdcStorageComponent } from './expand-vdc-storage/expand-vdc-storage.component';

/**
 * List of services for the main module
 */
export const ordersProviders: any[] = [
  OrderResolver
];

/**
 * List of all the entry components
 */
export const ordersRoutesComponents: any[] = [
  OrdersComponent,
  OrderComponent,
  ScaleManagedServerComponent,
  ExpandVdcStorageComponent
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
  {
    path: '',
    component: ExpandVdcStorageComponent,
    data: { routeId: RouteKey.OrderExpandVdcStorage }
  },
  // Add additional routes above this line
  {
    path: '',
    component: OrderComponent,
    data: { routeId: RouteKey.OrderDetails },
    resolve: {
      order: OrderResolver
    }
  },
];
