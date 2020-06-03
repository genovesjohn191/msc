import { JsonProperty } from '@app/utilities';

export class McsPortalAccess {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public url: string = undefined;
}
