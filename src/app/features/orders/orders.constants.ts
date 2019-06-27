import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';
import { OrderResolver } from './order/order.resolver';
import { ScaleManagedServerComponent } from './scale-managed-server/scale-managed-server.component';
import { VdcStorageExpandComponent } from './vdc-storage-expand/vdc-storage-expand.component';
import { VdcStorageCreateComponent } from './vdc-storage-new/vdc-storage-new.component';

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
  VdcStorageExpandComponent,
  VdcStorageCreateComponent
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
    component: VdcStorageExpandComponent,
    data: { routeId: RouteKey.OrderVdcStorageExpand }
  },
  {
    path: '',
    component: VdcStorageCreateComponent,
    data: { routeId: RouteKey.OrderVdcStorageNew }
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
