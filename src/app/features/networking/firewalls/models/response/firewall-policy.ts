import { FirewallPolicyAction } from '../enumerations/firewall-policy-action.enum';
import { FirewallPolicyNat } from '../enumerations/firewall-policy-nat.enum';

export class FirewallPolicy {
  public id: any;
  public policyId: number;
  public objectSequence: number;
  public action: FirewallPolicyAction;
  public nat: FirewallPolicyNat;
  public natIpAddresses: string[];
  public sourceAddresses: string[];
  public sourceInterface: string[];
  public destinationAddresses: string[];
  public destinationInterfaces: string[];
  public service: string[];
  public schedule: string[];
}
