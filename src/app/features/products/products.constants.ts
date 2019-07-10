import { Routes } from '@angular/router';
import { ProductsComponent } from './products.component';

import { ProductComponent } from './product/product.component';
import { ProductService } from './product/product.service';
import { ProductResolver } from './product/product.resolver';

/**
 * List of services for the main module
 */
export const productsProviders: any[] = [
  ProductService,
  ProductResolver
];

/**
 * List of routes for the main module
 */
export const productsRoutes: Routes = [
  {
    path: '',
    component: ProductsComponent,
    children: [
      {
        path: '',
        component: ProductComponent,
        resolve: {
          product: ProductResolver
        }
      }
    ]
  }
];
