import {
  ServerIpAllocationMode,
  ServerIpAllocationModeSerialization
} from '../enumerations/server-ip-allocation-mode.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerManageNic {
  public name: string;
  public isPrimary: boolean;

  @JsonProperty({
    type: ServerIpAllocationMode,
    serializer: ServerIpAllocationModeSerialization,
    deserializer: ServerIpAllocationModeSerialization
  })
  public ipAllocationMode: ServerIpAllocationMode;
  public ipAddress: string;
  public clientReferenceObject: any;
}
