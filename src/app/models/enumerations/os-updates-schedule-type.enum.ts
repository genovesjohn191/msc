export enum OsUpdatesScheduleType {
  None = null,
  Weekly = 0,
  Monthly = 1,
  Custom = 2
}

export const osUpdatesScheduleTypeText = {
  [OsUpdatesScheduleType.None]: '',
  [OsUpdatesScheduleType.Weekly]: 'WEEKLY',
  [OsUpdatesScheduleType.Monthly]: 'MONTHLY',
  [OsUpdatesScheduleType.Custom]: 'CUSTOM',
};


export const osUpdatesScheduleLabel = {
  [OsUpdatesScheduleType.None]: 'No update schedule configured.',
  [OsUpdatesScheduleType.Weekly]: 'You have an update schedule configured.',
  [OsUpdatesScheduleType.Monthly]: 'You have an update schedule configured.',
  [OsUpdatesScheduleType.Custom]: 'You have an update schedule configured.'
};

export const osUpdatesScheduleSubtitleLabel = {
  [OsUpdatesScheduleType.Weekly]: '{{scheduleDate}}.',
  [OsUpdatesScheduleType.Monthly]: '{{scheduleDate}}.',
  [OsUpdatesScheduleType.Custom]: '{{scheduleDate}}.'
};
