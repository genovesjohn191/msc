import {
  McsUnitType,
  mcsUnitTypeText
} from '../../../../core';
import { isNullOrEmpty } from '../../../../utilities';

export class ServerCompute {
  public cpuAllocation: number;
  public cpuReservation: number;
  public cpuLimit: number;
  public cpuUsed: number;
  public memoryAllocationMB: number;
  public memoryReservationMB: number;
  public memoryLimitMB: number;
  public memoryUsedMB: number;

  constructor() {
    this.cpuAllocation = undefined;
    this.cpuReservation = undefined;
    this.cpuLimit = undefined;
    this.cpuUsed = undefined;
    this.memoryAllocationMB = undefined;
    this.memoryReservationMB = undefined;
    this.memoryLimitMB = undefined;
    this.memoryUsedMB = undefined;
  }

  /**
   * Returns the memoryLimitMB with its unit
   */
  public get memoryLimitMBLabel(): string {
    return (!isNullOrEmpty(this.memoryLimitMB)) ?
      `${this.memoryLimitMB} ${mcsUnitTypeText[McsUnitType.Megabyte]}` :
      undefined;
  }

  /**
   * Returns the cpuLimitMB with its unit
   */
  public get cpuLimitMBLabel(): string {
    return (!isNullOrEmpty(this.cpuLimit)) ?
      `${this.cpuLimit} ${mcsUnitTypeText[McsUnitType.CPU]}` :
      undefined;
  }
}
