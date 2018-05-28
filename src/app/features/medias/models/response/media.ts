// TODO: Temporary model. Will update once API is ready
import {
  MediaType,
  MediaTypeSerialization
} from '../enumerations/media-type.enum';
import { JsonProperty } from 'json-object-mapper';

export class Media {
  public id: any;
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
    this.id = undefined;
    this.name = undefined;
    this.type = undefined;
    this.itemName = undefined;
    this.sizeMB = undefined;
    this.attachedTo = undefined;
    this.resourceName = undefined;
  }
}
