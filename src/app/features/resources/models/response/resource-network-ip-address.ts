import { JsonProperty } from 'json-object-mapper';
import {
  ResourceIpAllocationMode,
  ResourceIpAllocationModeSerialization
} from '../enumerations/resource-ip-allocation-mode.enum';

export class ResourceNetworkIpAddress {
  public ipAddress: string;
  public connectedStatus: boolean;

  @JsonProperty({
    type: ResourceIpAllocationMode,
    serializer: ResourceIpAllocationModeSerialization,
    deserializer: ResourceIpAllocationModeSerialization
  })
  public ipAllocationMode: ResourceIpAllocationMode;

  constructor() {
    this.ipAddress = undefined;
    this.ipAllocationMode = undefined;
    this.connectedStatus = undefined;
  }
}
