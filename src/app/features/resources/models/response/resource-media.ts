import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../../../../core';
import {
  ResourceServiceType,
  ResourceServiceTypeSerialization
} from '../enumerations/resource-service-type.enum';

export class ResourceMedia extends McsEntityBase {
  public name: string;
  public itemName: string;
  public sizeMB: number;
  public attachedTo: number;
  public resourceName: string;

  @JsonProperty({
    type: ResourceServiceType,
    serializer: ResourceServiceTypeSerialization,
    deserializer: ResourceServiceTypeSerialization
  })
  public type: ResourceServiceType;

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
