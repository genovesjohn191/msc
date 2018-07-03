import { NgModule } from '@angular/core';
/** Provider contants */
import { serversProviders } from '../servers.constants';
/** Modules */
import { ResourcesTestingModule } from '../../resources/testing';
import { CoreTestingModule } from '../../../core/testing';

@NgModule({
  imports: [
    CoreTestingModule,
    ResourcesTestingModule
  ],
  providers: [
    /** Servers Services */
    ...serversProviders
  ],
})

export class ServersTestingModule { }
