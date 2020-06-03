import { JsonProperty } from '@app/utilities';

export class McsCatalogProductInviewThreshold {
  @JsonProperty()
  public defaultAlertThreshold: string = undefined;

  @JsonProperty()
  public description: string = undefined;
}
