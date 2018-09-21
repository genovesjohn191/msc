import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '@app/core';
import { McsEntityBase } from '../mcs-entity.base';

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
