import { JsonProperty } from 'json-object-mapper';
import {
  CatalogItemType,
  CatalogItemTypeSerialization
} from '../enumerations/catalog-item-type.enum';
import { McsApiJobRequestBase } from '../mcs-api-job-request-base';

export class McsResourceCatalogItemCreate extends McsApiJobRequestBase {
  @JsonProperty({
    type: CatalogItemType,
    serializer: CatalogItemTypeSerialization,
    deserializer: CatalogItemTypeSerialization
  })
  public type: CatalogItemType;
  public name: string;
  public url: string;
  public storageProfileId: string;
  public description: string;

  constructor() {
    super();
    this.type = undefined;
    this.name = undefined;
    this.url = undefined;
    this.storageProfileId = undefined;
    this.description = undefined;
  }
}
