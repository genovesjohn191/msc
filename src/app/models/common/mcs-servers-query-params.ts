import { JsonProperty } from '@app/utilities';
import { HardwareType } from '../enumerations/hardware-type.enum';
import { McsQueryParam } from './mcs-query-param';

export class McsServersQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'storage_profile' })
  public storageProfile?: string = undefined;

  @JsonProperty({ name: 'expand' })
  public expand?: boolean = undefined;

  @JsonProperty({ name: 'serviceId' })
  public serviceId?: string = undefined;

  @JsonProperty({ name: 'hardwareType' })
  public hardwareType?: string = undefined;
}
