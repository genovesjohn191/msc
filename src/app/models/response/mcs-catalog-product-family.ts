import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsCatalogProductGroup } from './mcs-catalog-product-group';

export class McsCatalogProductFamily extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty({ target: McsCatalogProductGroup })
  public groups: McsCatalogProductGroup[] = undefined;
}
