import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ManagementTag {
  NoChange = 0,
  Excluded,
  WindowsMonday,
  WindowsTuesday,
  WindowsWednesday,
  WindowsThursday,
  WindowsFriday,
  WindowsSaturday,
  WindowsSunday,
  LinuxMonday,
  LinuxTuesday,
  LinuxWednesday,
  LinuxThursday,
  LinuxFriday,
  LinuxSaturday,
  LinuxSunday
}

export const managementTagText = {
  [ManagementTag.NoChange]: 'No Change',
  [ManagementTag.Excluded]: 'Excluded',
  [ManagementTag.WindowsMonday]: 'Windows-Monday',
  [ManagementTag.WindowsTuesday]: 'Windows-Tuesday',
  [ManagementTag.WindowsWednesday]: 'Windows-Wednesday',
  [ManagementTag.WindowsThursday]: 'Windows-Thursday',
  [ManagementTag.WindowsFriday]: 'Windows-Friday',
  [ManagementTag.WindowsSaturday]: 'Windows-Saturday',
  [ManagementTag.WindowsSunday]: 'Windows-Sunday',
  [ManagementTag.LinuxMonday]: 'Linux-Monday',
  [ManagementTag.LinuxTuesday]: 'Linux-Tuesday',
  [ManagementTag.LinuxWednesday]: 'Linux-Wednesday',
  [ManagementTag.LinuxThursday]: 'Linux-Thursday',
  [ManagementTag.LinuxFriday]: 'Linux-Friday',
  [ManagementTag.LinuxSaturday]: 'Linux-Saturday',
  [ManagementTag.LinuxSunday]: 'Linux-Sunday'
}

export class CloudHealthManagementTagSerialization
  extends McsEnumSerializationBase<ManagementTag> {
  constructor() { super(ManagementTag); }
}