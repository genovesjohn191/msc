export enum OsUpdatesPatchStatus {
  Unanalysed = 1,
  Analysing = 2,
  AnalysingFirstTime = 3,
  Updated = 4,
  Outdated = 5,
  Updating = 6,
  Error = 7
}

export const osUpdatesStatusLabel = {
  [OsUpdatesPatchStatus.Updated]: 'Your operating system is up to date.',
  [OsUpdatesPatchStatus.Outdated]: 'Your operating system is not up to date.',
  [OsUpdatesPatchStatus.Analysing]: 'We are inspecting your operating system.',
  [OsUpdatesPatchStatus.AnalysingFirstTime]: 'We are inspecting your operating system.',
  [OsUpdatesPatchStatus.Updating]: 'We are updating your operating system.',
  [OsUpdatesPatchStatus.Unanalysed]: 'Your operating system may not be up to date.',
  [OsUpdatesPatchStatus.Error]: 'Unable to retrieve updates information.',
};

export const osUpdatesStatusSubtitleLabel = {
  [OsUpdatesPatchStatus.Updated]: 'Last inspected {{formattedDate}}, Sydney Time.',
  [OsUpdatesPatchStatus.Outdated]: 'Last inspected {{formattedDate}}, Sydney Time.',
  [OsUpdatesPatchStatus.Analysing]: 'Last inspected {{formattedDate}}, Sydney Time.',
  [OsUpdatesPatchStatus.AnalysingFirstTime]: 'Last inspected never.',
  [OsUpdatesPatchStatus.Updating]: 'Started on {{formattedDate}}, Sydney Time.',
  [OsUpdatesPatchStatus.Unanalysed]: 'Your operating system has never been inspected.',
  [OsUpdatesPatchStatus.Error]: 'Last inspected {{formattedDate}}, Sydney Time.',
};

export const osUpdatesScheduleConfigureHoverLabel = {
  [OsUpdatesPatchStatus.Analysing]: 'Inspection in progress.',
  [OsUpdatesPatchStatus.AnalysingFirstTime]: 'Inspection in progress.',
  [OsUpdatesPatchStatus.Updating]: 'Update in progress.',
};
