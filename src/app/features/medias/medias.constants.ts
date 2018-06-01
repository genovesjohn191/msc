import { Routes } from '@angular/router';
/** Components */
import { MediasComponent } from './medias.component';
/** Services */
import { MediasService } from './medias.service';
import { MediasRepository } from './medias.repository';
/**
 * List of services for the main module
 */
export const mediasProviders: any[] = [
  MediasService,
  MediasRepository
];
/**
 * List of routes for the main module
 */
export const mediasRoutes: Routes = [
  {
    path: 'medias', component: MediasComponent
  }
];
