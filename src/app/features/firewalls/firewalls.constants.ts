import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
/** Components/Services */
import { FirewallsComponent } from './firewalls.component';
import {
  FirewallResolver,
  FirewallService,
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent
} from './firewall';

/**
 * List of services for the main module
 */
export const firewallProviders: any[] = [
  FirewallResolver,
  FirewallService
];

/**
 * List of routes for the main module
 */
export const firewallRoutes: Routes = [
  {
    path: '',
    component: FirewallsComponent
  },
  {
    path: ':id',
    component: FirewallComponent,
    data: { routeId: RouteKey.FirewallDetails },
    resolve: {
      firewall: FirewallResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.FirewallDetailsOverview }
      },
      {
        path: 'overview',
        component: FirewallOverviewComponent,
        data: { routeId: RouteKey.FirewallDetailsOverview }
      },
      {
        path: 'policies',
        component: FirewallPoliciesComponent,
        data: { routeId: RouteKey.FirewallDetailsPolicies }
      }
    ]
  }
];
