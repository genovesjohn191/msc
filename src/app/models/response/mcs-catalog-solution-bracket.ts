import { JsonProperty } from '@app/utilities';
import { McsCatalogSolutionGroup } from './mcs-catalog-solution-group';

export class McsCatalogSolutionBracket {
  @JsonProperty({ target: McsCatalogSolutionGroup })
  public groups: McsCatalogSolutionGroup[] = undefined;
}
