export enum OsUpdatesPatchStatus {
  Unanalysed = 0,
  Analysing = 1,
  Updated = 2,
  Outdated = 3,
  Updating = 4,
  Error = 5
}

export const osUpdatesStatusLabel = {
  [OsUpdatesPatchStatus.Updated]: 'Your operating system is up to date.',
  [OsUpdatesPatchStatus.Outdated]: 'Your operating system is not up to date.',
  [OsUpdatesPatchStatus.Analysing]: 'We are inspecting your operating system.',
  [OsUpdatesPatchStatus.Updating]: 'We are updating your operating system.',
  [OsUpdatesPatchStatus.Unanalysed]: 'Your operating system may not be up to date.',
  [OsUpdatesPatchStatus.Error]: 'Unable to retrieve OS update information.',
};

export const osUpdatesStatusSubtitleLabel = {
  [OsUpdatesPatchStatus.Updated]: 'Last inspected {{formattedDate}}, Sydney time.',
  [OsUpdatesPatchStatus.Outdated]: 'Last inspected {{formattedDate}}, Sydney time.',
  [OsUpdatesPatchStatus.Analysing]: 'OS update information will be available shortly.',
  [OsUpdatesPatchStatus.Updating]: 'Started on {{formattedDate}}, Sydney time.',
  [OsUpdatesPatchStatus.Unanalysed]: 'Your operating system has never been inspected.',
  [OsUpdatesPatchStatus.Error]: 'Last inspected {{formattedDate}}, Sydney time.',
};

export const osUpdatesScheduleConfigureHoverLabel = {
  [OsUpdatesPatchStatus.Analysing]: 'Inspection in progress.',
  [OsUpdatesPatchStatus.Updating]: 'Update in progress.',
};
