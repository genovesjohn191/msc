import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HostSecurityAgentStatus {
  Active = 'active',
  Warning = 'warning',
  Inactive = 'inactive',
  Error = 'error'
}

export const hostSecurityAgentStatusLabel = {
  [HostSecurityAgentStatus.Active]: 'Agent Configured',
  [HostSecurityAgentStatus.Warning]: 'Warning.',
  [HostSecurityAgentStatus.Inactive]: 'Inactive.',
  [HostSecurityAgentStatus.Error]: 'Error.',
};

export class HostSecurityAgentStatusSerialization
  extends McsEnumSerializationBase<HostSecurityAgentStatus> {
  constructor() { super(HostSecurityAgentStatus); }
}
