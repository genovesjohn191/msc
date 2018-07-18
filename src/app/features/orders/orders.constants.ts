import { Routes } from '@angular/router';
/** Services */
import { OrdersService } from './orders.service';
import { OrdersRepository } from './repositories/orders.repository';
import { OrderItemTypesRepository } from './repositories/order-item-types.repository';
/** Components */
import { OrdersComponent } from './orders.component';

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
    path: 'orders', component: OrdersComponent
  },
];
