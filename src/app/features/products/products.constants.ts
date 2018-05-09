import { Routes } from '@angular/router';
/** Components */
import { ProductsComponent } from './products.component';
import { ProductComponent } from './product/product.component';
/** Services */
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { ProductCatalogRepository } from './product-catalog.repository';

/**
 * List of services for the main module
 */
export const productsProviders: any[] = [
  ProductsService,
  ProductsRepository,
  ProductCatalogRepository
];

/**
 * List of routes for the main module
 */
export const productsRoutes: Routes = [
  {
    path: 'products/:id',
    component: ProductsComponent,
    children: [
      { path: '', component: ProductComponent }
    ]
  }
];
