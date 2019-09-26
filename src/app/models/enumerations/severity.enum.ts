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

/**
 * Enumeration serializer and deserializer methods
 */
export class SeveritySerialization
  extends McsEnumSerializationBase<Severity> {
  constructor() { super(Severity); }
}
