import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';
import { BackupStatusType } from './backup-status-type.enum';

export enum BackupStatus {
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

export const backupStatusLabel = {
  [BackupStatus.Unknown]: 'Unknown',
  [BackupStatus.Completed]: 'Completed',
  [BackupStatus.CompletedWithExceptions]: 'Completed w/Exception(s)',
  [BackupStatus.WaitingClient]: 'Waiting-Client',
  [BackupStatus.WaitingQueued]: 'Waiting-Queued',
  [BackupStatus.Running]: 'Running',
  [BackupStatus.RunningSnapshoc]: 'Running-SNAPSHOC',
  [BackupStatus.Failed]: 'Failed',
  [BackupStatus.Canceled]: 'Canceled',
  [BackupStatus.TimedOutResponse]: 'Timed Out - Response',
  [BackupStatus.TimedOutStart]: 'Timed Out - Start',
  [BackupStatus.TimedOutEnd]: 'Timed Out - End',
  [BackupStatus.NoProxy]: 'No Proxy',
  [BackupStatus.NoData]: 'No Data',
  [BackupStatus.NoDd]: 'No DD',
  [BackupStatus.NoVm]: 'No vm',
  [BackupStatus.NoEligibleProxies]: 'No Eligible Proxies',
  [BackupStatus.ClientNotRegistered]: 'Client Not Registered',
  [BackupStatus.ClientBackupDisabled]: 'Client Backup Disabled',
  [BackupStatus.DroppedSession]: 'Dropped Session',
  [BackupStatus.ConfigFilesOnly]: 'Config Files Only',
  [BackupStatus.UnsupportedBackup]: 'Unsupported Backup',
  [BackupStatus.VmDiskCapacity0]: 'Vm Disk Capacity 0',
  [BackupStatus.NeverAttempted]: 'Never Attempted'
};


export type BackupAttemptStatusRecord = Record<BackupStatus, BackupStatusType>;
export const backupStatusTypeMap: BackupAttemptStatusRecord = {
  [BackupStatus.Unknown]: BackupStatusType.Unknown,
  [BackupStatus.Completed]: BackupStatusType.Successful,
  [BackupStatus.CompletedWithExceptions]: BackupStatusType.Successful,
  [BackupStatus.WaitingClient]: BackupStatusType.InProgress,
  [BackupStatus.WaitingQueued]: BackupStatusType.InProgress,
  [BackupStatus.Running]: BackupStatusType.InProgress,
  [BackupStatus.RunningSnapshoc]: BackupStatusType.InProgress,
  [BackupStatus.Failed]: BackupStatusType.Failed,
  [BackupStatus.Canceled]: BackupStatusType.Failed,
  [BackupStatus.TimedOutResponse]: BackupStatusType.Failed,
  [BackupStatus.TimedOutStart]: BackupStatusType.Failed,
  [BackupStatus.TimedOutEnd]: BackupStatusType.Failed,
  [BackupStatus.NoProxy]: BackupStatusType.Failed,
  [BackupStatus.NoData]: BackupStatusType.Failed,
  [BackupStatus.NoDd]: BackupStatusType.Failed,
  [BackupStatus.NoVm]: BackupStatusType.Failed,
  [BackupStatus.NoEligibleProxies]: BackupStatusType.Failed,
  [BackupStatus.ClientNotRegistered]: BackupStatusType.Failed,
  [BackupStatus.ClientBackupDisabled]: BackupStatusType.Failed,
  [BackupStatus.DroppedSession]: BackupStatusType.Failed,
  [BackupStatus.ConfigFilesOnly]: BackupStatusType.Failed,
  [BackupStatus.UnsupportedBackup]: BackupStatusType.Failed,
  [BackupStatus.VmDiskCapacity0]: BackupStatusType.Failed,
  [BackupStatus.NeverAttempted]: BackupStatusType.NeverAttempted,
};

export class BackupStatusSerialization
  extends McsEnumSerializationBase<BackupStatus> {
  constructor() { super(BackupStatus); }
}
