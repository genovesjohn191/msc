import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
/** Components */
import { ToolsComponent } from './tools.component';

/**
 * List of routes for the main module
 */
export const toolsRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(RouteKey.OtherTools),
    component: ToolsComponent,
    data: { routeId: RouteKey.OtherTools }
  }
];
