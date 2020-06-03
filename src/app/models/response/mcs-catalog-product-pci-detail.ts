import { JsonProperty } from '@app/utilities';

export class McsCatalogProductPciDetail {
  @JsonProperty()
  public raci: string = undefined;

  @JsonProperty()
  public customerResponsibilityDefinition: string = undefined;

  @JsonProperty()
  public mcsResponsibilityDefinition: string = undefined;

  @JsonProperty()
  public control: string = undefined;

  @JsonProperty()
  public notApplicableJustification: string = undefined;

  @JsonProperty()
  public requirement: string = undefined;

  @JsonProperty()
  public version: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;
}
