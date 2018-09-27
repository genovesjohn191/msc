import { Routes } from '@angular/router';
import { CoreRoutes } from '../../core';
import { RouteKey } from '@app/models';
/** Components/Services */
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
  FirewallService
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
    path: CoreRoutes.getRoutePath(RouteKey.Firewalls),
    component: FirewallsComponent,
    data: { routeId: RouteKey.Firewalls }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.FirewallDetail),
    component: FirewallComponent,
    data: { routeId: RouteKey.FirewallDetail },
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getRoutePath(RouteKey.FirewallDetailOverview),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.FirewallDetailOverview),
        component: FirewallOverviewComponent,
        data: { routeId: RouteKey.FirewallDetailOverview }
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.FirewallDetailPolicies),
        component: FirewallPoliciesComponent,
        data: { routeId: RouteKey.FirewallDetailPolicies }
      }
    ]
  }
];
