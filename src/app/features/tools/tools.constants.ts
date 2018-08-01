import { Routes } from '@angular/router';
import {
  CoreRoutes,
  McsRouteKey
} from '../../core';
/** Components */
import { ToolsComponent } from './tools.component';
/** Services */
import { ToolsService } from './tools.service';
import { ToolsRepository } from './tools.repository';

/**
 * List of services for the main module
 */
export const toolsProviders: any[] = [
  ToolsService,
  ToolsRepository
];

/**
 * List of routes for the main module
 */
export const toolsRoutes: Routes = [
  {
    path: CoreRoutes.getPath(McsRouteKey.OtherTools),
    component: ToolsComponent
  }
];
