import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
import { RouteKey } from '@app/models';
import { TicketsComponent } from './tickets.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketResolver } from './ticket/ticket.resolver';
import { TicketCreateComponent } from './ticket-create/ticket-create.component';

/**
 * List of services for the main module
 */
export const ticketsProviders: any[] = [
  TicketResolver
];

/**
 * List of routes for the main module
 */
export const ticketsRoutes: Routes = [
  {
    path: '',
    component: TicketsComponent
  },
  {
    path: 'create',
    component: TicketCreateComponent,
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.TicketCreate }
  },
  {
    path: ':id',
    component: TicketComponent,
    data: { routeId: RouteKey.TicketDetails },
    resolve: {
      ticket: TicketResolver
    }
  }
];
