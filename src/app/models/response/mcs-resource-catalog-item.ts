import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import {
  CatalogItemType,
  CatalogItemTypeSerialization
} from '../enumerations/catalog-item-type.enum';
import {
  ServiceType,
  ServiceTypeSerialization
} from '../enumerations/service-type.enum';

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

  public get isReady(): boolean  {
    // return this.catalogItem?.status === 'Ready';
    // TODO(apascual): FUSION-5546: The status should be implemented first in catalogItem
    return false;
  }
}
