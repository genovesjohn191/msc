import { NgModule } from '@angular/core';
/** Modules */
import { CoreTestingModule } from '../../../core/testing';
/** Constants */
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
