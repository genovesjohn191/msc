import { JsonProperty } from 'json-object-mapper';
import {
  TicketSubType,
  TicketSubTypeSerialization
} from '../enumerations/ticket-subtype';
import { McsTicketCreateAttachment } from './mcs-ticket-create-attachment';

export class McsTicketCreate {
  public shortDescription: string;
  public description: string;
  public customerReference: string;
  public serviceId: string[];

  @JsonProperty({ type: McsTicketCreateAttachment })
  public attachments: McsTicketCreateAttachment[];

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
    this.customerReference = undefined;
    this.serviceId = undefined;
    this.attachments = undefined;
  }
}
