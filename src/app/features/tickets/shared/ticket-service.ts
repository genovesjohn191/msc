import { TicketServiceData } from './ticket-service-data';

export class TicketService {
  public serviceName: string;
  public serviceItems: TicketServiceData[];

  constructor() {
    this.serviceName = '';
    this.serviceItems = new Array();
  }
}
