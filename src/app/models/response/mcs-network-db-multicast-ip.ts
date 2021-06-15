import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsNetworkDbMulticastIp {
  @JsonProperty()
  public id: number = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public siteId: number = undefined;

  @JsonProperty()
  public siteName: string = undefined;

  @JsonProperty()
  public useCaseId: number = undefined;

  @JsonProperty()
  public useCaseName: string = undefined;

  @JsonProperty()
  public ipAddress: string = undefined;

  @JsonProperty()
  public createdBy: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty()
  public updatedBy: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date = undefined;
}
