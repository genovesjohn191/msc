import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AntiVirusStatus {
  Active = 0,
  Warning = 1,
  Inactive = 2,
  Error = 3
}

export const antiVirusStatusLabel = {
  [AntiVirusStatus.Active]: 'Continuously scanning for threats.',
  [AntiVirusStatus.Warning]: 'Failed.',
  [AntiVirusStatus.Inactive]: 'In Progress.',
  [AntiVirusStatus.Error]: 'Error.',
};

export class AntiVirusStatusSerialization
  extends McsEnumSerializationBase<AntiVirusStatus> {
  constructor() { super(AntiVirusStatus); }
}
