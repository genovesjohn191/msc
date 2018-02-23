import {
  TicketSubType,
  TicketSubTypeSerialization
} from '../enumerations/ticket-subtype';
import { TicketCreateAttachment } from '../request/ticket-create-attachment';
import { JsonProperty } from 'json-object-mapper';

export class TicketCreate {

  @JsonProperty({
    type: TicketSubType,
    serializer: TicketSubTypeSerialization,
    deserializer: TicketSubTypeSerialization
  })
  public subType: TicketSubType;
  public shortDescription: string;
  public description: string;
  public serviceId: string[];
  public attachments: TicketCreateAttachment[];

  constructor() {
    this.subType = undefined;
    this.shortDescription = undefined;
    this.description = undefined;
    this.serviceId = undefined;
    this.attachments = undefined;
  }
}
