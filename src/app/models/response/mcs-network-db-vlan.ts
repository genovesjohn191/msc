import { JsonProperty } from '@app/utilities';
import {
  NetworkDbVlanStatus,
  NetworkDbVlanStatusSerialization
} from '../enumerations/network-db-vlan-status.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsNetworkDbVlan {
  @JsonProperty()
  public id: number = undefined;

  @JsonProperty()
  public number: number = undefined;

  @JsonProperty({
    serializer: NetworkDbVlanStatusSerialization,
    deserializer: NetworkDbVlanStatusSerialization
  })
  public status: NetworkDbVlanStatus = undefined;

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

  @JsonProperty()
  public podSiteId?: number = undefined;

  @JsonProperty()
  public podSiteName?: string = undefined;
}
