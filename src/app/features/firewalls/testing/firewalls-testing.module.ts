import { NgModule } from '@angular/core';
import { CoreTestingModule } from '@app/core/testing';
import { firewallProviders } from '../firewalls.constants';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    /** Firewalls Services */
    ...firewallProviders
  ]
})

export class FirewallsTestingModule { }
