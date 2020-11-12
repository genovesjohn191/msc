import { McsQueryParam } from './mcs-query-param';

export class McsTicketQueryParams extends McsQueryParam {
  public state?: TicketState;
  public serviceId?: string;

  constructor() {
    super();
    this.state = '';
    this.serviceId = '';
  }
}

export type TicketState = 'open' | 'closed' | 'resolved' | '';