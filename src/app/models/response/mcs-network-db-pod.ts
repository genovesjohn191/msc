import { JsonProperty } from '@app/utilities';
import { NetworkDbPodType, NetworkDbPodTypeSerialization } from '../enumerations/network-db-pod-type.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsNetworkDbPod {
  @JsonProperty()
  public id: number = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty({
    serializer: NetworkDbPodTypeSerialization,
    deserializer: NetworkDbPodTypeSerialization
  })
  public type: NetworkDbPodType = undefined;

  @JsonProperty()
  public code: string = undefined;

  @JsonProperty()
  public vxLanGroup: number = undefined;

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
