import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AntiVirusStatus {
  Active = 'active',
  Warning = 'warning',
  Inactive = 'inactive',
  Error = 'error'
}

export class AntiVirusStatusSerialization
  extends McsEnumSerializationBase<AntiVirusStatus> {
  constructor() { super(AntiVirusStatus); }
}
