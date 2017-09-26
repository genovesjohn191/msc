import { Routes } from '@angular/router';
/** Components */
import { TicketsComponent } from './tickets.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketCreateComponent } from './ticket-create';
/** Services */
import { TicketsService } from './tickets.service';
import { TicketCreateService } from './ticket-create';
import { ServersService } from '../servers';
import { FirewallsService } from '../networking';

/**
 * List of services for the main module
 */
export const ticketsProviders: any[] = [
  TicketsService,
  TicketCreateService,
  ServersService,
  FirewallsService
];

/**
 * List of routes for the main module
 */
export const ticketsRoutes: Routes = [
  { path: 'tickets', component: TicketsComponent },
  { path: 'tickets/create', component: TicketCreateComponent },
  { path: 'tickets/:id', component: TicketComponent }
];
