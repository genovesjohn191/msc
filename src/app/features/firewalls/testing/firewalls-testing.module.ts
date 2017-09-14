import { NgModule } from '@angular/core';
/** Provider contants */
import { firewallsProviders } from '../firewalls.constants';
/** Modules */
import { CoreTestingModule } from '../../../core/testing';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    /** Firewalls Services */
    ...firewallsProviders
  ],
})

export class FirewallsTestingModule { }
