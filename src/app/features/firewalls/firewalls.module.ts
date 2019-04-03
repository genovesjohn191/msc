import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Firewalls */
import {
  firewallProviders,
  firewallRoutes
} from './firewalls.constants';
import { FirewallsComponent } from './firewalls.component';
import {
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent,
  FirewallPolicyComponent
} from './firewall';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    FirewallsComponent,
    FirewallComponent,
    FirewallOverviewComponent,
    FirewallPoliciesComponent,
    FirewallPolicyComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(firewallRoutes)
  ],
  providers: [
    ...firewallProviders
  ]
})

export class FirewallsModule { }
