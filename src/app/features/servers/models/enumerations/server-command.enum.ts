export enum ServerCommand {
  None = 0,
  Start = 1,
  Stop = 2,
  Restart = 3,
  Snapshot = 4,
  Scale = 5,
  Clone = 6,
  Rename = 7,
  Delete = 8,
  AttachMedia = 9,
  Suspend = 10,
  Resume = 11,
  ViewVCloud = 12,

  // Addition commands for server that is not included on the commandlist of API
  ResetVmPassword = 100
}
