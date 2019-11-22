import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AntiVirusSeverity {
  Low = 0,
  Medium = 1,
  High = 2
}

export class AntiVirusSeveritySerialization
  extends McsEnumSerializationBase<AntiVirusSeverity> {
  constructor() { super(AntiVirusSeverity); }
}
