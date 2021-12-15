import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import { McsResourceCatalogItem } from './mcs-resource-catalog-item';

export class McsResourceCatalog extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({ target: McsResourceCatalogItem })
  public items: McsResourceCatalogItem[] = undefined;

  @JsonProperty()
  public supportsGuestCustomization: boolean = undefined;
}
