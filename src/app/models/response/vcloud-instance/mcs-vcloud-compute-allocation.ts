import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../../common/mcs-entity.base';

export class McsVcloudComputeAllocation {

  @JsonProperty()
  public cpuAllocation: number = undefined;

  @JsonProperty()
  public memoryAllocationMB: number = undefined;
}