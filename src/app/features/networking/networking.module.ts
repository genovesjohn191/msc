import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared';
/** Networking Components/Services */
import { NetworkingComponent } from './networking.component';
import { networkingProviders } from './networking.constants';
/** Firewalls Components/Services */
import {
  FirewallsComponent,
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent
} from './firewalls';

@NgModule({
  declarations: [
    NetworkingComponent,
    FirewallsComponent,
    FirewallComponent,
    FirewallOverviewComponent,
    FirewallPoliciesComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: [
    ...networkingProviders
  ]
})

export class NetworkingModule { }
