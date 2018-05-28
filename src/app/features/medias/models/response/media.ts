import { JsonProperty } from 'json-object-mapper';
import {
  MediaType,
  MediaTypeSerialization
} from '../enumerations/media-type.enum';
import { McsEntityBase } from '../../../../core';

export class Media extends McsEntityBase {
  public name: string;
  public itemName: string;
  public sizeMB: number;
  public attachedTo: number;
  public resourceName: string;

  @JsonProperty({
    type: MediaType,
    serializer: MediaTypeSerialization,
    deserializer: MediaTypeSerialization
  })
  public type: MediaType;

  // Additional flag not related to API response
  public isProcessing: boolean;
  public processingText: string;

  constructor() {
    super();
    this.name = undefined;
    this.type = undefined;
    this.itemName = undefined;
    this.sizeMB = undefined;
    this.attachedTo = undefined;
    this.resourceName = undefined;
  }
}
