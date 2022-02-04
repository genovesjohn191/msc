import { JsonProperty } from '@app/utilities';

export class McsFirewallFortiAnalyzer {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public ipAddress: string = undefined;
}