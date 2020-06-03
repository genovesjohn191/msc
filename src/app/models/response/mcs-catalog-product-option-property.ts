import { JsonProperty } from '@app/utilities';

export class McsCatalogProductOptionProperty {
  @JsonProperty()
  public label: string = undefined;

  @JsonProperty()
  public value: string = undefined;

  @JsonProperty()
  public unit: string = undefined;
}
