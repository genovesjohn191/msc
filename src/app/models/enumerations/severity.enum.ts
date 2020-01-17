import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum Severity {
  Low,
  Medium,
  High,
  Critical
}

export const severityText = {
  [Severity.Low]: 'Low',
  [Severity.Medium]: 'Medium',
  [Severity.High]: 'High',
  [Severity.Critical]: 'Critical'
};

export const storageUsageSeverityText = {
  [Severity.Low]: 'Ample storage space remaining',
  [Severity.Medium]: 'Moderate storage space remaining',
  [Severity.High]: 'Low storage space remaining',
  [Severity.Critical]: 'Critical storage space remaining'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class SeveritySerialization
  extends McsEnumSerializationBase<Severity> {
  constructor() { super(Severity); }
}
