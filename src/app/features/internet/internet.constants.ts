import { Routes } from '@angular/router';
/** Components */
import { InternetComponent } from './internet.component';

/**
 * List of services for the main module
 */
export const internetProviders: any[] = [
];

/**
 * List of all the entry components
 */
export const internetRoutesComponents: any[] = [
  InternetComponent
];

/**
 * List of routes for the main module
 */
export const internetRoutes: Routes = [
  {
    path: '',
    component: InternetComponent
  }
];
