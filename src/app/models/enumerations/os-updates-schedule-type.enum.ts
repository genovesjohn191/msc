export enum OsUpdatesScheduleType {
  None = 0,
  RunOnce = 1,
  Recurring = 2
}

export const osUpdatesScheduleLabel = {
  [OsUpdatesScheduleType.None]: 'No update schedule configured.',
  [OsUpdatesScheduleType.RunOnce]: 'You have an update schedule configured.',
  [OsUpdatesScheduleType.Recurring]: 'You have an update schedule configured.',
};

export const osUpdatesScheduleSubtitleLabel = {
  [OsUpdatesScheduleType.RunOnce]: 'This {{scheduleDate}}.',
  [OsUpdatesScheduleType.Recurring]: 'Every {{scheduleDate}}.'
};

export const osUpdatesScheduleWarningLabel = {
  [OsUpdatesScheduleType.RunOnce]: 'Once this job is complete, you will need to set up a new update schedule.'
};


