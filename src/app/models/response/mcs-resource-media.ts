import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '@app/core';
import { McsResourceMediaServer } from './mcs-resource-media-server';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsResourceMedia extends McsEntityBase {
  public name: string;
  public resourceId: string;
  public resourceName: string;
  public catalogName: string;
  public sizeMB: number;
  public status: string;      // TODO: This should be enumeration
  public description: string;
  public usageCount: number;

  @JsonProperty({ type: McsResourceMediaServer })
  public servers: McsResourceMediaServer[];

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
