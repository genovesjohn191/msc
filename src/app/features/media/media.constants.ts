import { Routes } from '@angular/router';
/** Components */
import { MediaComponent } from './media.component';
/** Services */
import { MediaService } from './media.service';
import { MediaRepository } from './repositories/media.repository';

/**
 * List of services for the main module
 */
export const mediaProviders: any[] = [
  MediaService,
  MediaRepository
];
/**
 * List of routes for the main module
 */
export const mediaRoutes: Routes = [
  {
    path: 'compute/media', component: MediaComponent
  }
];
