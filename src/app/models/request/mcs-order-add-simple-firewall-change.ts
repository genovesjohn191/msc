import { JsonProperty } from '@app/utilities';
import { McsOrderSimpleFirewallAddRule } from './mcs-order-simple-firewall-add-rule';

export class McsOrderAddSimpleFirewallChange {
  @JsonProperty()
  public rules: McsOrderSimpleFirewallAddRule[] = undefined;

  @JsonProperty()
  public customerReferenceNumber: string = undefined;

  @JsonProperty()
  public phoneConfirmationRequired: boolean = undefined;

  @JsonProperty()
  public notes: string = undefined;
}
