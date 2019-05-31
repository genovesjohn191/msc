import { JsonProperty } from 'json-object-mapper';
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
    type: PolicyAction,
    serializer: PolicyActionSerialization,
    deserializer: PolicyActionSerialization
  })
  public action: PolicyAction;

  @JsonProperty({
    type: PolicyNat,
    serializer: PolicyNatSerialization,
    deserializer: PolicyNatSerialization
  })
  public nat: PolicyNat;

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
