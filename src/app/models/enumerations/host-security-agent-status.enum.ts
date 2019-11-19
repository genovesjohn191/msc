import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HostSecurityAgentStatus {
  Active = 0,
  Warning = 1,
  Inactive = 2,
  Error = 3
}

export const hostSecurityAgentStatusLabel = {
  [HostSecurityAgentStatus.Active]: 'Agent Configured',
  [HostSecurityAgentStatus.Warning]: 'Failed.',
  [HostSecurityAgentStatus.Inactive]: 'In Progress.',
  [HostSecurityAgentStatus.Error]: 'Error.',
};

export class HostSecurityAgentStatusSerialization
  extends McsEnumSerializationBase<HostSecurityAgentStatus> {
  constructor() { super(HostSecurityAgentStatus); }
}
