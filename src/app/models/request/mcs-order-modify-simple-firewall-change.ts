import { JsonProperty } from '@app/utilities';
import { McsOrderSimpleFirewallModifyRule } from './mcs-order-simple-firewall-modify-rule';
export class McsOrderModifySimpleFirewallChange {
  @JsonProperty()
  public rules: McsOrderSimpleFirewallModifyRule[] = undefined;

  @JsonProperty()
  public customerReferenceNumber: string = undefined;

  @JsonProperty()
  public phoneConfirmationRequired: boolean = undefined;

  @JsonProperty()
  public notes: string = undefined;
}
