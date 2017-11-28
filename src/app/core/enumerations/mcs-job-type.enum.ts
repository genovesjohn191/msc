export enum McsJobType {
  CreateServer = 100001,
  UpdateServer = 100002,
  DeleteServer = 100003,
  CloneServer = 100004,

  // Server Snapshot
  CreateServerSnapshot = 100051,
  ApplyServerSnapshot = 100052,
  DeleteServerSnapshot = 100053,

  // Server Command
  ChangeServerPowerState = 100101,

  // Server Disk Management
  CreateServerDisk = 100151,
  UpdateServerDisk = 100152,
  DeleteServerDisk = 100153,

  // Server Password
  ResetServerPassword = 100201,

  // Server Network Management
  CreateServerNetwork = 100251,
  UpdateServerNetwork = 100252,
  DeleteServerNetwork = 100253,

  // Server Media Management
  AttachServerMedia = 100301,
  DetachServerMedia = 100302
}
