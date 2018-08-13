import { Routes } from '@angular/router';
import {
  CoreRoutes,
  McsRouteKey
} from '../../core';
/** Components */
import { ProductsComponent } from './products.component';
import { ProductComponent } from './product/product.component';
/** Services */
import { ProductsService } from './products.service';
import { ProductService } from './product/product.service';
import { ProductsRepository } from './products.repository';
import { ProductCatalogRepository } from './product-catalog.repository';

/**
 * List of services for the main module
 */
export const productsProviders: any[] = [
  ProductsService,
  ProductService,
  ProductsRepository,
  ProductCatalogRepository
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
    path: CoreRoutes.getRoutePath(McsRouteKey.ProductDetail),
    component: ProductsComponent,
    data: { routeId: McsRouteKey.ProductDetail },
    children: [
      { path: '', component: ProductComponent }
    ]
  }
];
