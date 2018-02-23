import {
  ServerCatalogType,
  ServerCatalogTypeSerialization
} from '../enumerations/server-catalog-type.enum';
import {
  ServerCatalogItemType,
  ServerCatalogItemTypeSerialization
} from '../enumerations/server-catalog-item-type.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerCatalogItem {
  public id: any;
  public name: string;

  @JsonProperty({
    type: ServerCatalogType,
    serializer: ServerCatalogTypeSerialization,
    deserializer: ServerCatalogTypeSerialization
  })
  public type: ServerCatalogType;

  @JsonProperty({
    type: ServerCatalogItemType,
    serializer: ServerCatalogItemTypeSerialization,
    deserializer: ServerCatalogItemTypeSerialization
  })
  public itemType: ServerCatalogItemType;
  public itemName: string;

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.type = undefined;
    this.itemType = undefined;
    this.itemName = undefined;
  }
}
