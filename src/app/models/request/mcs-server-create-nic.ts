import {
  IpAllocationMode,
  IpAllocationModeSerialization
} from '../enumerations/ip-allocation-mode.enum';
import { JsonProperty } from 'json-object-mapper';
import { McsApiJobRequestBase } from '../mcs-api-job-request-base';

export class McsServerCreateNic extends McsApiJobRequestBase {
  public name: string;

  @JsonProperty({
    type: IpAllocationMode,
    serializer: IpAllocationModeSerialization,
    deserializer: IpAllocationModeSerialization
  })
  public ipAllocationMode: IpAllocationMode;
  public ipAddress: string;

  constructor() {
    super();
    this.name = undefined;
    this.ipAllocationMode = undefined;
    this.ipAddress = undefined;
  }
}
