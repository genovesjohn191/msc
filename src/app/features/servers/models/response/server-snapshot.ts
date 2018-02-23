import { McsDateSerialization } from '../../../../core';
import { JsonProperty } from 'json-object-mapper';

export class ServerSnapshot {
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
    this.sizeMB = undefined;
    this.createdOn = undefined;
    this.poweredOn = undefined;
    this.isProcessing = undefined;
  }
}
