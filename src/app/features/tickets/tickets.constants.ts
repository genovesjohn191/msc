import { Routes } from '@angular/router';
/** Components */
import { TicketsComponent } from './tickets.component';
import { TicketComponent } from './ticket/ticket.component';
/** Services */
import { TicketsService } from './tickets.service';

/**
 * List of services for the main module
 */
export const ticketsProviders: any[] = [
  TicketsService
];

/**
 * List of routes for the main module
 */
export const ticketsRoutes: Routes = [
  { path: 'tickets', component: TicketsComponent },
  { path: 'tickets/:id', component: TicketComponent }
];
