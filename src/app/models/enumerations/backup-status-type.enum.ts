export enum BackupStatusType {
  Unknown = 0,
  Successful,
  Failed,
  InProgress,
  NeverAttempted
}

export const backupStatusTypeText = {
  [BackupStatusType.Successful]: 'Success',
  [BackupStatusType.Failed]: 'Failed',
  [BackupStatusType.InProgress]: 'In Progress',
  [BackupStatusType.NeverAttempted]: 'Never Attempted'
};

export const backupServerStatusTypeLabel = {
  [BackupStatusType.Successful]: 'Your last file backup was successful.',
  [BackupStatusType.Failed]: 'Your last file backup failed.',
  [BackupStatusType.InProgress]: 'A file backup is currently in progress.',
  [BackupStatusType.NeverAttempted]: 'A file backup has never been attempted.'
};

export const backupVmStatusTypeLabel = {
  [BackupStatusType.Successful]: 'Your last image backup was successful.',
  [BackupStatusType.Failed]: 'Your last image backup failed.',
  [BackupStatusType.InProgress]: 'An image backup is currently in progress.',
  [BackupStatusType.NeverAttempted]: 'An image backup has never been attempted.'
};

export const backupStatusTypeSubtitleLabel = {
  [BackupStatusType.Successful]: 'Last backed up on {{formattedDate}}, Sydney Time.',
  [BackupStatusType.Failed]: 'Last attempt failed on {{formattedDate}}, Sydney Time.',
  [BackupStatusType.InProgress]: 'Backup started on {{formattedDate}}, Sydney Time.',
  [BackupStatusType.NeverAttempted]: 'If this server is newly created, you may need to wait until the first scheduled backup occurs.'
};
