import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';
import { McsResourceMediaServer } from './mcs-resource-media-server';

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
  public status: string = undefined;

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

  public get statusLabel(): string {
    return this.status;
  }

  public get isReady(): boolean {
    return this.status === 'Ready';
  }
}
