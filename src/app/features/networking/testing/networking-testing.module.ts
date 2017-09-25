import { NgModule } from '@angular/core';
/** Modules */
import { CoreTestingModule } from '../../../core/testing';
/** Constants */
import { networkingProviders } from '../networking.constants';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    /** Firewalls Services */
    ...networkingProviders
  ]
})

export class NetworkingTestingModule { }
