import { Injectable } from '@angular/core';
import { McsTicketCreate } from '@app/models';
import { TicketsService } from '../tickets.service';

@Injectable()
export class TicketCreateService {

  constructor(private _ticketsService: TicketsService) { }

  /**
   * Get server resources based from servers service
   */
  public getServerResources() {
    return this._ticketsService.getServerResources();
  }

  /**
   * Get server list based from servers service
   */
  public getServers() {
    return this._ticketsService.getServers();
  }

  /**
   * Get firewall list based from firewalls service
   */
  public getFirewalls() {
    return this._ticketsService.getFirewalls();
  }

  /**
   * Create ticket according to inputted data
   * @param ticket Ticket to be created
   */
  public createTicket(ticket: McsTicketCreate) {
    return this._ticketsService.createTicket(ticket);
  }
}
