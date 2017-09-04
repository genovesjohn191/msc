import { Routes } from '@angular/router';
/** Components */
import { AccessDeniedPageComponent } from './access-denied-page.component';

/**
 * List of routest for the main module
 */
export const accessDeniedPageRoutes: Routes = [
  { path: 'access-denied', component: AccessDeniedPageComponent }
];
