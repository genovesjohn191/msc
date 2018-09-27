import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
/** Components */
import { ProductsComponent } from './products.component';
import { ProductComponent } from './product/product.component';
/** Services */
import { ProductService } from './product/product.service';

/**
 * List of services for the main module
 */
export const productsProviders: any[] = [
  ProductService
];

/**
 * List of all the entry components
 */
export const productsRoutesComponents: any[] = [
  ProductsComponent,
  ProductComponent
];

/**
 * List of routes for the main module
 */
export const productsRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(RouteKey.ProductDetail),
    component: ProductsComponent,
    data: { routeId: RouteKey.ProductDetail },
    children: [
      { path: '', component: ProductComponent }
    ]
  }
];
