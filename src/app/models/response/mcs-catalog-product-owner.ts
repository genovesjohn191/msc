import { JsonProperty } from '@app/utilities';

export class McsCatalogProductOwner {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public email: string = undefined;

  @JsonProperty()
  public phone: string = undefined;
}
