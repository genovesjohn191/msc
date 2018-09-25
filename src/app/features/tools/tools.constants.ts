import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { McsRouteKey } from '@app/models';
/** Components */
import { ToolsComponent } from './tools.component';

/**
 * List of all the entry components
 */
export const toolsRoutesComponents: any[] = [
  ToolsComponent
];

/**
 * List of routes for the main module
 */
export const toolsRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.OtherTools),
    component: ToolsComponent,
    data: { routeId: McsRouteKey.OtherTools }
  }
];
