import { TicketPriority } from '../enumerations/ticket-priority';
import { TicketStatus } from '../enumerations/ticket-status';
import { TicketSubType } from '../enumerations/ticket-subtype';

export class Ticket {
  public id: any;
  public number: string;
  public subType: TicketSubType;
  public crispTicketNumber: string;
  public state: TicketStatus;
  public requestor: string;
  public company: string;
  public impact: string;
  public priority: TicketPriority;
  public slaDue: string;
  public serviceId: string[];
  public createdOn: Date;
  public updatedOn: Date;
}
