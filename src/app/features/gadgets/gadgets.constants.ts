import { Routes } from '@angular/router';
/** Components */
import { GadgetsComponent } from './gadgets.component';

/**
 * List of routes for the main module
 */
export const gadgetsRoutes: Routes = [
  {
    path: 'gadgets',
    component: GadgetsComponent
  }
];
