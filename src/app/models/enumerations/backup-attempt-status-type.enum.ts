export enum BackupAttemptStatusType {
  Unknown = 0,
  Successful,
  Failed,
  InProgress,
  NeverAttempted
}

export const backupServerStatusTypeLabel = {
  [BackupAttemptStatusType.Successful]: 'Your last file backup was successful.',
  [BackupAttemptStatusType.Failed]: 'Your last file backup failed.',
  [BackupAttemptStatusType.InProgress]: 'A file backup is currently in progress.',
  [BackupAttemptStatusType.NeverAttempted]: 'A file backup has never been attempted.'
};

export const backupVmStatusTypeLabel = {
  [BackupAttemptStatusType.Successful]: 'Your last image backup was successful.',
  [BackupAttemptStatusType.Failed]: 'Your last image backup failed.',
  [BackupAttemptStatusType.InProgress]: 'An image backup is currently in progress.',
  [BackupAttemptStatusType.NeverAttempted]: 'An image backup has never been attempted.'
};

export const backupStatusTypeSubtitleLabel = {
  [BackupAttemptStatusType.Successful]: 'Last backed up on {{formattedDate}}, Sydney Time.',
  [BackupAttemptStatusType.Failed]: 'Last attempt failed on {{formattedDate}}, Sydney Time.',
  [BackupAttemptStatusType.InProgress]: 'Backup started on {{formattedDate}}, Sydney Time.',
  [BackupAttemptStatusType.NeverAttempted]: 'If this server is newly created, you may need to wait until the first scheduled backup occurs.'
};
