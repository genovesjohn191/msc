import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsTicketQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'state' })
  public state?: TicketState;

  @JsonProperty({ name: 'service_id' })
  public serviceId?: string;
}

export type TicketState = 'open' | 'closed' | 'resolved' | '';