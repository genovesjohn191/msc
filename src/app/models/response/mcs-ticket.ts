import { JsonProperty } from '@app/utilities';
import { isNullOrEmpty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
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
  TicketType,
  TicketTypeSerialization,
  ticketTypeText
} from '../enumerations/ticket-type';
import { McsTicketComment } from './mcs-ticket-comment';
import { McsTicketClosureInformation } from './mcs-ticket-closure-information';
import { McsTicketAttachment } from './mcs-ticket-attachment';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTicket extends McsEntityBase {
  @JsonProperty()
  public incidentId: string = undefined;

  @JsonProperty()
  public ticketNumber: string = undefined;

  @JsonProperty()
  public requestor: string = undefined;

  @JsonProperty()
  public company: string = undefined;

  @JsonProperty()
  public shortDescription: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public impact: string = undefined;

  @JsonProperty()
  public customerReference: string = undefined;

  @JsonProperty()
  public slaDue: string = undefined;

  @JsonProperty()
  public serviceId: string[] = undefined;

  @JsonProperty()
  public assignedTo: string = undefined;

  @JsonProperty()
  public queue: string = undefined;

  @JsonProperty()
  public updatedBy: string = undefined;

  @JsonProperty()
  public azureResources: string[] = undefined;

  @JsonProperty()
  public azureSlg: string = undefined;

  @JsonProperty()
  public createdByCompanyId: string = undefined;

  @JsonProperty()
  public updatedByCompanyId: string = undefined;

  @JsonProperty({ target: McsTicketClosureInformation })
  public closureInformation: McsTicketClosureInformation = undefined;

  @JsonProperty({ target: McsTicketAttachment })
  public attachments: McsTicketAttachment[] = undefined;

  @JsonProperty({ target: McsTicketComment })
  public comments: McsTicketComment[] = undefined;

  @JsonProperty({ target: McsTicket })
  public childTickets: McsTicket[] = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date = undefined;

  @JsonProperty({
    serializer: TicketPrioritySerialization,
    deserializer: TicketPrioritySerialization
  })
  public priority: TicketPriority = undefined;

  @JsonProperty({
    serializer: TicketStatusSerialization,
    deserializer: TicketStatusSerialization
  })
  public state: TicketStatus = undefined;

  @JsonProperty({
    serializer: TicketTypeSerialization,
    deserializer: TicketTypeSerialization
  })
  public type: TicketType = undefined;

  constructor() {
    super();
    this.incidentId = undefined;
    this.ticketNumber = undefined;
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
    this.type = undefined;
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
  public get closed(): boolean {
    return this.state === TicketStatus.Closed;
  }

  /**
   * Returns true when the ticket is resolved
   */
  public get resolved(): boolean {
    return this.state === TicketStatus.Resolved;
  }

  /**
   * Returns the ticket type label
   */
  public get typeLabel(): string {
    return ticketTypeText[this.type];
  }

  /**
   * Returns the ticket activities
   */
  public get activities(): any[] {
    let comments = isNullOrEmpty(this.comments) ? [] : this.comments;
    let attachments = isNullOrEmpty(this.attachments) ? [] : this.attachments;
    return [...comments, ...attachments];
  }
}
