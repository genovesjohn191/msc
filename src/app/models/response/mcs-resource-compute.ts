import { JsonProperty } from '@app/utilities';
import { isNullOrEmpty } from '@app/utilities';
import {
  UnitType,
  unitTypeText
} from '../enumerations/unit-type.enum';

export class McsResourceCompute {
  @JsonProperty()
  public cpuAllocation: number = undefined;

  @JsonProperty()
  public cpuLimit: number = undefined;

  @JsonProperty()
  public cpuUsed: number = undefined;

  @JsonProperty()
  public cpuAvailable: number = undefined;

  @JsonProperty()
  public memoryAllocationMB: number = undefined;

  @JsonProperty()
  public memoryLimitMB: number = undefined;

  @JsonProperty()
  public memoryUsedMB: number = undefined;

  @JsonProperty()
  public memoryAvailableMB: number = undefined;

  @JsonProperty()
  public cpuAllocationGhz: number = undefined;

  @JsonProperty()
  public cpuAvailableGhz: number = undefined;

  @JsonProperty()
  public cpuLimitGhz: number = undefined;

  @JsonProperty()
  public cpuReservationGhz: number = undefined;

  @JsonProperty()
  public cpuUsedGhz: number = undefined;

  /**
   * Returns the memoryLimitMB with its unit
   */
  public get memoryLimitMBLabel(): string {
    return (!isNullOrEmpty(this.memoryLimitMB)) ?
      `${this.memoryLimitMB} ${unitTypeText[UnitType.Megabyte]}` :
      undefined;
  }

  /**
   * Returns the cpuLimitMB with its unit
   */
  public get cpuLimitMBLabel(): string {
    return (!isNullOrEmpty(this.cpuLimit)) ?
      `${this.cpuLimit} ${unitTypeText[UnitType.CPU]}` :
      undefined;
  }
}
