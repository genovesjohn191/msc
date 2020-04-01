import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum VmPowerstateCommand {
  Start = 1,
  Restart = 2,
  Reset = 3,
  Shutdown = 4,
  PowerOff = 5,
  Suspend = 6,
  Resume = 7
}

/**
 * Enumeration serializer and deserializer methods
 */
export class VmPowerstateCommandSerialization
  extends McsEnumSerializationBase<VmPowerstateCommand> {
  constructor() { super(VmPowerstateCommand); }
}
