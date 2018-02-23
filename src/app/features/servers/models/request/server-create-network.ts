import {
  ServerIpAllocationMode,
  ServerIpAllocationModeSerialization
} from '../enumerations/server-ip-allocation-mode.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerCreateNetwork {
  public name: string;

  @JsonProperty({
    type: ServerIpAllocationMode,
    serializer: ServerIpAllocationModeSerialization,
    deserializer: ServerIpAllocationModeSerialization
  })
  public ipAllocationMode: ServerIpAllocationMode;
  public ipAddress: string;

  constructor() {
    this.name = undefined;
    this.ipAllocationMode = undefined;
    this.ipAddress = undefined;
  }
}
