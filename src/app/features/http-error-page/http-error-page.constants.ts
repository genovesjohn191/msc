import { Routes } from '@angular/router';
import {
  CoreRoutes,
  McsRouteKey
} from '../../core';
/** Components */
import { HttpErrorPageComponent } from './http-error-page.component';

/**
 * List of routest for the main module
 */
export const httpErrorPageRoutes: Routes = [
  {
    path: CoreRoutes.getPath(McsRouteKey.HttpErrorPage),
    component: HttpErrorPageComponent
  }
];
