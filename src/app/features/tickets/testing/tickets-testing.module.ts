import { NgModule } from '@angular/core';
/** Providers list */
import { ticketsProviders } from '../tickets.constants';
/** Modules */
import { ServersTestingModule } from '../../servers/testing';
import { FirewallsTestingModule } from '../../firewalls/testing';
import { ResourcesTestingModule } from '../../resources/testing';
import { CoreTestingModule } from '../../../core/testing';

@NgModule({
  imports: [
    CoreTestingModule,
    ResourcesTestingModule,
    ServersTestingModule,
    FirewallsTestingModule
  ],
  providers: [
    /** Tickets Services */
    ...ticketsProviders
  ]
})

export class TicketsTestingModule { }
