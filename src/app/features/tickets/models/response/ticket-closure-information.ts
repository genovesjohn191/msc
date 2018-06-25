import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '../../../../core';

export class TicketClosureInformation {
  public closedBy: string;
  public closeNotes: string;
  public closeProblem: string;
  public closeResolution: string;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public closedAt: Date;

  constructor() {
    this.closedBy = undefined;
    this.closedAt = undefined;
    this.closeNotes = undefined;
    this.closeProblem = undefined;
    this.closeResolution = undefined;
  }
}
