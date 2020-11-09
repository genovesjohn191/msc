import { JsonProperty } from '@app/utilities';
import {
  IpAllocationMode,
  IpAllocationModeSerialization
} from '../enumerations/ip-allocation-mode.enum';

export class McsResourceNetworkSubnet {

  @JsonProperty()
  public netmask: string = undefined;

  @JsonProperty()
  public gateway: string = undefined;

}
