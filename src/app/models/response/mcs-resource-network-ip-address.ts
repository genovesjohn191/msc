import { JsonProperty } from '@app/utilities';
import {
  IpAllocationMode,
  IpAllocationModeSerialization
} from '../enumerations/ip-allocation-mode.enum';

export class McsResourceNetworkIpAddress {
  @JsonProperty()
  public ipAddress: string = undefined;

  @JsonProperty()
  public connectedStatus: boolean = undefined;

  @JsonProperty({
    serializer: IpAllocationModeSerialization,
    deserializer: IpAllocationModeSerialization
  })
  public ipAllocationMode: IpAllocationMode = undefined;
}
