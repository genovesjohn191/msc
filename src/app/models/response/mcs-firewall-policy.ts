import { JsonProperty } from '@peerlancers/json-serialization';
import { CommonDefinition } from '@app/utilities';
import {
  policyText,
  PolicyAction,
  PolicyActionSerialization
} from '../enumerations/policy-action.enum';
import {
  PolicyNat,
  PolicyNatSerialization
} from '../enumerations/policy-nat.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsFirewallPolicy extends McsEntityBase {
  @JsonProperty()
  public policyId: number = undefined;

  @JsonProperty()
  public objectSequence: number = undefined;

  @JsonProperty()
  public natIpAddresses: string[] = undefined;

  @JsonProperty()
  public sourceAddresses: string[] = undefined;

  @JsonProperty()
  public sourceInterfaces: string[] = undefined;

  @JsonProperty()
  public destinationAddresses: string[] = undefined;

  @JsonProperty()
  public destinationInterfaces: string[] = undefined;

  @JsonProperty()
  public label: string = undefined;

  @JsonProperty()
  public service: string[] = undefined;

  @JsonProperty()
  public schedule: string[] = undefined;

  @JsonProperty({
    serializer: PolicyActionSerialization,
    deserializer: PolicyActionSerialization
  })
  public action: PolicyAction = undefined;

  @JsonProperty({
    serializer: PolicyNatSerialization,
    deserializer: PolicyNatSerialization
  })
  public nat: PolicyNat = undefined;

  /**
   * Returns firewall action icon key
   */
  public get actionIconKey(): string {
    if (this.action < 0) { return ''; }

    let iconKey = '';
    switch (this.action) {
      case PolicyAction.Disabled:
        iconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case PolicyAction.Enabled:
      default:
        iconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;
    }
    return iconKey;
  }

  /**
   * Returns the action label
   */
  public get actionLabel(): string {
    return policyText[this.action];
  }
}
