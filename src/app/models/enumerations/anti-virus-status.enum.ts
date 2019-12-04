import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AntiVirusStatus {
  None = 0,
  Active,
  Warning,
  Inactive,
  Error
}

export class AntiVirusStatusSerialization
  extends McsEnumSerializationBase<AntiVirusStatus> {
  constructor() { super(AntiVirusStatus); }
}
