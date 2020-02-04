import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';
import { BackupAttemptStatusType } from './backup-attempt-status-type.enum';

export enum BackupAttemptStatus {
  Unknown = 0,
  // Successful
  Completed,
  CompletedWithExceptions,

  // In Progress
  WaitingClient,
  WaitingQueued,
  Running,
  RunningSnapshoc,

  // Failed
  Failed,
  Canceled,
  TimedOutResponse,
  TimedOutStart,
  TimedOutEnd,
  NoProxy,
  NoData,
  NoDd,
  NoVm,
  NoEligibleProxies,
  ClientNotRegistered,
  ClientBackupDisabled,
  DroppedSession,
  ConfigFilesOnly,
  UnsupportedBackup,
  VmDiskCapacity0,

  NeverAttempted
}

export const backupAttemptStatuLabel = {
  [BackupAttemptStatus.Unknown]: 'Unknown',
  [BackupAttemptStatus.Completed]: 'Completed',
  [BackupAttemptStatus.CompletedWithExceptions]: 'Completed w/Exception(s)',
  [BackupAttemptStatus.WaitingClient]: 'Waiting-Client',
  [BackupAttemptStatus.WaitingQueued]: 'Waiting-Queued',
  [BackupAttemptStatus.Running]: 'Running',
  [BackupAttemptStatus.RunningSnapshoc]: 'Running-SNAPSHOC',
  [BackupAttemptStatus.Failed]: 'Failed',
  [BackupAttemptStatus.Canceled]: 'Canceled',
  [BackupAttemptStatus.TimedOutResponse]: 'Timed Out - Response',
  [BackupAttemptStatus.TimedOutStart]: 'Timed Out - Start',
  [BackupAttemptStatus.TimedOutEnd]: 'Timed Out - End',
  [BackupAttemptStatus.NoProxy]: 'No Proxy',
  [BackupAttemptStatus.NoData]: 'No Data',
  [BackupAttemptStatus.NoDd]: 'No DD',
  [BackupAttemptStatus.NoVm]: 'No vm',
  [BackupAttemptStatus.NoEligibleProxies]: 'No Eligible Proxies',
  [BackupAttemptStatus.ClientNotRegistered]: 'Client Not Registered',
  [BackupAttemptStatus.ClientBackupDisabled]: 'Client Backup Disabled',
  [BackupAttemptStatus.DroppedSession]: 'Dropped Session',
  [BackupAttemptStatus.ConfigFilesOnly]: 'Config Files Only',
  [BackupAttemptStatus.UnsupportedBackup]: 'Unsupported Backup',
  [BackupAttemptStatus.VmDiskCapacity0]: 'Vm Disk Capacity 0',
  [BackupAttemptStatus.NeverAttempted]: 'Never Attempted'
};


export type BackupAttemptStatusRecord = Record<BackupAttemptStatus, BackupAttemptStatusType>;
export const backupAttemptStatusTypeMap: BackupAttemptStatusRecord = {
  [BackupAttemptStatus.Unknown]: BackupAttemptStatusType.Unknown,
  [BackupAttemptStatus.Completed]: BackupAttemptStatusType.Successful,
  [BackupAttemptStatus.CompletedWithExceptions]: BackupAttemptStatusType.Successful,
  [BackupAttemptStatus.WaitingClient]: BackupAttemptStatusType.InProgress,
  [BackupAttemptStatus.WaitingQueued]: BackupAttemptStatusType.InProgress,
  [BackupAttemptStatus.Running]: BackupAttemptStatusType.InProgress,
  [BackupAttemptStatus.RunningSnapshoc]: BackupAttemptStatusType.InProgress,
  [BackupAttemptStatus.Failed]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.Canceled]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.TimedOutResponse]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.TimedOutStart]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.TimedOutEnd]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.NoProxy]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.NoData]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.NoDd]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.NoVm]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.NoEligibleProxies]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.ClientNotRegistered]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.ClientBackupDisabled]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.DroppedSession]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.ConfigFilesOnly]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.UnsupportedBackup]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.VmDiskCapacity0]: BackupAttemptStatusType.Failed,
  [BackupAttemptStatus.NeverAttempted]: BackupAttemptStatusType.NeverAttempted,
};

export class BackupStatusSerialization
  extends McsEnumSerializationBase<BackupAttemptStatus> {
  constructor() { super(BackupAttemptStatus); }
}
