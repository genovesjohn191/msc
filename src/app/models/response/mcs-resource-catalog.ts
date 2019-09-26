import { JsonProperty } from '@peerlancers/json-serialization';
import { McsResourceCatalogItem } from './mcs-resource-catalog-item';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsResourceCatalog extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({ target: McsResourceCatalogItem })
  public items: McsResourceCatalogItem[] = undefined;
}
