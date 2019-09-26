import { JsonProperty } from '@peerlancers/json-serialization';
import {
  CatalogItemType,
  CatalogItemTypeSerialization
} from '../enumerations/catalog-item-type.enum';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export class McsResourceCatalogItemCreate extends McsApiJobRequestBase<any> {
  @JsonProperty({
    serializer: CatalogItemTypeSerialization,
    deserializer: CatalogItemTypeSerialization
  })
  public type: CatalogItemType = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public url: string = undefined;

  @JsonProperty()
  public description: string = undefined;
}
