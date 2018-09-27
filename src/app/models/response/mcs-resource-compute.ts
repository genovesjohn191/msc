import { isNullOrEmpty } from '@app/utilities';
import {
  UnitType,
  unitTypeText
} from '../enumerations/unit-type.enum';

export class McsResourceCompute {
  public cpuAllocation: number;
  public cpuReservation: number;
  public cpuLimit: number;
  public cpuUsed: number;
  public cpuAvailable: number;
  public memoryAllocationMB: number;
  public memoryReservationMB: number;
  public memoryLimitMB: number;
  public memoryUsedMB: number;
  public memoryAvailableMB: number;

  constructor() {
    this.cpuAllocation = undefined;
    this.cpuReservation = undefined;
    this.cpuLimit = undefined;
    this.cpuUsed = undefined;
    this.cpuAvailable = undefined;
    this.memoryAllocationMB = undefined;
    this.memoryReservationMB = undefined;
    this.memoryLimitMB = undefined;
    this.memoryUsedMB = undefined;
    this.memoryAvailableMB = undefined;
  }

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
