import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '@app/core';
import { McsEntityBase } from '../mcs-entity.base';

export class McsServerMedia extends McsEntityBase {
  public name: string;
  public resourceId: string;
  public resourceName: string;
  public catalogName: string;
  public sizeMB: number;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  constructor() {
    super();
    this.name = undefined;
    this.resourceId = undefined;
    this.resourceName = undefined;
    this.catalogName = undefined;
    this.sizeMB = undefined;
    this.createdOn = undefined;
  }
}
