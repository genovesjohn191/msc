import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsServerSnapshot extends McsEntityBase {
  public sizeMB: number;
  public poweredOn: boolean;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  constructor() {
    super();
    this.sizeMB = undefined;
    this.createdOn = undefined;
    this.poweredOn = undefined;
  }
}
