import { Routes } from '@angular/router';
import { NetworkingService } from './networking.service';
/** Components/Services */
import {
  FirewallsComponent,
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent,
  FirewallsService,
  FirewallService,
  FirewallsRepository
} from './firewalls';

/**
 * List of services for the main module
 */
export const networkingProviders: any[] = [
  NetworkingService,
  FirewallsService,
  FirewallService,
  FirewallsRepository
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
