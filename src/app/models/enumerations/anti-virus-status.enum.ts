import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

// TODO change to numbered enum in integration, better if we can handle this serialization, check enum serialization
export enum AntiVirusStatus {
  None = 'none',
  Active = 'active',
  Warning = 'warning',
  Inactive = 'inactive',
  Error = 'error'
}

export class AntiVirusStatusSerialization
  extends McsEnumSerializationBase<AntiVirusStatus> {
  constructor() { super(AntiVirusStatus); }
}
