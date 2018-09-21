import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

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

export const serverCommandText = {
  [ServerCommand.None]: 'None',
  [ServerCommand.Start]: 'Start',
  [ServerCommand.Stop]: 'Stop',
  [ServerCommand.Restart]: 'Restart',
  [ServerCommand.Snapshot]: 'Snapshot',
  [ServerCommand.Scale]: 'Scale',
  [ServerCommand.Clone]: 'Clone',
  [ServerCommand.Rename]: 'Rename',
  [ServerCommand.Delete]: 'Delete',
  [ServerCommand.AttachMedia]: 'AttachMedia',
  [ServerCommand.Suspend]: 'Suspend',
  [ServerCommand.Resume]: 'Resume',
  [ServerCommand.ViewVCloud]: 'ViewVCloud'
};

export const serverCommandActiveText = {
  [ServerCommand.Start]: 'Starting',
  [ServerCommand.Stop]: 'Stopping',
  [ServerCommand.Restart]: 'Restarting',
  [ServerCommand.Suspend]: 'Suspending',
  [ServerCommand.Resume]: 'Resuming'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerCommandSerialization')
export class ServerCommandSerialization
  extends McsEnumSerializationBase<ServerCommand> {
  constructor() { super(ServerCommand); }
}
