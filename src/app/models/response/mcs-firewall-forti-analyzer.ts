import { JsonProperty } from '@app/utilities';

export class McsFirewallFortiAnalyzer {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public ipAddress: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public mode: string = undefined;
}