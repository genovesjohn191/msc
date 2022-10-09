import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum PeriodicSchedule {
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
  LinuxSunday,
  Weekly
}

export const periodicScheduleText = {
  [PeriodicSchedule.NoChange]: 'No Change',
  [PeriodicSchedule.Excluded]: 'Excluded',
  [PeriodicSchedule.WindowsMonday]: 'Windows-Monday',
  [PeriodicSchedule.WindowsTuesday]: 'Windows-Tuesday',
  [PeriodicSchedule.WindowsWednesday]: 'Windows-Wednesday',
  [PeriodicSchedule.WindowsThursday]: 'Windows-Thursday',
  [PeriodicSchedule.WindowsFriday]: 'Windows-Friday',
  [PeriodicSchedule.WindowsSaturday]: 'Windows-Saturday',
  [PeriodicSchedule.WindowsSunday]: 'Windows-Sunday',
  [PeriodicSchedule.LinuxMonday]: 'Linux-Monday',
  [PeriodicSchedule.LinuxTuesday]: 'Linux-Tuesday',
  [PeriodicSchedule.LinuxWednesday]: 'Linux-Wednesday',
  [PeriodicSchedule.LinuxThursday]: 'Linux-Thursday',
  [PeriodicSchedule.LinuxFriday]: 'Linux-Friday',
  [PeriodicSchedule.LinuxSaturday]: 'Linux-Saturday',
  [PeriodicSchedule.LinuxSunday]: 'Linux-Sunday',
  [PeriodicSchedule.Weekly]: 'Weekly'
}

export class PeriodicScheduleSerialization
  extends McsEnumSerializationBase<PeriodicSchedule> {
  constructor() { super(PeriodicSchedule); }
}