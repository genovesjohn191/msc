import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
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
    path: '',
    component: TicketsComponent
  },
  {
    path: '',
    component: TicketCreateComponent,
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.TicketCreate }
  },
  {
    path: '',
    component: TicketComponent,
    data: { routeId: RouteKey.TicketDetails }
  }
];
