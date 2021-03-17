import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';

import { CatalogPageComponent } from './catalog-page.component';
import { CatalogPageGuard } from './catalog-page.guard';

export const catalogPageRoutes: Routes = [
  {
    path: '',
    component: CatalogPageComponent,
    canActivate: [CatalogPageGuard],
    children: [
      {
        path: '',
        data: { routeId: RouteKey.Catalog },
        loadChildren: () => import('./catalog/catalog.module').then(m => m.CatalogModule)
      }
    ]
  }
];
