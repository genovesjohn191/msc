import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';
import { OrderResolver } from './order/order.resolver';
import { OrdersDashboardComponent } from './dashboard/orders-dashboard.component';
import { OrdersDashboardService } from './dashboard/orders-dashboard.service';
import { OrderGroupComponent } from './dashboard/group/order-group.component';

import { ServerManagedScaleComponent } from './server-managed-scale/server-managed-scale.component';
import { VdcScaleComponent } from './vdc-scale/vdc-scale.component';
import { VdcStorageExpandComponent } from './vdc-storage-expand/vdc-storage-expand.component';
import { VdcStorageCreateComponent } from './vdc-storage-create/vdc-storage-create.component';
import { ServiceInviewRaiseComponent } from './service-inview-raise/service-inview-raise.component';

/**
 * List of services for the main module
 */
export const ordersProviders: any[] = [
  OrderResolver,
  OrdersDashboardService
];

/**
 * List of all the entry components
 */
export const ordersComponents: any[] = [
  OrdersComponent,
  OrderComponent,
  OrdersDashboardComponent,
  OrderGroupComponent,
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
    path: 'dashboard',
    component: OrdersDashboardComponent,
    data: { routeId: RouteKey.OrdersDashboard }
  },
  {
    path: 'server-managed-scale',
    component: ServerManagedScaleComponent,
    data: { routeId: RouteKey.OrderServerManagedScale }
  },
  {
    path: 'vdc-scale',
    component: VdcScaleComponent,
    data: { routeId: RouteKey.OrderVdcScale }
  },
  {
    path: 'vdc-storage-expand',
    component: VdcStorageExpandComponent,
    data: { routeId: RouteKey.OrderVdcStorageExpand }
  },
  {
    path: 'vdc-storage-create',
    component: VdcStorageCreateComponent,
    data: { routeId: RouteKey.OrderVdcStorageCreate }
  },
  {
    path: 'services/inview',
    component: ServiceInviewRaiseComponent,
    data: { routeId: RouteKey.OrderServiceInviewRaise }
  },
  // Add additional routes above this line
  {
    path: ':id',
    component: OrderComponent,
    data: { routeId: RouteKey.OrderDetails },
    resolve: {
      order: OrderResolver
    }
  },
];
