import { NgModule } from '@angular/core';
/** Provider contants */
import { serversProviders } from '../servers.constants';
/** Modules */
import { CoreTestingModule } from '../../../core/testing';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    /** Servers Services */
    ...serversProviders
  ],
})

export class ServersTestingModule { }
