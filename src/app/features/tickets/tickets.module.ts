import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { TicketActivityComponent } from './shared';
import { TicketsComponent } from './tickets.component';
import { TicketComponent } from './ticket/ticket.component';
/** Create Ticket */
import { TicketCreateComponent } from './ticket-create';
import { ticketsProviders } from './tickets.constants';

@NgModule({
  declarations: [
    TicketsComponent,
    TicketComponent,
    TicketActivityComponent,
    TicketCreateComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...ticketsProviders
  ]
})

export class TicketsModule { }
