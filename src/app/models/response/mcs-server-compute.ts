import {
  McsUnitType,
  mcsUnitTypeText
} from '../enumerations/mcs-unit-type.enum';
import { isNullOrEmpty } from '@app/utilities';

export class McsServerCompute {
  public cpuCount: number;
  public coreCount: number;
  public memoryMB: number;

  constructor() {
    this.cpuCount = undefined;
    this.coreCount = undefined;
    this.memoryMB = undefined;
  }

  /**
   * Returns cpu count with its unit
   */
  public get cpuCountLabel(): string {
    return (!isNullOrEmpty(this.cpuCount) || !isNullOrEmpty(this.coreCount)) ?
      `${this.cpuCount * this.coreCount} ${mcsUnitTypeText[McsUnitType.CPU]}` :
      undefined;
  }

  /**
   * Returns cpu count with its unit
   */
  public get memoryMBLabel(): string {
    return (!isNullOrEmpty(this.memoryMB)) ?
      `${this.memoryMB} ${mcsUnitTypeText[McsUnitType.Megabyte]}` :
      undefined;
  }
}
