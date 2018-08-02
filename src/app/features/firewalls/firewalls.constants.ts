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
 * List of routes for the main module
 */
export const firewallRoutes: Routes = [
  {
    path: CoreRoutes.getPath(McsRouteKey.Firewalls),
    component: FirewallsComponent
  },
  {
    path: CoreRoutes.getPath(McsRouteKey.FirewallDetail),
    component: FirewallComponent,
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getPath(McsRouteKey.FirewallDetailOverview),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.FirewallDetailOverview),
        component: FirewallOverviewComponent
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.FirewallDetailPolicies),
        component: FirewallPoliciesComponent
      }
    ]
  }
];
