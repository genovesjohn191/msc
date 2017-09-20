import { Routes } from '@angular/router';
/** Components */
import { NetworkingComponent } from './networking.component';
import {
  FirewallsComponent,
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent
} from './firewalls';

/**
 * List of routes for the main module
 */
export const networkingRoutes: Routes = [
  // { path: 'networking', component: NetworkingComponent },
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
