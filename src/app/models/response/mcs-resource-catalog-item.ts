import { JsonProperty } from '@peerlancers/json-serialization';
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
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({
    serializer: CatalogItemTypeSerialization,
    deserializer: CatalogItemTypeSerialization
  })
  public type: CatalogItemType = undefined;

  @JsonProperty({
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType: ServiceType = undefined;
}
