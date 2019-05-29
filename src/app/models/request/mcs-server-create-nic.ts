import {
  IpAllocationMode,
  IpAllocationModeSerialization
} from '../enumerations/ip-allocation-mode.enum';
import { JsonProperty } from 'json-object-mapper';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerCreateNicRefObj {
  serverId?: string;
  nicName?: string;
  nicIpAllocationMode?: IpAllocationMode;
  nicIpAddress?: string;
}

export class McsServerCreateNic extends McsApiJobRequestBase<IMcsServerCreateNicRefObj> {
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
