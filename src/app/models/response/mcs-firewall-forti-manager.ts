import { JsonProperty } from '@app/utilities';

export class McsFirewallFortiManager {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public ipAddress: string = undefined;

  @JsonProperty()
  public description: string = undefined;
}