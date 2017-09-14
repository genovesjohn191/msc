import { NgModule } from '@angular/core';
/** Modules */
import { SharedModule } from '../../shared';
/** Components/Services */
import {
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent,
  FirewallService
} from './firewall';
import { FirewallsService } from './firewalls.service';

@NgModule({
  declarations: [
    FirewallComponent,
    FirewallOverviewComponent,
    FirewallPoliciesComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    FirewallsService,
    FirewallService,
  ]
})

export class FirewallsModule { }
