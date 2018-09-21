import { NgModule } from '@angular/core';
/** Provider contants */
import { serversProviders } from '../servers.constants';
/** Modules */
import { CoreTestingModule } from '@app/core/testing';
import { ResourcesTestingModule } from '../../resources/testing';

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
