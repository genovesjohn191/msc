import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared';
/** Firewalls */
import {
  firewallProviders,
  firewallsRoutesComponents
} from './firewalls.constants';
import { FirewallsComponent } from './firewalls.component';
import {
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent,
  FirewallPolicyComponent
} from './firewall';

@NgModule({
  entryComponents: [
    ...firewallsRoutesComponents
  ],
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
