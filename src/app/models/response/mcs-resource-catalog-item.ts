import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  ServiceType,
  ServiceTypeSerialization
} from '../enumerations/service-type.enum';
import {
  CatalogItemType,
  CatalogItemTypeSerialization
} from '../enumerations/catalog-item-type.enum';

export class McsResourceCatalogItem extends McsEntityBase {
  public name: string;
  public itemName: string;

  @JsonProperty({
    type: ServiceType,
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public type: ServiceType;

  @JsonProperty({
    type: CatalogItemType,
    serializer: CatalogItemTypeSerialization,
    deserializer: CatalogItemTypeSerialization
  })
  public itemType: CatalogItemType;

  constructor() {
    super();
    this.name = undefined;
    this.type = undefined;
    this.itemType = undefined;
    this.itemName = undefined;
  }
}
