import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerCreateAddOnHids {
  @JsonProperty()
  public protectionLevel: string = undefined;
}
