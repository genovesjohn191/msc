import { Routes } from '@angular/router';
import {
  McsNavigateAwayGuard,
  CoreRoutes
} from '@app/core';
import { RouteKey } from '@app/models';
/** Components */
import { TicketsComponent } from './tickets.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketCreateComponent } from './ticket-create';
/** Services */
import { TicketCreateService } from './ticket-create';

/**
 * List of services for the main module
 */
export const ticketsProviders: any[] = [
  TicketCreateService
];

/**
 * List of routes for the main module
 */
export const ticketsRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(RouteKey.Tickets),
    component: TicketsComponent,
    data: { routeId: RouteKey.Tickets }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.TicketCreate),
    component: TicketCreateComponent,
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.TicketCreate }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.TicketDetail),
    component: TicketComponent,
    data: { routeId: RouteKey.TicketDetail }
  }
];
