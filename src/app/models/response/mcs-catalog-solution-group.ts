import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsCatalogSolution } from './mcs-catalog-solution';

export class McsCatalogSolutionGroup extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty({ target: McsCatalogSolution })
  public solutions: McsCatalogSolution[] = undefined;
}
