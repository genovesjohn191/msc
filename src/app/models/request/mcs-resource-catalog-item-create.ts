import { JsonProperty } from 'json-object-mapper';
import {
  CatalogItemType,
  CatalogItemTypeSerialization
} from '../enumerations/catalog-item-type.enum';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export class McsResourceCatalogItemCreate extends McsApiJobRequestBase {
  @JsonProperty({
    type: CatalogItemType,
    serializer: CatalogItemTypeSerialization,
    deserializer: CatalogItemTypeSerialization
  })
  public type: CatalogItemType = undefined;

  public name: string = undefined;
  public url: string = undefined;
  public description: string = undefined;
}
