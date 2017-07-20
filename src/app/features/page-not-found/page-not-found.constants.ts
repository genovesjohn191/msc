import { Routes } from '@angular/router';
/** Components */
import { PageNotFoundComponent } from './page-not-found.component';

/**
 * List of routest for the main module
 */
export const pageNotFoundRoutes: Routes = [
  { path: '**', component: PageNotFoundComponent }
];
