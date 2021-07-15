import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';
import { McsNetworkDbVlan } from './mcs-network-db-vlan';

export class McsNetworkDbNetwork extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public companyName: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public vniId: number = undefined;

  @JsonProperty()
  public useCaseId: number = undefined;

  @JsonProperty()
  public useCaseName: string = undefined;

  @JsonProperty()
  public multicastIpAddress: string = undefined;

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
  public multicastIpAddressId: string = undefined;

  @JsonProperty({ target: McsNetworkDbVlan })
  public vlans: McsNetworkDbVlan[] = undefined;

}