import { Routes } from '@angular/router';
/** Components */
import { PortalsComponent } from './portals.component';
/** Services */
import { PortalsService } from './portals.service';

/**
 * List of services for the main module
 */
export const portalsProviders: any[] = [
  PortalsService
];

/**
 * List of routes for the main module
 */
export const portalsRoutes: Routes = [
  { path: 'portals', component: PortalsComponent }
];
