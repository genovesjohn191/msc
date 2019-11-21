import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

// TODO change to numbered enum in integration, better if we can handle this serialization, check enum serialization
export enum HidsStatus {
  None = 'none',
  Active = 'active',
  Warning = 'warning',
  Inactive = 'inactive',
  Error = 'error'
}

export class HidsStatusSerialization
  extends McsEnumSerializationBase<HidsStatus> {
  constructor() { super(HidsStatus); }
}
