import { JsonProperty } from '@app/utilities';

import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import {
  CatalogItemType,
  CatalogItemTypeSerialization
} from '../enumerations/catalog-item-type.enum';

export interface IMcsResourceCatalogItemCreateRefObj {
  hideDetailsButton: boolean;
  ticketServiceId: string;
}

export class McsResourceCatalogItemCreate extends McsApiJobRequestBase<IMcsResourceCatalogItemCreateRefObj> {
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
