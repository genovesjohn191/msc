import {
  TicketSubType,
  TicketSubTypeSerialization
} from '../enumerations/ticket-subtype';
import { TicketCreateAttachment } from '../request/ticket-create-attachment';
import { JsonProperty } from 'json-object-mapper';

export class TicketCreate {
  public shortDescription: string;
  public description: string;
  public serviceId: string[];

  @JsonProperty({ type: TicketCreateAttachment })
  public attachments: TicketCreateAttachment[];

  @JsonProperty({
    type: TicketSubType,
    serializer: TicketSubTypeSerialization,
    deserializer: TicketSubTypeSerialization
  })
  public subType: TicketSubType;

  constructor() {
    this.subType = undefined;
    this.shortDescription = undefined;
    this.description = undefined;
    this.serviceId = undefined;
    this.attachments = undefined;
  }
}
