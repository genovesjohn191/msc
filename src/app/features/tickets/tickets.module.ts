import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { TicketActivityComponent } from './shared';
import { TicketsComponent } from './tickets.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketCreateComponent } from './ticket-create/ticket-create.component';
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
