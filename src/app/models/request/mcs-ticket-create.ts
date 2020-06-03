import { JsonProperty } from '@app/utilities';
import {
  TicketSubType,
  TicketSubTypeSerialization
} from '../enumerations/ticket-subtype';
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
    serializer: TicketSubTypeSerialization,
    deserializer: TicketSubTypeSerialization
  })
  public subType: TicketSubType = undefined;
}
