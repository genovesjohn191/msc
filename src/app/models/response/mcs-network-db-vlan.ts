import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsNetworkDbVlan {
  @JsonProperty()
  public id: number = undefined;

  @JsonProperty()
  public number: number = undefined;

  // TODO: convert to enum
  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public isInfrastructure: boolean = undefined;

  @JsonProperty()
  public podId: number = undefined;

  @JsonProperty()
  public podName: string = undefined;

  @JsonProperty()
  public networkId: number = undefined;

  @JsonProperty()
  public networkName: string = undefined;

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
