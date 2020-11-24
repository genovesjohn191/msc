export enum RuleAction {
  Add = 'Add',
  Modify = 'Modify',
  Remove = 'Remove'
}

export enum ActionType {
  Allow = 'Allow',
  Deny = 'Deny'
}

export enum ProtocolType {
  TCP = 'TCP',
  UDP = 'UDP',
  ICMP = 'ICMP',
  IP = 'IP',
  TCPUDP = 'TCP/UDP'
}

export class FirewallChangesSharedRule {
  action?: string;
  sourceZone?: string;
  sourceIpAddress?: string;
  destinationZone?: string;
  destinationIpAddress?: string;
  destinationPort?: string;
  protocol?: string;
  rulesToDelete?: string[]
  new?: string;
  existing?:string;
}
