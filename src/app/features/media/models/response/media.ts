import { JsonProperty } from 'json-object-mapper';
import {
  McsEntityBase,
  McsDateSerialization
} from '../../../../core';
import { MediaServer } from './media-server';

export class Media extends McsEntityBase {
  public name: string;
  public resourceId: string;
  public resourceName: string;
  public catalogName: string;
  public sizeMB: number;
  public status: string;      // TODO: This should be enumeration
  public description: string;
  public usageCount: number;

  @JsonProperty({ type: MediaServer })
  public servers: MediaServer[];

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  public isProcessing: boolean;
  public processingText: string;

  constructor() {
    super();
    this.name = undefined;
    this.resourceId = undefined;
    this.resourceName = undefined;
    this.catalogName = undefined;
    this.sizeMB = undefined;
    this.status = undefined;
    this.description = undefined;
    this.usageCount = undefined;
    this.servers = undefined;
    this.createdOn = undefined;
  }

  /**
   * Returns the enumeration equivalent of the status
   */
  public get statusLabel(): string {
    return this.status;
  }
}
