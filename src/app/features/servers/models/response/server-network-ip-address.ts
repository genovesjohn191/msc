import { JsonProperty } from 'json-object-mapper';
import {
  ServerIpAllocationMode,
  ServerIpAllocationModeSerialization
} from '../enumerations/server-ip-allocation-mode.enum';

export class ServerNetworkIpAddress {
  public ipAddress: string;
  public connectedStatus: boolean;

  @JsonProperty({
    type: ServerIpAllocationMode,
    serializer: ServerIpAllocationModeSerialization,
    deserializer: ServerIpAllocationModeSerialization
  })
  public ipAllocationMode: ServerIpAllocationMode;

  constructor() {
    this.ipAddress = undefined;
    this.ipAllocationMode = undefined;
    this.connectedStatus = undefined;
  }
}
