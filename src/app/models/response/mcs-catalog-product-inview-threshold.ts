import { JsonProperty } from '@peerlancers/json-serialization';

export class McsCatalogProductInviewThreshold {
  @JsonProperty()
  public defaultAlertThreshold: string = undefined;

  @JsonProperty()
  public description: string = undefined;
}