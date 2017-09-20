import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared';
/** Networking Components/Services */
import { NetworkingComponent } from './networking.component';
import { NetworkingService } from './networking.service';
/** Firewalls Components/Services */
import {
  FirewallsComponent,
  FirewallComponent,
  FirewallOverviewComponent,
  FirewallPoliciesComponent,
  FirewallsService,
  FirewallService
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
    NetworkingService,
    FirewallsService,
    FirewallService
  ]
})

export class NetworkingModule { }
