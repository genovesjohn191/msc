import {
  McsDateSerialization,
  McsEntityBase
} from '../../../../core';
import { JsonProperty } from 'json-object-mapper';

export class ServerSnapshot extends McsEntityBase {
  public sizeMB: number;
  public poweredOn: boolean;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  // Additional flag not related to API response
  public isProcessing: boolean;

  constructor() {
    super();
    this.sizeMB = undefined;
    this.createdOn = undefined;
    this.poweredOn = undefined;
    this.isProcessing = undefined;
  }
}
