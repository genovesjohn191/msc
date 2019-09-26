import { JsonProperty } from '@peerlancers/json-serialization';
import { isNullOrEmpty } from '@app/utilities';
import {
  UnitType,
  unitTypeText
} from '../enumerations/unit-type.enum';

export class McsServerCompute {
  @JsonProperty()
  public cpuCount: number = undefined;

  @JsonProperty()
  public coreCount: number = undefined;

  @JsonProperty()
  public memoryMB: number = undefined;

  /**
   * Returns cpu count with its unit
   */
  public get cpuCountLabel(): string {
    return (!isNullOrEmpty(this.cpuCount) || !isNullOrEmpty(this.coreCount)) ?
      `${this.cpuCount * this.coreCount} ${unitTypeText[UnitType.CPU]}` :
      undefined;
  }

  /**
   * Returns cpu count with its unit
   */
  public get memoryMBLabel(): string {
    return (!isNullOrEmpty(this.memoryMB)) ?
      `${this.memoryMB} ${unitTypeText[UnitType.Megabyte]}` :
      undefined;
  }
}
