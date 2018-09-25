import { NgModule } from '@angular/core';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
/** Provider contants */
import { serversProviders } from '../servers.constants';

@NgModule({
  imports: [
    CoreTestingModule,
    ServicesTestingModule
  ],
  providers: [
    /** Servers Services */
    ...serversProviders
  ],
})

export class ServersTestingModule { }
