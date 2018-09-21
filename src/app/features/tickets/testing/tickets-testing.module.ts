import { NgModule } from '@angular/core';
/** Providers list */
import { ticketsProviders } from '../tickets.constants';
/** Modules */
import { ServersTestingModule } from '@app/features/servers/testing';
import { FirewallsTestingModule } from '@app/features/firewalls/testing';
import { ResourcesTestingModule } from '@app/features/resources/testing';
import { CoreTestingModule } from '@app/core/testing';

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
