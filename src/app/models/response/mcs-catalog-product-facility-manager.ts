import { JsonProperty } from '@app/utilities';

export class McsCatalogProductFacilityManager {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public email: string = undefined;

  @JsonProperty()
  public phone: string = undefined;
}
