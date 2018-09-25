import { NgModule } from '@angular/core';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
/** Providers list */
import { ticketsProviders } from '../tickets.constants';

@NgModule({
  imports: [
    CoreTestingModule,
    ServicesTestingModule
  ],
  providers: [
    /** Tickets Services */
    ...ticketsProviders
  ]
})

export class TicketsTestingModule { }
