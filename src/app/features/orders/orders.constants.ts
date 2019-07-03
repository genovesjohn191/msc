import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';
import { OrderResolver } from './order/order.resolver';
import { ServerManagedScaleComponent } from './server-managed-scale/server-managed-scale.component';
import { VdcStorageExpandComponent } from './vdc-storage-expand/vdc-storage-expand.component';
import { VdcStorageCreateComponent } from './vdc-storage-create/vdc-storage-create.component';
import { ServiceInviewRaiseComponent } from './service-inview-raise/service-inview-raise.component';

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
  ServerManagedScaleComponent,
  VdcStorageExpandComponent,
  VdcStorageCreateComponent,
  ServiceInviewRaiseComponent
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
    component: ServerManagedScaleComponent,
    data: { routeId: RouteKey.OrderServerManagedScale }
  },
  {
    path: '',
    component: VdcStorageExpandComponent,
    data: { routeId: RouteKey.OrderVdcStorageExpand }
  },
  {
    path: '',
    component: VdcStorageCreateComponent,
    data: { routeId: RouteKey.OrderVdcStorageCreate }
  },
  {
    path: '',
    component: ServiceInviewRaiseComponent,
    data: { routeId: RouteKey.OrderServiceInviewRaise }
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
