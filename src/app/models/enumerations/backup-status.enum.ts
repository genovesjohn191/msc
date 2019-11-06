import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum BackupStatus {
  Successful = 1,
  Failed = 2,
  InProgress = 3,
  NotStarted = 4
}

export const backupVmStatusLabel = {
  [BackupStatus.Successful]: 'Your last file backup was successful.',
  [BackupStatus.Failed]: 'Your last file backup failed.',
  [BackupStatus.InProgress]: 'A file backup is currently in progress for this server.',
  [BackupStatus.NotStarted]: 'A file backup has never been attempted for this server.'
};

export const backupServerStatusLabel = {
  [BackupStatus.Successful]: 'Your last image backup was successful.',
  [BackupStatus.Failed]: 'Your last image backup failed.',
  [BackupStatus.InProgress]: 'A image backup is currently in progress for this server.',
  [BackupStatus.NotStarted]: 'An image backup has never been attempted for this server.'
};

export const backupStatusSubtitleLabel = {
  [BackupStatus.Successful]: 'Last backed up on {{lastBackupAttempt}}  at {{startTime}}.',
  [BackupStatus.Failed]: 'Last attempt failed on {{lastBackupAttempt}} at {{startTime}}.',
  [BackupStatus.InProgress]: 'Backup started on {{lastBackupAttempt}} at {{startTime}}.',
  [BackupStatus.NotStarted]: 'If this server is newly created, you may need to wait until the first scheduled backup occurs.'
};

export class BackupStatusSerialization
  extends McsEnumSerializationBase<BackupStatus> {
  constructor() { super(BackupStatus); }
}
