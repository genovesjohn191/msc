import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HidsStatus {
  Active = 'active',
  Warning = 'warning',
  Inactive = 'inactive',
  Error = 'error'
}

export class HidsStatusSerialization
  extends McsEnumSerializationBase<HidsStatus> {
  constructor() { super(HidsStatus); }
}
