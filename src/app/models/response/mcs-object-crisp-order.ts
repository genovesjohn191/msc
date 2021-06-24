import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsObjectCrispOrder {
  @JsonProperty()
  public orderId: number = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public companyName: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty()
  public assignedTo: string = undefined;

  @JsonProperty()
  public hostingEngineer: string = undefined;
}
