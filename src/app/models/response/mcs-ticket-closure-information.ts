import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTicketClosureInformation {
  @JsonProperty()
  public closedBy: string = undefined;

  @JsonProperty()
  public closeNotes: string = undefined;

  @JsonProperty()
  public closeProblem: string = undefined;

  @JsonProperty()
  public closeResolution: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public closedAt: Date = undefined;
}
