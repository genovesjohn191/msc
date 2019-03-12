export enum OsUpdatesStatus {
  Unanalysed = 1,
  Analysing = 2,
  Updated = 3,
  Outdated = 4,
  Updating = 5,
  Error = 6
}

export const osUpdatesStatusLabel = {
  [OsUpdatesStatus.Updated]: 'Your operating system is up to date.',
  [OsUpdatesStatus.Outdated]: 'Your operating system is not up to date.',
  [OsUpdatesStatus.Analysing]: "We're inspecting your operating system.",
  [OsUpdatesStatus.Updating]: "We're updating your operating system.",
  [OsUpdatesStatus.Unanalysed]: 'Your operating system may not be up to date.',
  [OsUpdatesStatus.Error]: 'Unable to retrieve updates information.',
};

export const osUpdatesStatusSubtitleLabel = {
  [OsUpdatesStatus.Updated]: 'Last inspected {{lastInspectDate}}, Sydney Time.',
  [OsUpdatesStatus.Outdated]: 'Last inspected {{lastInspectDate}}, Sydney Time.',
  [OsUpdatesStatus.Analysing]: 'Last inspected never.',
  [OsUpdatesStatus.Updating]: 'Started on {{dateOfStart}}, Sydney Time.',
  [OsUpdatesStatus.Unanalysed]: 'Your operating system has never been inspected.',
  [OsUpdatesStatus.Error]: 'Last inspected {{lastInspectDate}}, Sydney Time.',
};

export const osUpdatesScheduleConfigureHoverLabel = {
  [OsUpdatesStatus.Analysing]: 'Inspection in progress.',
  [OsUpdatesStatus.Updating]: 'Update in progress.',
};
