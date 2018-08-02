import { Routes } from '@angular/router';
import {
  CoreRoutes,
  McsRouteKey
} from '../../core';
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
 * List of routes for the main module
 */
export const ordersRoutes: Routes = [
  {
    path: CoreRoutes.getPath(McsRouteKey.Orders),
    component: OrdersComponent
  },
  {
    path: CoreRoutes.getPath(McsRouteKey.OrderDetail),
    component: OrderComponent
  },
];
