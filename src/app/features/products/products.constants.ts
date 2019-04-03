import { Routes } from '@angular/router';
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
 * List of routes for the main module
 */
export const productsRoutes: Routes = [
  {
    path: '',
    component: ProductsComponent,
    children: [
      { path: '', component: ProductComponent }
    ]
  }
];
