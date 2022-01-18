import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

import { TicketActivityComponent } from './shared';
import { TicketCreateComponent } from './ticket-create/ticket-create.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketsComponent } from './tickets.component';
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
    FeaturesSharedModule,
    RouterModule.forChild(ticketsRoutes)
  ],
  providers: [
    ...ticketsProviders
  ]
})

export class TicketsModule { }
