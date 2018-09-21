import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { McsRouteKey } from '@app/models';
/** Services */
import { OrdersService } from './orders.service';
import { OrdersRepository } from './repositories/orders.repository';
import { OrderItemTypesRepository } from './repositories/order-item-types.repository';
/** Components */
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';

/**
 * List of services for the main module
 */
export const ordersProviders: any[] = [
  OrdersService,
  OrdersRepository,
  OrderItemTypesRepository
];

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
    path: CoreRoutes.getRoutePath(McsRouteKey.Orders),
    component: OrdersComponent,
    data: { routeId: McsRouteKey.Orders }
  },
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.OrderDetail),
    component: OrderComponent,
    data: { routeId: McsRouteKey.OrderDetail }
  },
];
