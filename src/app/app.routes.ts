import { Routes } from '@angular/router';
import {
  consolePageRoutes,
  defaultPageRoutes
} from './page-layout';

/**
 * Add all the lazy loaded modules in this routes else add it on the defaul-page-module
 */
export const routes: Routes = [
  ...consolePageRoutes,
  ...defaultPageRoutes
];
