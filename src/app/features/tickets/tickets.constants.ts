import { Routes } from '@angular/router';
import {
  McsNavigateAwayGuard,
  CoreRoutes
} from '@app/core';
import { McsRouteKey } from '@app/models';
/** Components */
import { TicketsComponent } from './tickets.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketCreateComponent } from './ticket-create';
/** Services */
import { ServersService } from '@app/features/servers';
import { FirewallsService } from '@app/features/firewalls';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { TicketCreateService } from './ticket-create';

/**
 * List of services for the main module
 */
export const ticketsProviders: any[] = [
  TicketsService,
  TicketsRepository,
  TicketCreateService,
  ServersService,
  FirewallsService
];

/**
 * List of all the entry components
 */
export const ticketsRoutesComponents: any[] = [
  TicketsComponent,
  TicketComponent,
  TicketCreateComponent
];

/**
 * List of routes for the main module
 */
export const ticketsRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.Tickets),
    component: TicketsComponent,
    data: { routeId: McsRouteKey.Tickets }
  },
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.TicketCreate),
    component: TicketCreateComponent,
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: McsRouteKey.TicketCreate }
  },
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.TicketDetail),
    component: TicketComponent,
    data: { routeId: McsRouteKey.TicketDetail }
  }
];
