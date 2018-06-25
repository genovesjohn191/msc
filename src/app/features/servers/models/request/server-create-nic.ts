import {
  ServerIpAllocationMode,
  ServerIpAllocationModeSerialization
} from '../enumerations/server-ip-allocation-mode.enum';
import { JsonProperty } from 'json-object-mapper';
import { McsApiJobRequestBase } from '../../../../core';

export class ServerCreateNic extends McsApiJobRequestBase {
  public name: string;

  @JsonProperty({
    type: ServerIpAllocationMode,
    serializer: ServerIpAllocationModeSerialization,
    deserializer: ServerIpAllocationModeSerialization
  })
  public ipAllocationMode: ServerIpAllocationMode;
  public ipAddress: string;

  constructor() {
    super();
    this.name = undefined;
    this.ipAllocationMode = undefined;
    this.ipAddress = undefined;
  }
}
