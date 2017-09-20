import { TicketActivityType } from './enumerations/ticket-activity-type';

export class TicketActivity {
  public header: string;
  public content: string;
  public date: Date;
  public type: TicketActivityType;
}
