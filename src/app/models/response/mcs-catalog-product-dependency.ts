import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsCatalogProductDependency extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;
}
