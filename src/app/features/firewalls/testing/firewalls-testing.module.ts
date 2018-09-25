import { NgModule } from '@angular/core';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { firewallProviders } from '../firewalls.constants';

@NgModule({
  imports: [
    CoreTestingModule,
    ServicesTestingModule
  ],
  providers: [
    /** Firewalls Services */
    ...firewallProviders
  ]
})

export class FirewallsTestingModule { }
