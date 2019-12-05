import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum BackupAttemptStatus {
  Successful = 0,
  Failed,
  InProgress,
  NeverAttempted,
}

export const backupVmStatusLabel = {
  [BackupAttemptStatus.Successful]: 'Your last file backup was successful.',
  [BackupAttemptStatus.Failed]: 'Your last file backup failed.',
  [BackupAttemptStatus.InProgress]: 'A file backup is currently in progress for this server.',
  [BackupAttemptStatus.NeverAttempted]: 'A file backup has never been attempted for this server.'
};

export const backupServerStatusLabel = {
  [BackupAttemptStatus.Successful]: 'Your last image backup was successful.',
  [BackupAttemptStatus.Failed]: 'Your last image backup failed.',
  [BackupAttemptStatus.InProgress]: 'A image backup is currently in progress for this server.',
  [BackupAttemptStatus.NeverAttempted]: 'An image backup has never been attempted for this server.'
};

export const backupStatusSubtitleLabel = {
  [BackupAttemptStatus.Successful]: 'Last backed up on {{formattedDate}}, Sydney Time.',
  [BackupAttemptStatus.Failed]: 'Last attempt failed on {{formattedDate}}, Sydney Time.',
  [BackupAttemptStatus.InProgress]: 'Backup started on {{formattedDate}}, Sydney Time.',
  [BackupAttemptStatus.NeverAttempted]: 'If this server is newly created, you may need to wait until the first scheduled backup occurs.'
};

export class BackupStatusSerialization
  extends McsEnumSerializationBase<BackupAttemptStatus> {
  constructor() { super(BackupAttemptStatus); }
}
