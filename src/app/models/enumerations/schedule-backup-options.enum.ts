import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ScheduleBackupOption {
  EigthPM = 20,
  NinePM = 21,
  TenPM = 22,
  ElevenPM = 23,
  TwelveAM = 0,
  OneAM = 1,
  TwoAM = 2,
  ThreeAM = 3,
  FourAM = 4,
  FiveAM = 5,
  SixAM = 6
}

export const scheduleBackupOptionText = {
  [ScheduleBackupOption.EigthPM]: '8 PM',
  [ScheduleBackupOption.NinePM]: '9 PM',
  [ScheduleBackupOption.TenPM]: '10 PM',
  [ScheduleBackupOption.ElevenPM]: '11 PM',
  [ScheduleBackupOption.TwelveAM]: '12 AM',
  [ScheduleBackupOption.OneAM]: '1 AM',
  [ScheduleBackupOption.TwoAM]: '2 AM',
  [ScheduleBackupOption.ThreeAM]: '3 AM',
  [ScheduleBackupOption.FourAM]: '4 AM',
  [ScheduleBackupOption.FiveAM]: '5 AM',
  [ScheduleBackupOption.SixAM]: '6 AM',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ProvisioningStatusSerialization
  extends McsEnumSerializationBase<ScheduleBackupOption> {
  constructor() { super(ScheduleBackupOption); }
}
