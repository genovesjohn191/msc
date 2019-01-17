import { Injectable } from '@angular/core';
import { McsTicketCreate } from '@app/models';
import {
  McsTicketsRepository,
  McsServersRepository,
  McsFirewallsRepository,
  McsResourcesRepository
} from '@app/services';

@Injectable()
export class TicketCreateService {

  constructor(
    private _ticketsRepository: McsTicketsRepository,
    private _resourcesRepository: McsResourcesRepository,
    private _serversRepository: McsServersRepository,
    private _firewallsRepository: McsFirewallsRepository
  ) { }

  /**
   * Get server resources based from servers service
   */
  public getServerResources() {
    return this._resourcesRepository.getAll();
  }

  /**
   * Get server list based from servers service
   */
  public getServers() {
    return this._serversRepository.getAll();
  }

  /**
   * Get firewall list based from firewalls service
   */
  public getFirewalls() {
    return this._firewallsRepository.getAll();
  }

  /**
   * Create ticket according to inputted data
   * @param ticket Ticket to be created
   */
  public createTicket(ticket: McsTicketCreate) {
    return this._ticketsRepository.createTicket(ticket);
  }
}
