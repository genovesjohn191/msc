import { Routes } from '@angular/router';
import {
  CoreRoutes,
  McsRouteKey
} from '../../core';
/** Components/Services */
import { FirewallsService } from './firewalls.service';
import { FirewallsRepository } from './repositories/firewalls.repository';
import { FirewallsComponent } from './firewalls.component';
import {
  FirewallService,
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent
} from './firewall';

/**
 * List of services for the main module
 */
export const firewallProviders: any[] = [
  FirewallsService,
  FirewallService,
  FirewallsRepository
];

/**
 * List of all the entry components
 */
export const firewallsRoutesComponents: any[] = [
  FirewallsComponent,
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent
];

/**
 * List of routes for the main module
 */
export const firewallRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.Firewalls),
    component: FirewallsComponent,
    data: { routeId: McsRouteKey.Firewalls }
  },
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.FirewallDetail),
    component: FirewallComponent,
    data: { routeId: McsRouteKey.FirewallDetail },
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getRoutePath(McsRouteKey.FirewallDetailOverview),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.FirewallDetailOverview),
        component: FirewallOverviewComponent,
        data: { routeId: McsRouteKey.FirewallDetailOverview }
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.FirewallDetailPolicies),
        component: FirewallPoliciesComponent,
        data: { routeId: McsRouteKey.FirewallDetailPolicies }
      }
    ]
  }
];
