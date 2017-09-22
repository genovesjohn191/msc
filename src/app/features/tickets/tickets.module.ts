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
  TicketActivityComponent,
  TicketNewCommentComponent
} from './shared';

@NgModule({
  declarations: [
    TicketsComponent,
    TicketComponent,
    TicketActivityComponent,
    TicketNewCommentComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...ticketsProviders
  ]
})

export class TicketsModule { }
