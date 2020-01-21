import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HostSecuritySeverity {
  Unknown = 0,
  Low,
  Medium,
  High,
  Critical
}

export const hostSecuritySeverityText = {
  [HostSecuritySeverity.Unknown]: 'Unknown',
  [HostSecuritySeverity.Low]: 'Low',
  [HostSecuritySeverity.Medium]: 'Medium',
  [HostSecuritySeverity.High]: 'High',
  [HostSecuritySeverity.Critical]: 'Critical',
};

export class HostSecuritySeveritySerialization
  extends McsEnumSerializationBase<HostSecuritySeverity> {
  constructor() { super(HostSecuritySeverity); }
}
