import { JsonProperty } from '@app/utilities';
import {
  IpAllocationMode,
  IpAllocationModeSerialization
} from '../enumerations/ip-allocation-mode.enum';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerCreateNicRefObj {
  serverId?: string;
  nicName?: string;
  nicIpAllocationMode?: IpAllocationMode;
  nicIpAddress?: string;
  nicId?: string;
}

export class McsServerCreateNic extends McsApiJobRequestBase<IMcsServerCreateNicRefObj> {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({
    serializer: IpAllocationModeSerialization,
    deserializer: IpAllocationModeSerialization
  })
  public ipAllocationMode: IpAllocationMode = undefined;

  @JsonProperty()
  public ipAddress: string = undefined;
}
