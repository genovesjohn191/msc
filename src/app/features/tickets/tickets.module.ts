import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { TicketActivityComponent } from './shared';
import { TicketsComponent } from './tickets.component';
import { TicketComponent } from './ticket/ticket.component';
/** Create Ticket */
import { TicketCreateComponent } from './ticket-create';
import {
  ticketsProviders,
  ticketsRoutes
} from './tickets.constants';

@NgModule({
  declarations: [
    TicketsComponent,
    TicketComponent,
    TicketActivityComponent,
    TicketCreateComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(ticketsRoutes)
  ],
  providers: [
    ...ticketsProviders
  ]
})

export class TicketsModule { }
