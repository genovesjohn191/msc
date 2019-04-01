import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
/** Firewalls */
import { firewallProviders } from './firewalls.constants';
import { FirewallsComponent } from './firewalls.component';
import {
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent,
  FirewallPolicyComponent
} from './firewall';

@NgModule({
  declarations: [
    FirewallsComponent,
    FirewallComponent,
    FirewallOverviewComponent,
    FirewallPoliciesComponent,
    FirewallPolicyComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: [
    ...firewallProviders
  ]
})

export class FirewallsModule { }
