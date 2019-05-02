import { JsonProperty } from 'json-object-mapper';
import { McsResourceCatalogItem } from './mcs-resource-catalog-item';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsResourceCatalog extends McsEntityBase {
  public name: string = undefined;

  @JsonProperty({ type: McsResourceCatalogItem })
  public items: McsResourceCatalogItem[] = undefined;
}
