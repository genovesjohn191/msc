import { JsonProperty } from '@peerlancers/json-serialization';
import { McsCatalogProductBracket } from './mcs-catalog-product-bracket';
import { McsCatalogSolutionBracket } from './mcs-catalog-solution-bracket';

export class McsCatalog {
  @JsonProperty({ target: McsCatalogProductBracket })
  public productCatalog: McsCatalogProductBracket = undefined;

  @JsonProperty({ target: McsCatalogSolutionBracket })
  public solutionCatalog: McsCatalogSolutionBracket = undefined;
}
