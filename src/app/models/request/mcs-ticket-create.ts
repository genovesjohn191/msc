import { JsonProperty } from '@app/utilities';
import {
  TicketType,
  TicketTypeSerialization
} from '../enumerations/ticket-type';
import { McsTicketCreateAttachment } from './mcs-ticket-create-attachment';

export class McsTicketCreate {
  @JsonProperty()
  public shortDescription: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public customerReference: string = undefined;

  @JsonProperty()
  public serviceId: string[] = undefined;

  @JsonProperty({ target: McsTicketCreateAttachment })
  public attachments: McsTicketCreateAttachment[] = undefined;

  @JsonProperty({
    serializer: TicketTypeSerialization,
    deserializer: TicketTypeSerialization
  })
  public ticketType: TicketType = undefined;
}
