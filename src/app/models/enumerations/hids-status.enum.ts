import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HidsStatus {
  None = 0,
  Active,
  Warning,
  Inactive,
  Error
}

export class HidsStatusSerialization
  extends McsEnumSerializationBase<HidsStatus> {
  constructor() { super(HidsStatus); }
}
