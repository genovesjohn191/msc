import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerCreateAddOnInview {
  @JsonProperty()
  public inviewLevel: string = undefined;
}
