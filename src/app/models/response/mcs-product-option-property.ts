import { JsonProperty } from '@peerlancers/json-serialization';

export class McsProductOptionProperty {
  @JsonProperty()
  public label: string = undefined;

  @JsonProperty()
  public value: string = undefined;

  @JsonProperty()
  public unit: string = undefined;
}
