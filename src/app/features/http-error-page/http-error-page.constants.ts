import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
/** Components */
import { HttpErrorPageComponent } from './http-error-page.component';

/**
 * List of all the entry components
 */
export const httpErrorRoutesComponents: any[] = [
  HttpErrorPageComponent
];

/**
 * List of routest for the main module
 */
export const httpErrorPageRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(RouteKey.HttpErrorPage),
    component: HttpErrorPageComponent,
    data: { routeId: RouteKey.HttpErrorPage }
  }
];
