import { NgModule } from '@angular/core';
/** Providers list */
import { ticketsProviders } from '../tickets.constants';
/** Modules */
import { CoreTestingModule } from '../../../core/testing';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    /** Tickets Services */
    ...ticketsProviders
  ]
})

export class TicketsTestingModule { }
