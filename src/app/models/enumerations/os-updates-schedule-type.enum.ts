export enum OsUpdatesScheduleType {
  RunOnce = 1,
  Recurring = 2
}

export const osUpdatesScheduleSubtitleLabel = {
  [OsUpdatesScheduleType.RunOnce]: 'This {{scheduleDate}}.',
  [OsUpdatesScheduleType.Recurring]: 'Every {{scheduleDate}}.'
};
