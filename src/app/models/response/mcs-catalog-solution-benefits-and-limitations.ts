import { JsonProperty } from '@app/utilities';

export class McsCatalogSolutionBenefitsAndLimitations {
  @JsonProperty()
  public benefit: string = undefined;

  @JsonProperty()
  public limitation: string = undefined;
}
