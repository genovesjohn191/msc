import { Routes } from '@angular/router';
/** Components */
import { ToolsComponent } from './tools.component';
/** Services */
import { ToolsService } from './tools.service';

/**
 * List of services for the main module
 */
export const toolsProviders: any[] = [
  ToolsService
];

/**
 * List of routes for the main module
 */
export const toolsRoutes: Routes = [
  { path: 'tools', component: ToolsComponent }
];
