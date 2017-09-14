import { Routes } from '@angular/router';
/** Components */
import {
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent
} from './firewall';
/** Services */
import { FirewallsService } from './firewalls.service';
import { FirewallService } from './firewall/firewall.service';

/**
 * List of services for the main module
 */
export const firewallsProviders: any[] = [
  FirewallsService,
  FirewallService
];

/**
 * List of routes for the main module
 */
export const firewallsRoutes: Routes = [
  {
    path: 'firewalls/:id',
    component: FirewallComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: FirewallOverviewComponent },
      { path: 'policies', component: FirewallPoliciesComponent },
    ]
  },
];
