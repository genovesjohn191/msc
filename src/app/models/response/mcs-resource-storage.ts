import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';

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

  /**
   * Returns storage toggle label
   */
  public get toggleLabel(): string {
    return this.enabled ? 'Enabled' : 'Disabled';
  }
}
