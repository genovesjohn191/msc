import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
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
