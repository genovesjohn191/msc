import { TicketSubType } from '../enumerations/ticket-subtype';
import { TicketCreateAttachment } from '../request/ticket-create-attachment';

export class TicketCreate {
  public subType: TicketSubType;
  public shortDescription: string;
  public description: string;
  public serviceId: string[];
  public attachments: TicketCreateAttachment[];
}
