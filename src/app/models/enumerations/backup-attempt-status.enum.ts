import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum BackupAttemptStatus {
  NotStarted = 0,
  Successful = 1,
  Failed = 2,
  InProgress = 3,
}

export const backupVmStatusLabel = {
  [BackupAttemptStatus.NotStarted]: 'A file backup has never been attempted for this server.',
  [BackupAttemptStatus.Successful]: 'Your last file backup was successful.',
  [BackupAttemptStatus.Failed]: 'Your last file backup failed.',
  [BackupAttemptStatus.InProgress]: 'A file backup is currently in progress for this server.'
};

export const backupServerStatusLabel = {
  [BackupAttemptStatus.NotStarted]: 'An image backup has never been attempted for this server.',
  [BackupAttemptStatus.Successful]: 'Your last image backup was successful.',
  [BackupAttemptStatus.Failed]: 'Your last image backup failed.',
  [BackupAttemptStatus.InProgress]: 'A image backup is currently in progress for this server.'
};

export const backupStatusSubtitleLabel = {
  [BackupAttemptStatus.NotStarted]: 'If this server is newly created, you may need to wait until the first scheduled backup occurs.',
  [BackupAttemptStatus.Successful]: 'Last backed up on {{startTime}}.',
  [BackupAttemptStatus.Failed]: 'Last attempt failed on {{startTime}}.',
  [BackupAttemptStatus.InProgress]: 'Backup started on {{startTime}}.'
};

export class BackupStatusSerialization
  extends McsEnumSerializationBase<BackupAttemptStatus> {
  constructor() { super(BackupAttemptStatus); }
}
