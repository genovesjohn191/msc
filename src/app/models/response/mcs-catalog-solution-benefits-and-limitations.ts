import { JsonProperty } from '@peerlancers/json-serialization';

export class McsCatalogSolutionBenefitsAndLimitations {
  @JsonProperty()
  public benefit: string = undefined;

  @JsonProperty()
  public limitation: string = undefined;
}
