import { Routes } from '@angular/router';
/** Services */
import { ResourcesService } from './resources.service';
import { ResourcesRepository } from './resources.repository';

/**
 * List of services for the main module
 */
export const resourcesProviders: any[] = [
  ResourcesService,
  ResourcesRepository
];

/**
 * List of routes for the main module
 */
export const resourcesRoutes: Routes = [
];
