import { JsonProperty } from 'json-object-mapper';
import {
  McsDateSerialization,
  McsEntityBase
} from '../../../../core';
import {
  TicketPriority,
  TicketPrioritySerialization
} from '../enumerations/ticket-priority';
import {
  TicketStatus,
  TicketStatusSerialization,
  ticketStatusText
} from '../enumerations/ticket-status';
import {
  TicketSubType,
  TicketSubTypeSerialization
} from '../enumerations/ticket-subtype';
import { TicketComment } from './ticket-comment';
import { TicketClosureInformation } from './ticket-closure-information';
import { TicketAttachment } from './ticket-attachment';

export class Ticket extends McsEntityBase {
  public number: string;
  public crispTicketNumber: string;
  public requestor: string;
  public company: string;
  public shortDescription: string;
  public description: string;
  public impact: string;
  public customerReference: string;
  public slaDue: string;
  public serviceId: string[];
  public assignedTo: string;
  public queue: string;
  public updatedBy: string;

  @JsonProperty({ type: TicketClosureInformation })
  public closureInformation: TicketClosureInformation;

  @JsonProperty({ type: TicketAttachment })
  public attachments: TicketAttachment[];

  @JsonProperty({ type: TicketComment })
  public comments: TicketComment[];

  @JsonProperty({ type: Ticket })
  public childTickets: Ticket[];

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date;

  @JsonProperty({
    type: TicketPriority,
    serializer: TicketPrioritySerialization,
    deserializer: TicketPrioritySerialization
  })
  public priority: TicketPriority;

  @JsonProperty({
    type: TicketStatus,
    serializer: TicketStatusSerialization,
    deserializer: TicketStatusSerialization
  })
  public state: TicketStatus;

  @JsonProperty({
    type: TicketSubType,
    serializer: TicketSubTypeSerialization,
    deserializer: TicketSubTypeSerialization
  })
  public subType: TicketSubType;

  constructor() {
    super();
    this.number = undefined;
    this.crispTicketNumber = undefined;
    this.requestor = undefined;
    this.company = undefined;
    this.shortDescription = undefined;
    this.description = undefined;
    this.impact = undefined;
    this.customerReference = undefined;
    this.slaDue = undefined;
    this.serviceId = undefined;
    this.assignedTo = undefined;
    this.queue = undefined;
    this.createdOn = undefined;
    this.updatedBy = undefined;
    this.updatedOn = undefined;
    this.closureInformation = undefined;
    this.attachments = undefined;
    this.comments = undefined;
    this.childTickets = undefined;
    this.priority = undefined;
    this.state = undefined;
    this.subType = undefined;
  }

  /**
   * Returns the state label equivalent
   */
  public get stateLabel(): string {
    return ticketStatusText[this.state];
  }

  /**
   * Returns true if the ticket is closed
   */
  public get isClosed(): boolean {
    return this.state === TicketStatus.Closed;
  }
}
