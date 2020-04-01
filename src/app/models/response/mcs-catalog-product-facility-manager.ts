import { JsonProperty } from '@peerlancers/json-serialization';

export class McsCatalogProductFacilityManager {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public email: string = undefined;

  @JsonProperty()
  public phone: string = undefined;
}
