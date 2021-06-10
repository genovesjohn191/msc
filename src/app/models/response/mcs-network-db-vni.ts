import { JsonProperty } from '@app/utilities';
import {
  NetworkDbVniStatus,
  NetworkDbVniStatusSerialization
} from '../enumerations/network-db-vni-status.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsNetworkDbVni {
  @JsonProperty()
  public id: number = undefined;

  @JsonProperty({
    serializer: NetworkDbVniStatusSerialization,
    deserializer: NetworkDbVniStatusSerialization
  })
  public status: NetworkDbVniStatus = undefined;

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
