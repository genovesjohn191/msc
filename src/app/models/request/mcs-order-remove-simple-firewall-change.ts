import { JsonProperty } from '@app/utilities';

export class McsOrderRemoveSimpleFirewallChange {
  @JsonProperty()
  public rules: string[] = undefined;

  @JsonProperty()
  public customerReferenceNumber: string = undefined;

  @JsonProperty()
  public phoneConfirmationRequired: boolean = undefined;

  @JsonProperty()
  public notes: string = undefined;
}
