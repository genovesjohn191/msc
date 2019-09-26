import { JsonProperty } from '@peerlancers/json-serialization';

export class McsPortalAccess {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public url: string = undefined;
}
