import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsCatalogSolutionProduct extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;
}
