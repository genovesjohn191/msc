import { Provider } from '@angular/core';
import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { CatalogComponent } from './catalog.component';
import { SolutionComponent } from './solution/solution.component';
import { SolutionResolver } from './solution/solution.resolver';
import { ProductsPlatformComponent } from './products-platform/products-platform.component';
import { ProductsPlatformResolver } from './products-platform/products-platform.resolver';
import { ProductComponent } from './product/product.component';
import { ProductResolver } from './product/product.resolver';
import { SolutionsComponent } from './solutions/solutions.component';
import { SolutionsResolver } from './solutions/solutions.resolver';
import { CatalogResolver } from './catalog.resolver';

export const catalogProviders: Provider[] = [
  CatalogResolver,
  ProductsPlatformResolver,
  ProductResolver,
  SolutionResolver,
  SolutionsResolver
];

export const catalogComponents: any = [
  CatalogComponent,
  ProductsPlatformComponent,
  ProductComponent,
  SolutionsComponent,
  SolutionComponent
];

export const catalogRoutes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    resolve: {
      catalog: CatalogResolver
    },
    children: [
      {
        path: 'solutions',
        component: SolutionsComponent,
        data: { routeId: RouteKey.CatalogSolutions },
        resolve: {
          solutions: SolutionsResolver
        }
      },
      {
        path: 'solutions/:id',
        component: SolutionComponent,
        data: { routeId: RouteKey.CatalogSolution },
        resolve: {
          solution: SolutionResolver
        }
      },
      {
        path: 'products/:id',
        component: ProductComponent,
        data: { routeId: RouteKey.CatalogProduct },
        resolve: {
          product: ProductResolver
        }
      },
      {
        path: 'products/platform/:id',
        component: ProductsPlatformComponent,
        data: { routeId: RouteKey.CatalogProductsPlatform },
        resolve: {
          platform: ProductsPlatformResolver
        }
      }
    ]
  }
];
