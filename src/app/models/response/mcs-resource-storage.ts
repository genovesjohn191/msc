import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  Severity,
  storageUsageSeverityText
} from '../enumerations/severity.enum';

export class McsResourceStorage extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public iops: number = undefined;

  @JsonProperty()
  public enabled: boolean = undefined;

  @JsonProperty()
  public limitMB: number = undefined;

  @JsonProperty()
  public usedMB: number = undefined;

  @JsonProperty()
  public availableMB: number = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty()
  public isStretched: boolean = undefined;

  @JsonProperty()
  public isDefault: boolean = undefined;

  /**
   * Returns storage toggle label
   */
  public get toggleLabel(): string {
    return this.enabled ? 'Enabled' : 'Disabled';
  }

  /**
   * Returns the used MB status of the storage
   */
  public get usedMbStatus(): Severity {
    let usedMbPercentage = (this.usedMB / this.limitMB) * 100;
    if (usedMbPercentage <= 75) { return Severity.Low; }
    return usedMbPercentage >= 85 ? Severity.High : Severity.Medium;
  }

  /**
   * Returns the different status text for used MB
   */
  public get usedMbStatusText(): string {
    return storageUsageSeverityText[this.usedMbStatus];
  }
}
