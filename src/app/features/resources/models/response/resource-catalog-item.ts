import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../../../../core';
import {
  ResourceCatalogType,
  ResourceCatalogTypeSerialization
} from '../enumerations/resource-catalog-type.enum';
import {
  ResourceCatalogItemType,
  ResourceCatalogItemTypeSerialization
} from '../enumerations/resource-catalog-item-type.enum';

export class ResourceCatalogItem extends McsEntityBase {
  public name: string;
  public itemName: string;

  @JsonProperty({
    type: ResourceCatalogType,
    serializer: ResourceCatalogTypeSerialization,
    deserializer: ResourceCatalogTypeSerialization
  })
  public type: ResourceCatalogType;

  @JsonProperty({
    type: ResourceCatalogItemType,
    serializer: ResourceCatalogItemTypeSerialization,
    deserializer: ResourceCatalogItemTypeSerialization
  })
  public itemType: ResourceCatalogItemType;

  constructor() {
    super();
    this.name = undefined;
    this.type = undefined;
    this.itemType = undefined;
    this.itemName = undefined;
  }
}
