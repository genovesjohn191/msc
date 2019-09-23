import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';
import { OrderResolver } from './order/order.resolver';
import { OrdersDashboardComponent } from './dashboard/orders-dashboard.component';
import { ServerManagedScaleComponent } from './server-managed-scale/server-managed-scale.component';
import { VdcScaleComponent } from './vdc-scale/vdc-scale.component';
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
export const ordersComponents: any[] = [
  OrdersComponent,
  OrdersDashboardComponent,
  OrderComponent,
  ServerManagedScaleComponent,
  VdcScaleComponent,
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
    component: OrdersDashboardComponent,
    data: { routeId: RouteKey.OrdersDashboard }
  },
  {
    path: '',
    component: ServerManagedScaleComponent,
    data: { routeId: RouteKey.OrderServerManagedScale }
  },
  {
    path: '',
    component: VdcScaleComponent,
    data: { routeId: RouteKey.OrderVdcScale }
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
