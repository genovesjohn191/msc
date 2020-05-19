import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { AggregationTargetsComponent } from './aggregation-targets.component';
import {
  AggregationTargetComponent,
  AggregationTargetManagementComponent,
  AggregationTargetLinkedServicesComponent,
  AggregationTargetResolver,
  AggregationTargetService
} from './aggregation-target';

/**
 * List of services for the main module
 */
export const aggregationTargetsProviders: any[] = [
  AggregationTargetResolver,
  AggregationTargetService
];

/**
 * List of routes for the main module
 */
export const aggregationTargetsRoutes: Routes = [
  {
    path: '',
    component: AggregationTargetsComponent
  },
  {
    path: ':id',
    component: AggregationTargetComponent,
    data: { routeId: RouteKey.BackupAggregationTargetsDetails },
    resolve: {
      aggregationTarget: AggregationTargetResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'management',
        pathMatch: 'full',
        data: { routeId: RouteKey.BackupAggregationTargetsDetailsManagement }
      },
      {
        path: 'management',
        component: AggregationTargetManagementComponent,
        data: { routeId: RouteKey.BackupAggregationTargetsDetailsManagement }
      },
      {
        path: 'linked-services',
        component: AggregationTargetLinkedServicesComponent,
        data: { routeId: RouteKey.BackupAggregationTargetsDetailsLinkedServices }
      }
    ]
  }
];
