import { NgModule } from '@angular/core';
/** Components */
import { TicketsComponent } from './tickets.component';
import { TicketComponent } from './ticket/ticket.component';
/** Modules */
import { SharedModule } from '../../shared';
/** Providers List */
import { ticketsProviders } from './tickets.constants';
/** Shared Components */
import {
  TicketServiceComponent,
  TicketActivityComponent,
  TicketAttachmentComponent,
  TicketNewCommentComponent
} from './shared';
/** Create Ticket */
import { TicketCreateComponent } from './ticket-create';

@NgModule({
  declarations: [
    TicketsComponent,
    TicketComponent,
    TicketServiceComponent,
    TicketActivityComponent,
    TicketAttachmentComponent,
    TicketNewCommentComponent,
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
