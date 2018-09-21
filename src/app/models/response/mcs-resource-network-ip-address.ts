import { JsonProperty } from 'json-object-mapper';
import {
  IpAllocationMode,
  IpAllocationModeSerialization
} from '../enumerations/ip-allocation-mode.enum';

export class McsResourceNetworkIpAddress {
  public ipAddress: string;
  public connectedStatus: boolean;

  @JsonProperty({
    type: IpAllocationMode,
    serializer: IpAllocationModeSerialization,
    deserializer: IpAllocationModeSerialization
  })
  public ipAllocationMode: IpAllocationMode;

  constructor() {
    this.ipAddress = undefined;
    this.ipAllocationMode = undefined;
    this.connectedStatus = undefined;
  }
}
