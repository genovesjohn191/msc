import { JsonProperty } from '@peerlancers/json-serialization';
import { McsResourceMediaServer } from './mcs-resource-media-server';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsResourceMedia extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public resourceId: string = undefined;

  @JsonProperty()
  public resourceName: string = undefined;

  @JsonProperty()
  public catalogName: string = undefined;

  @JsonProperty()
  public sizeMB: number = undefined;

  @JsonProperty()
  public status: string = undefined;      // TODO: This should be enumeration

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public usageCount: number = undefined;

  @JsonProperty({ target: McsResourceMediaServer })
  public servers: McsResourceMediaServer[] = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  /**
   * Returns the enumeration equivalent of the status
   */
  public get statusLabel(): string {
    return this.status;
  }
}
