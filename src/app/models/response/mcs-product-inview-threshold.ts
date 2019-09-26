import { JsonProperty } from '@peerlancers/json-serialization';

export class McsProductInviewThreshold {
  @JsonProperty()
  public defaultAlertThreshold: string = undefined;

  @JsonProperty()
  public description: string = undefined;
}
