import { Routes } from '@angular/router';
/** Components */
import { HttpErrorPageComponent } from './http-error-page.component';

/**
 * List of routest for the main module
 */
export const httpErrorPageRoutes: Routes = [
  {
    path: '',
    component: HttpErrorPageComponent
  }
];
