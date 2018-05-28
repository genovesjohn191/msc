import { JsonProperty } from 'json-object-mapper';
import {
  FirewallPolicyAction,
  FirewallPolicyActionSerialization
} from '../enumerations/firewall-policy-action.enum';
import {
  FirewallPolicyNat,
  FirewallPolicyNatSerialization
} from '../enumerations/firewall-policy-nat.enum';
import {
  CoreDefinition,
  McsEntityBase
} from '../../../../../core';

export class FirewallPolicy extends McsEntityBase {
  public policyId: number;
  public objectSequence: number;
  public natIpAddresses: string[];
  public sourceAddresses: string[];
  public sourceInterfaces: string[];
  public destinationAddresses: string[];
  public destinationInterfaces: string[];
  public label: string;
  public service: string[];
  public schedule: string[];

  @JsonProperty({
    type: FirewallPolicyAction,
    serializer: FirewallPolicyActionSerialization,
    deserializer: FirewallPolicyActionSerialization
  })
  public action: FirewallPolicyAction;

  @JsonProperty({
    type: FirewallPolicyNat,
    serializer: FirewallPolicyNatSerialization,
    deserializer: FirewallPolicyNatSerialization
  })
  public nat: FirewallPolicyNat;

  constructor() {
    super();
    this.policyId = undefined;
    this.objectSequence = undefined;
    this.natIpAddresses = undefined;
    this.sourceAddresses = undefined;
    this.sourceInterfaces = undefined;
    this.destinationAddresses = undefined;
    this.destinationInterfaces = undefined;
    this.label = undefined;
    this.service = undefined;
    this.schedule = undefined;
    this.action = undefined;
    this.nat = undefined;
  }

  /**
   * Returns firewall action icon key
   */
  public get actionIconKey(): string {
    if (this.action < 0) { return ''; }

    let iconKey = '';
    switch (this.action) {
      case FirewallPolicyAction.Disabled:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case FirewallPolicyAction.Enabled:
      default:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;
    }

    return iconKey;
  }
}
