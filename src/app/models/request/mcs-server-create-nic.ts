import { JsonProperty } from '@app/utilities';

import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import {
  IpAllocationMode,
  IpAllocationModeSerialization
} from '../enumerations/ip-allocation-mode.enum';

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
  public ipAddress?: string = undefined;

  @JsonProperty()
  public ipAddresses?: string[] = undefined;

  @JsonProperty()
  public vlanNumberRanges?: string[] = undefined;

  @JsonProperty()
  public connected: boolean = undefined;
}
