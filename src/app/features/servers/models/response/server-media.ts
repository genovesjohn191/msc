import { JsonProperty } from 'json-object-mapper';
import {
  McsEntityBase,
  McsDateSerialization
} from '../../../../core';

export class ServerMedia extends McsEntityBase {
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

  // Additional flag not related to API response
  public isProcessing: boolean;
  public processingText: string;

  constructor() {
    super();
    this.name = undefined;
    this.resourceId = undefined;
    this.resourceName = undefined;
    this.catalogName = undefined;
    this.sizeMB = undefined;
    this.createdOn = undefined;
    this.isProcessing = undefined;
    this.processingText = undefined;
  }
}
