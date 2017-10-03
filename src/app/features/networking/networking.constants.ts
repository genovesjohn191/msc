import { Routes } from '@angular/router';
/** Components/Services */
import {
  FirewallsComponent,
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent,
  FirewallsService,
  FirewallService
} from './firewalls';

/**
 * List of services for the main module
 */
export const networkingProviders: any[] = [
  FirewallsService,
  FirewallService
];

/**
 * List of routes for the main module
 */
export const networkingRoutes: Routes = [
  {
    path: 'networking',
    children: [
      { path: '', redirectTo: 'firewalls', pathMatch: 'full' },
      { path: 'firewalls', component: FirewallsComponent },
      {
        path: 'firewalls/:id',
        component: FirewallComponent,
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview', component: FirewallOverviewComponent },
          { path: 'policies', component: FirewallPoliciesComponent }
        ]
      }
    ]
  }
];
