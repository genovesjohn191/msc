import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum HidsStatus {
  Active = 0,
  Warning = 1,
  Inactive = 2,
  Error = 3
}

export const hidsStatusLabel = {
  [HidsStatus.Active]: 'Your server will log intrusion attempts.',
  [HidsStatus.Warning]: 'Failed.',
  [HidsStatus.Inactive]: 'In Progress.',
  [HidsStatus.Error]: 'Error.',
};

export class HidsStatusSerialization
  extends McsEnumSerializationBase<HidsStatus> {
  constructor() { super(HidsStatus); }
}
